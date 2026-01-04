package sql

import (
	"log/slog"

	"gorm.io/gorm"
)

type ExchangeRatesRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewExchangeRatesRepository(db *gorm.DB, logger *slog.Logger) *ExchangeRatesRepository {
	return &ExchangeRatesRepository{db: db, l: logger}
}

func (r *ExchangeRatesRepository) FindExchangeRates(baseCurrency string) (map[string]float32, error) {
	var exchangeRates []ExchangeRate
	if err := r.db.Where("source_currency = ?", baseCurrency).Find(&exchangeRates).Error; err != nil {
		return nil, err
	}

	rates := make(map[string]float32, len(exchangeRates))
	for _, rate := range exchangeRates {
		rates[rate.TargetCurrency] = rate.Rate
	}

	return rates, nil
}

func (r *ExchangeRatesRepository) FindAllExchangeRates() (map[string]map[string]float32, error) {
	var exchangeRates []ExchangeRate
	if err := r.db.Find(&exchangeRates).Error; err != nil {
		return nil, err
	}

	rates := make(map[string]map[string]float32)
	for _, rate := range exchangeRates {
		if rates[rate.SourceCurrency] == nil {
			rates[rate.SourceCurrency] = make(map[string]float32)
		}
		rates[rate.SourceCurrency][rate.TargetCurrency] = rate.Rate
	}

	return rates, nil
}
