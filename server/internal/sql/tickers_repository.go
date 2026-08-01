package sql

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type TickersRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewTickersRepository(db *gorm.DB, logger *slog.Logger) *TickersRepository {
	return &TickersRepository{db: db, l: logger}
}

func (r *TickersRepository) Create(ticker domain.Ticker) error {
	b := &bytes.Buffer{}
	err := json.NewEncoder(b).Encode(ticker.HistoricalData)
	if err != nil {
		return err
	}

	dateFmt := "2006-01-02 15:04"
	dateKey, _ := time.Parse(dateFmt, time.Now().Format(dateFmt))
	dbTicker := Ticker{
		Ticker:               ticker.Ticker,
		DateKey:              dateKey,
		Name:                 ticker.Name,
		ChangeRate:           ticker.ChangeRate,
		Price:                ticker.Price,
		YearlyDividendValue:  ticker.YearlyDividendValue,
		YearlyDividendYield:  ticker.YearlyDividendYield,
		NextDividendValue:    ticker.NextDividendValue,
		NextDividendYield:    ticker.NextDividendYield,
		Website:              ticker.Website,
		Sector:               ticker.Sector,
		Country:              ticker.Country,
		Industry:             ticker.Industry,
		IsEtf:                ticker.IsEtf,
		MonthlyPriceRangeMin: ticker.MonthlyPriceRange.Min,
		MonthlyPriceRangeMax: ticker.MonthlyPriceRange.Max,
		YearlyPriceRangeMin:  ticker.YearlyPriceRange.Min,
		YearlyPriceRangeMax:  ticker.YearlyPriceRange.Max,
		HistoricalData:       b.String(),
		Currency:             ticker.Currency,
	}

	if ticker.ExDividendDate != nil {
		edd := time.Time(*ticker.ExDividendDate)
		dbTicker.ExDividendDate = &edd
	}
	if ticker.DividendPaymentDate != nil {
		dpd := time.Time(*ticker.DividendPaymentDate)
		dbTicker.DividendPaymentDate = &dpd
	}
	earningDates := []time.Time{}
	for _, ed := range ticker.EarningDates {
		t := time.Time(ed)
		earningDates = append(earningDates, t)
	}
	dbTicker.EarningDates = earningDates

	if err := r.db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(&dbTicker).Error; err != nil {
		r.l.Error("Failed to create ticker", "error", err.Error())
		return err
	}
	return nil
}

const findTickersQuery = `
WITH _RATES AS (
	SELECT
		SOURCE_CURRENCY,
		RATE
	FROM EXCHANGE_RATES
	WHERE TARGET_CURRENCY = ?
),
_LATEST_TICKERS AS (
    SELECT *
    FROM (
        SELECT 
            *, 
            ROW_NUMBER() OVER (PARTITION BY TICKER ORDER BY DATE_KEY DESC) AS RN
        FROM TICKERS
        WHERE TICKER IN ? -- Drastic reduction in data processed
    ) t
    WHERE RN = 1
)
SELECT
	_LATEST_TICKERS.TICKER AS ticker,
	_LATEST_TICKERS.DATE_KEY AS date_key,
	_LATEST_TICKERS.PRICE * _RATES.RATE AS price,
	_LATEST_TICKERS.NAME AS name,
	_LATEST_TICKERS.CHANGE_RATE AS change_rate,
	_LATEST_TICKERS.YEARLY_DIVIDEND_YIELD AS yearly_dividend_yield,
	_LATEST_TICKERS.NEXT_DIVIDEND_YIELD AS next_dividend_yield,
	_LATEST_TICKERS.NEXT_DIVIDEND_VALUE * _RATES.RATE AS next_dividend_value,
	_LATEST_TICKERS.YEARLY_DIVIDEND_VALUE * _RATES.RATE AS yearly_dividend_value,
	_LATEST_TICKERS.WEBSITE AS website,
	? AS currency,
	_LATEST_TICKERS.EX_DIVIDEND_DATE AS ex_dividend_date,
	_LATEST_TICKERS.DIVIDEND_PAYMENT_DATE AS dividend_payment_date,
	_LATEST_TICKERS.EARNING_DATES AS earning_dates,
	_LATEST_TICKERS.SECTOR AS sector,
	_LATEST_TICKERS.COUNTRY AS country,
	_LATEST_TICKERS.INDUSTRY AS industry,
	_LATEST_TICKERS.IS_ETF AS is_ETF,
	_LATEST_TICKERS.MONTHLY_PRICE_RANGE_MIN * _RATES.RATE AS monthly_price_range_min,
	_LATEST_TICKERS.MONTHLY_PRICE_RANGE_MAX * _RATES.RATE AS monthly_price_range_max,
	_LATEST_TICKERS.YEARLY_PRICE_RANGE_MIN * _RATES.RATE AS yearly_price_range_min,
	_LATEST_TICKERS.YEARLY_PRICE_RANGE_MAX * _RATES.RATE AS yearly_price_range_max,
	_LATEST_TICKERS.HISTORICAL_DATA AS historical_data
FROM _LATEST_TICKERS
LEFT JOIN _RATES ON _RATES.SOURCE_CURRENCY = _LATEST_TICKERS.CURRENCY;
`

func (r *TickersRepository) FindByTicker(ticker string, preferredCurrency *string) (domain.Ticker, error) {
	var dbTickers []Ticker
	if err := r.db.Raw(findTickersQuery, preferredCurrency, []string{ticker}, preferredCurrency).Scan(&dbTickers).Error; err != nil {
		return domain.Ticker{}, err
	}
	if len(dbTickers) != 1 {
		return domain.Ticker{}, fmt.Errorf("ticker %s not found", ticker)
	}

	dbTicker := dbTickers[0]

	return dbTickerToDomain(dbTicker)
}

func (r *TickersRepository) FindMultipleTickers(tickers []string, preferredCurrency *string) (map[string]domain.Ticker, error) {
	var dbTickers []Ticker
	if err := r.db.Raw(findTickersQuery, preferredCurrency, tickers, preferredCurrency).Scan(&dbTickers).Error; err != nil {
		return nil, err
	}

	tickersMap := make(map[string]domain.Ticker, len(dbTickers))
	for _, dbTicker := range dbTickers {
		ticker, err := dbTickerToDomain(dbTicker)
		if err != nil {
			return nil, err
		}
		tickersMap[ticker.Ticker] = ticker
	}
	return tickersMap, nil
}

func (r *TickersRepository) Exists(ticker string) (bool, error) {
	var count int64
	if err := r.db.Model(&Ticker{}).Where("ticker = ?", ticker).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func dbTickerToDomain(dbTicker Ticker) (domain.Ticker, error) {
	var historicalData []domain.HistoricalEntry
	if err := json.NewDecoder(strings.NewReader(dbTicker.HistoricalData)).Decode(&historicalData); err != nil {
		return domain.Ticker{}, err
	}

	var exDividendDate *domain.Date
	if dbTicker.ExDividendDate != nil {
		edd := domain.Date(*dbTicker.ExDividendDate)
		exDividendDate = &edd
	}

	var dividendPaymentDate *domain.Date
	if dbTicker.DividendPaymentDate != nil {
		dpd := domain.Date(*dbTicker.DividendPaymentDate)
		dividendPaymentDate = &dpd
	}

	earningDates := []domain.DateWithTime{}
	for _, ed := range dbTicker.EarningDates {
		earningDates = append(earningDates, domain.DateWithTime(ed))
	}

	return domain.Ticker{
		Ticker:              dbTicker.Ticker,
		Name:                dbTicker.Name,
		Price:               dbTicker.Price,
		ChangeRate:          dbTicker.ChangeRate,
		YearlyDividendValue: dbTicker.YearlyDividendValue,
		YearlyDividendYield: dbTicker.YearlyDividendYield,
		NextDividendValue:   dbTicker.NextDividendValue,
		NextDividendYield:   dbTicker.NextDividendYield,
		Website:             dbTicker.Website,
		Sector:              dbTicker.Sector,
		Country:             dbTicker.Country,
		Industry:            dbTicker.Industry,
		IsEtf:               dbTicker.IsEtf,
		MonthlyPriceRange:   domain.PriceRange{Min: dbTicker.MonthlyPriceRangeMin, Max: dbTicker.MonthlyPriceRangeMax},
		YearlyPriceRange:    domain.PriceRange{Min: dbTicker.YearlyPriceRangeMin, Max: dbTicker.YearlyPriceRangeMax},
		HistoricalData:      historicalData,
		ExDividendDate:      exDividendDate,
		DividendPaymentDate: dividendPaymentDate,
		EarningDates:        earningDates,
	}, nil
}
