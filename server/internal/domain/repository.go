package domain

type BuysRepository interface {
	Create(buy Buy, userEmail string) (*BuyWithId, error)
	FindAll(userEmail string) (Buys, error)
	Delete(id string, userEmail string) error
}

type DividendsRepository interface {
	Create(dividend Dividend, userEmail string) (*DividendWithId, error)
	FindAll(userEmail string) (Dividends, error)
	FindAllPreferredCurrency(userEmail string) (Dividends, error)
	Delete(id string, userEmail string) error
}

type UserRepository interface {
	Create(user User) (*UserWithId, error)
	FindByEmail(email string) (*UserWithId, error)
	FindByID(id string) (*UserWithId, error)
	UpdatePreferences(id string, preferedCurrency string) error
}

type AssetsRepository interface {
	FindAll(userEmail string) (Assets, error)
	FindEvents(userEmail string) (EventCalendar, error)
}

type CurrencyRepository interface {
	FindExchangeRates(baseCurrency string) (map[string]float32, error)
	FindAllExchangeRates() (map[string]map[string]float32, error)
}

type TickersRepository interface {
	FindByTicker(ticker string, currency string) (Ticker, error)
	FindMultipleTickers(tickers []string, currency string) (map[string]Ticker, error)
}
