package infra_http

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/judedaryl/go-arrayutils"
)

type TickerRepository struct {
	baseUrl string
	cr      domain.CurrencyRepository
	l       *slog.Logger
}

func NewTickerRepository(baseUrl string, currencyRepository domain.CurrencyRepository, logger *slog.Logger) *TickerRepository {
	return &TickerRepository{baseUrl: baseUrl, cr: currencyRepository, l: logger}
}

func (r *TickerRepository) FindByTicker(ticker string, currency string) (domain.Ticker, error) {
	url := fmt.Sprintf("%s/%s?history_resample=month&history_start=%s", r.baseUrl, ticker, time.Now().AddDate(-1, 0, 0).Format("2006-01-02"))
	r.l.Debug("Fetching ticker", "url", url)

	resp, err := http.Get(url)
	if err != nil {
		r.l.Error("Failed to fetch ticker", "error", err.Error())
		return domain.Ticker{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return domain.Ticker{}, errors.New("could not find ticker")
	}

	t := &domain.Ticker{}
	if err := t.FromJSON(resp.Body); err != nil {
		r.l.Error("Failed to parse ticker", "error", err.Error())
		return domain.Ticker{}, err
	}
	r.l.Debug("Fetched ticker", "ticker", t.Ticker)

	return r.mapper(*t, currency)
}

func (r *TickerRepository) FindMultipleTickers(tickers []string, currency string) (map[string]domain.Ticker, error) {
	historyStartDate := time.Now().AddDate(-1, 0, 0)
	url := fmt.Sprintf("%s/%s?history_resample=month&history_start=%s", r.baseUrl, strings.Join(tickers, ","), historyStartDate.Format("2006-01-02"))
	r.l.Debug("Fetching tickers", "url", url)

	resp, err := http.Get(url)
	if err != nil {
		r.l.Error("Failed to fetch tickers", "error", err.Error())
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		r.l.Error("Failed to fetch tickers", "status", resp.StatusCode)
		return nil, errors.New("could not find tickers")
	}

	ts := &domain.Tickers{}
	if err := ts.FromJSON(resp.Body); err != nil {
		r.l.Error("Failed to parse tickers", "error", err.Error())
		return nil, err
	}

	tickersMap := map[string]domain.Ticker{}
	for _, t := range *ts {
		t, err := r.mapper(t, currency)
		if err != nil {
			return nil, err
		}
		tickersMap[t.Ticker] = t
	}
	r.l.Debug("Fetched tickers", "tickers", tickersMap)
	return tickersMap, nil
}

func (r *TickerRepository) mapper(ticker domain.Ticker, currency string) (domain.Ticker, error) {
	if ticker.Country == "United States" {
		ticker.Country = "US"
	}

	ticker.Currency = tickerCurrencyMapper(ticker.Currency)
	if ticker.Currency == domain.GBP {
		ticker.Price = ticker.Price / 100
		ticker.NextDividendValue = ticker.NextDividendValue / 100
		// ticker.YearlyDividendValue = ticker.YearlyDividendValue / 100
		ticker.MonthlyPriceRange.Min = ticker.MonthlyPriceRange.Min / 100
		ticker.MonthlyPriceRange.Max = ticker.MonthlyPriceRange.Max / 100
		ticker.YearlyPriceRange.Min = ticker.YearlyPriceRange.Min / 100
		ticker.YearlyPriceRange.Max = ticker.YearlyPriceRange.Max / 100
		ticker.HistoricalData = arrayutils.Map(ticker.HistoricalData, func(value domain.HistoricalEntry) domain.HistoricalEntry {
			return domain.HistoricalEntry{
				Date:  value.Date,
				Price: value.Price / 100,
			}
		})
	}
	fmt.Println(ticker)
	// Convert the price to the preferred currency
	exchangeRates, err := r.cr.FindAllExchangeRates()
	if err != nil {
		return domain.Ticker{}, err
	}

	if currency == ticker.Currency {
		return ticker, nil
	}

	er := exchangeRates[ticker.Currency][currency]
	ticker.Currency = currency
	ticker.Price = ticker.Price * er
	ticker.NextDividendValue = ticker.NextDividendValue * er
	ticker.YearlyDividendValue = ticker.YearlyDividendValue * er

	return ticker, nil
}

type CurrencyRepository struct {
	baseUrl string
	l       *slog.Logger
}

func NewCurrencyRepository(baseUrl string, logger *slog.Logger) *CurrencyRepository {
	return &CurrencyRepository{baseUrl: baseUrl, l: logger}
}

func (r *CurrencyRepository) FindExchangeRates(baseCurrency string) (map[string]float32, error) {
	var currency string
	if baseCurrency == domain.USD {
		currency = "USD"
	} else if baseCurrency == domain.EUR {
		currency = "EUR"
	} else if baseCurrency == domain.GBP {
		currency = "GBP"
	} else {
		return nil, errors.New("currency not supported")
	}

	url := fmt.Sprintf("%s/%s", r.baseUrl, currency)
	r.l.Debug("Fetching exchange rates", "url", url)
	resp, err := http.Get(url)
	if err != nil {
		r.l.Error("Failed to fetch exchange rates", "error", err.Error())
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		r.l.Error("Failed to fetch exchange rates", "status", resp.StatusCode)
		return nil, errors.New("could not find exchange rates")
	}

	var exchangeRates struct {
		ConversionRates map[string]float32 `json:"conversion_rates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&exchangeRates); err != nil {
		return nil, err
	}

	resultingRates := map[string]float32{
		domain.USD: exchangeRates.ConversionRates["USD"],
		domain.EUR: exchangeRates.ConversionRates["EUR"],
		domain.GBP: exchangeRates.ConversionRates["GBP"],
	}
	r.l.Debug("Fetched exchange rates", "rates", resultingRates)
	return resultingRates, nil
}

func (r *CurrencyRepository) FindAllExchangeRates() (map[string]map[string]float32, error) {
	exchangeRates := map[string]map[string]float32{}
	currencies := []string{domain.EUR, domain.GBP, domain.USD}
	errChan := make(chan error, len(currencies))
	ratesChan := make(chan struct {
		currency string
		rates    map[string]float32
	}, len(currencies))

	for _, currency := range currencies {
		go func(currency string) {
			rates, err := r.FindExchangeRates(currency)
			if err != nil {
				errChan <- err
				return
			}
			ratesChan <- struct {
				currency string
				rates    map[string]float32
			}{currency, rates}
		}(currency)
	}

	for i := 0; i < len(currencies); i++ {
		select {
		case err := <-errChan:
			// Handle the error appropriately, e.g., log it or return it
			// For now, we'll just log it
			return nil, err
		case result := <-ratesChan:
			exchangeRates[result.currency] = result.rates
		}
	}

	return exchangeRates, nil
}

func tickerCurrencyMapper(tickerCurrency string) string {
	switch tickerCurrency {
	case "GBp":
		return domain.GBP
	case "USD":
		return domain.USD
	case "EUR":
		return domain.EUR
	default:
		return domain.USD
	}
}
