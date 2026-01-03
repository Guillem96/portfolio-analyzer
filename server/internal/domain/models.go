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
	Taxes          float32 `json:"taxes" validate:"gte=0"`
	Fee            float32 `json:"fee" validate:"gte=0"`
	Amount         float32 `json:"amount" validate:"gte=0"`
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

type Sell struct {
	Units            float32 `json:"units" validate:"gt=0"`
	Ticker           string  `json:"ticker" validate:"required"`
	AcquisitionValue float32 `json:"acquisitionValue" validate:"gt=0"`
	Amount           float32 `json:"amount" validate:"gt=0"`
	Currency         string  `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
	Date             Date    `json:"date" validate:"required"`
	Fees             float32 `json:"fees" validate:"gte=0"`
	AccumulatedFees  float32 `json:"accumulatedFees" validate:"gte=0"`
}

func (s Sell) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(s)
}

func (s *Sell) FromJSON(r io.Reader) error {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	return decoder.Decode(&s)
}

func (s Sell) Validate() error {
	validate = validator.New()
	return validate.Struct(s)
}

type SellWithId struct {
	Id string `json:"id"`
	Sell
}

type Sells []SellWithId

func (s SellWithId) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(s)
}

func (ss Sells) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(ss)
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
	Ticker                             Ticker  `json:"ticker"`
	Name                               string  `json:"name"`
	BuyValue                           float32 `json:"buyValue"`
	ReinvestedBuyValue                 float32 `json:"reinvestedBuyValue"`
	Value                              float32 `json:"value"`
	ValueWithoutReinvest               float32 `json:"valueWithoutReinvest"`
	Units                              float32 `json:"units"`
	UnitsWithoutReinvest               float32 `json:"unitsWithoutReinvest"`
	Country                            string  `json:"country"`
	Sector                             string  `json:"sector"`
	AverageStockPrice                  float32 `json:"averageStockPrice"`
	AverageStockPriceWithoutReinvest   float32 `json:"averageStockPriceWithoutReinvest"`
	YieldWithRespectBuy                float32 `json:"yieldWithRespectBuy"`
	YieldWithRespectBuyWithoutReinvest float32 `json:"yieldWithRespectBuyWithoutReinvest"`
	YieldWithRespectValue              float32 `json:"yieldWithRespectValue"`
	LastBuyDate                        Date    `json:"lastBuyDate"`
	Currency                           string  `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
}

type Assets []Asset

func (as Assets) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(as)
}

type PriceRange struct {
	Min float32 `json:"min"`
	Max float32 `json:"max"`
}

type HistoricalEntry struct {
	Date  Date    `json:"date"`
	Price float32 `json:"price"`
}

type Ticker struct {
	Ticker              string            `json:"ticker"`
	ChangeRate          float32           `json:"change_rate"`
	Price               float32           `json:"price"`
	Name                string            `json:"name"`
	YearlyDividendYield float32           `json:"yearly_dividend_yield"`
	NextDividendYield   float32           `json:"next_dividend_yield"`
	YearlyDividendValue float32           `json:"yearly_dividend_value"`
	NextDividendValue   float32           `json:"next_dividend_value"`
	Currency            string            `json:"currency" validate:"required,eq=EUR|eq=USD|eq=GBp"`
	Sector              string            `json:"sector"`
	Website             string            `json:"website"`
	Country             string            `json:"country"`
	Industry            string            `json:"industry"`
	IsEtf               bool              `json:"is_etf"`
	ExDividendDate      *Date             `json:"ex_dividend_date"`
	DividendPaymentDate *Date             `json:"dividend_payment_date"`
	EarningDates        []DateWithTime    `json:"earning_dates"`
	MonthlyPriceRange   PriceRange        `json:"monthly_price_range"`
	YearlyPriceRange    PriceRange        `json:"yearly_price_range"`
	HistoricalData      []HistoricalEntry `json:"historical_data"`
}

type SimplifiedTicker struct {
	Ticker  string `json:"ticker"`
	Name    string `json:"name"`
	Website string `json:"website"`
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
	Date                 Date    `json:"date"`
	Value                float32 `json:"value"`
	ValueWithoutReinvest float32 `json:"valueWithoutReinvest"`
	BuyValue             float32 `json:"buyValue"`
	Currency             string  `json:"currency"`
	Rate                 float32 `json:"rate"`
	RateWithoutReinvest  float32 `json:"rateWithoutReinvest"`
}

type PortfolioHistoric []HistoricEntry

func (ph PortfolioHistoric) ToJSON(w io.Writer) error {
	encoder := json.NewEncoder(w)
	return encoder.Encode(ph)
}
