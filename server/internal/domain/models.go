package domain

import (
	"encoding/json"
	"io"

	"github.com/go-playground/validator"
)

// use a single instance of Validate, it caches struct info
var validate *validator.Validate

type Buy struct {
	Units          float32 `json:"units" validate:"gt=0"`
	Ticker         string  `json:"ticker" validate:"required"`
	Amount         float32 `json:"amount" validate:"gt=0"`
	Currency       string  `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
	IsReinvestment bool    `json:"isDividendReinvestment"`
	Date           Date    `json:"date" validate:"required"`
}

func (b Buy) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(b)
}

func (b *Buy) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	return decoder.Decode(&b)
}

func (b Buy) Validate() error {
	validate = validator.New()
	return validate.Struct(b)
}

type BuyWithId struct {
	Id string `json:"id"`
	Buy
}

type Buys []BuyWithId

func (b BuyWithId) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(b)
}

func (bs Buys) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(bs)
}

type Dividend struct {
	Company                   string  `json:"company" validate:"required"`
	Country                   string  `json:"country" validate:"required"`
	Amount                    float32 `json:"amount" validate:"required,gt=0"`
	Currency                  string  `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
	DoubleTaxationOrigin      float32 `json:"doubleTaxationOrigin" validate:"gte=0"`
	DoubleTaxationDestination float32 `json:"doubleTaxationDestination" validate:"gte=0"`
	IsReinvested              bool    `json:"isReinvested"`
	Date                      Date    `json:"date" validate:"required"`
}

func (d Dividend) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(d)
}

func (d *Dividend) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	return decoder.Decode(&d)
}

func (d Dividend) Validate() error {
	validate = validator.New()
	return validate.Struct(d)
}

type DividendWithId struct {
	Id string `json:"id"`
	Dividend
}

type Dividends []DividendWithId

func (d DividendWithId) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(d)
}

func (ds Dividends) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(ds)
}

type User struct {
	Email             string  `json:"email"`
	Name              string  `json:"name"`
	Picture           string  `json:"picture"`
	PreferredCurrency *string `json:"preferredCurrency"`
}

type UserWithId struct {
	Id string `json:"id"`
	User
}

func (d *User) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&d); err != nil {
		return err
	}

	if d.PreferredCurrency == nil {
		currency := USD
		d.PreferredCurrency = &currency
	}

	return nil
}

func (d UserWithId) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(d)
}

type Asset struct {
	Ticker                Ticker  `json:"ticker"`
	Name                  string  `json:"name"`
	BuyValue              float32 `json:"buyValue"`
	Value                 float32 `json:"value"`
	Units                 float32 `json:"units"`
	Country               string  `json:"country"`
	Sector                string  `json:"sector"`
	AverageStockPrice     float32 `json:"averageStockPrice"`
	YieldWithRespectBuy   float32 `json:"yieldWithRespectBuy"`
	YieldWithRespectValue float32 `json:"yieldWithRespectValue"`
	LastBuyDate           Date    `json:"lastBuyDate"`
	Currency              string  `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
}

type Assets []Asset

func (as Assets) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(as)
}

type Ticker struct {
	Ticker              string         `json:"ticker"`
	Price               float32        `json:"price"`
	Name                string         `json:"name"`
	YearlyDividendYield float32        `json:"yearly_dividend_yield"`
	NextDividendYield   float32        `json:"next_dividend_yield"`
	YearlyDividendValue float32        `json:"yearly_dividend_value"`
	NextDividendValue   float32        `json:"next_dividend_value"`
	Currency            string         `json:"currency" validate:"required,eq=EUR|eq=USD|eq=GBp"`
	Sector              string         `json:"sector"`
	Website             string         `json:"website"`
	Country             string         `json:"country"`
	Industry            string         `json:"industry"`
	IsEtf               bool           `json:"is_etf"`
	ExDividendDate      *Date          `json:"ex_dividend_date"`
	EarningDates        []DateWithTime `json:"earning_dates"`
}

type Tickers []Ticker

func (t Ticker) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(t)
}

func (t *Ticker) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	return decoder.Decode(&t)
}

func (ts *Tickers) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	return decoder.Decode(&ts)
}

type FinancialEvent struct {
	Ticker    Ticker                 `json:"ticker"`
	EventType string                 `json:"eventType"`
	ExtraData map[string]interface{} `json:"extraData"`
}

type EventCalendar map[Date][]FinancialEvent

func (ec EventCalendar) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	vjm := map[string][]FinancialEvent{}
	for k, v := range ec {
		vjm[k.String()] = v
	}
	return encoder.Encode(vjm)
}

type HistoricEntry struct {
	Date     Date    `json:"date"`
	Value    float32 `json:"value"`
	BuyValue float32 `json:"buyValue"`
	Currency string  `json:"currency"`
	Rate     float32 `json:"rate"`
}

type PortfolioHistoric []HistoricEntry

func (ph PortfolioHistoric) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(ph)
}
