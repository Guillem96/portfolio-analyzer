package sql

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/google/uuid"
	"github.com/judedaryl/go-arrayutils"
	"gorm.io/gorm"
)

type BuysRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewBuysRepository(db *gorm.DB, logger *slog.Logger) *BuysRepository {
	return &BuysRepository{db: db, l: logger}
}

func (r *BuysRepository) Create(buy domain.Buy, userEmail string) (*domain.BuyWithId, error) {
	id := uuid.New().String()
	dbBuy := Buy{
		ID:             id,
		UserEmail:      userEmail,
		Units:          buy.Units,
		Ticker:         buy.Ticker,
		Taxes:          buy.Taxes,
		Fee:            buy.Fee,
		Amount:         buy.Amount,
		Currency:       buy.Currency,
		IsReinvestment: buy.IsReinvestment,
		Date:           time.Time(buy.Date),
	}
	if err := r.db.Create(&dbBuy).Error; err != nil {
		r.l.Error("Failed to create buy", "error", err.Error())
		return nil, err
	}
	return &domain.BuyWithId{
		Id:  id,
		Buy: buy,
	}, nil
}

func (r *BuysRepository) FindAll(userEmail string) (domain.Buys, error) {
	dbBuys := []Buy{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbBuys).Error; err != nil {
		return nil, err
	}

	buys := make([]domain.BuyWithId, len(dbBuys))
	for i, dbBuy := range dbBuys {
		buys[i] = domain.BuyWithId{
			Id: dbBuy.ID,
			Buy: domain.Buy{
				Units:          dbBuy.Units,
				Ticker:         dbBuy.Ticker,
				Taxes:          dbBuy.Taxes,
				Fee:            dbBuy.Fee,
				Amount:         dbBuy.Amount,
				Currency:       dbBuy.Currency,
				IsReinvestment: dbBuy.IsReinvestment,
				Date:           domain.Date(dbBuy.Date),
			},
		}
	}

	return buys, nil
}

func (r *BuysRepository) FindByTicker(ticker string, userEmail string) (domain.Buys, error) {
	dbBuys := []Buy{}
	if err := r.db.Where("user_email = ? AND ticker = ?", userEmail, ticker).Find(&dbBuys).Order("date asc").Error; err != nil {
		return nil, err
	}

	buys := make([]domain.BuyWithId, len(dbBuys))
	for i, dbBuy := range dbBuys {
		buys[i] = domain.BuyWithId{
			Id: dbBuy.ID,
			Buy: domain.Buy{
				Units:          dbBuy.Units,
				Ticker:         dbBuy.Ticker,
				Fee:            dbBuy.Fee,
				Taxes:          dbBuy.Taxes,
				Amount:         dbBuy.Amount,
				Currency:       dbBuy.Currency,
				IsReinvestment: dbBuy.IsReinvestment,
				Date:           domain.Date(dbBuy.Date),
			},
		}
	}

	return buys, nil
}

func (r *BuysRepository) Delete(id string, userEmail string) error {
	return r.db.Where("id = ? AND user_email = ?", id, userEmail).Delete(&Buy{}).Error
}

type DividendsRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewDividendsRepository(db *gorm.DB, logger *slog.Logger) *DividendsRepository {
	return &DividendsRepository{db: db, l: logger}
}

func (r *DividendsRepository) Create(dividend domain.Dividend, userEmail string) (*domain.DividendWithId, error) {
	id := uuid.New().String()
	dbDividend := Dividend{
		ID:                        id,
		UserEmail:                 userEmail,
		Company:                   dividend.Company,
		Country:                   dividend.Country,
		Amount:                    dividend.Amount,
		Currency:                  dividend.Currency,
		DoubleTaxationOrigin:      dividend.DoubleTaxationOrigin,
		DoubleTaxationDestination: dividend.DoubleTaxationDestination,
		Date:                      time.Time(dividend.Date),
	}
	if err := r.db.Create(&dbDividend).Error; err != nil {
		return nil, err
	}
	return &domain.DividendWithId{
		Id:       id,
		Dividend: dividend,
	}, nil
}

func (r *DividendsRepository) FindAll(userEmail string) (domain.Dividends, error) {
	dbDividends := []Dividend{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbDividends).Error; err != nil {
		return nil, err
	}

	dividends := make([]domain.DividendWithId, len(dbDividends))
	for i, dbDividend := range dbDividends {
		dividends[i] = domain.DividendWithId{
			Id: dbDividend.ID,
			Dividend: domain.Dividend{
				Company:                   dbDividend.Company,
				Amount:                    dbDividend.Amount,
				Country:                   dbDividend.Country,
				Currency:                  dbDividend.Currency,
				DoubleTaxationOrigin:      dbDividend.DoubleTaxationOrigin,
				DoubleTaxationDestination: dbDividend.DoubleTaxationDestination,
				Date:                      domain.Date(dbDividend.Date),
				IsReinvested:              dbDividend.IsReinvested,
			},
		}
	}

	return dividends, nil
}

func (r *DividendsRepository) FindAllPreferredCurrency(userEmail string) (domain.Dividends, error) {
	dbDividends := []Dividend{}
	err := r.db.Raw(`
	WITH _USER AS (
		SELECT
			PREFERRED_CURRENCY
		FROM USERS
		WHERE EMAIL = ?
	),
	
	_RATES AS (
		SELECT
			SOURCE_CURRENCY,
			RATE
		FROM EXCHANGE_RATES
		WHERE TARGET_CURRENCY = (SELECT PREFERRED_CURRENCY FROM _USER)
	)
	SELECT
		DIVIDENDS.*,
		AMOUNT * _RATES.RATE AS TOTAL_AMOUNT
	FROM DIVIDENDS
	INNER JOIN _RATES ON _RATES.SOURCE_CURRENCY = DIVIDENDS.CURRENCY
	WHERE USER_EMAIL = ? AND DIVIDENDS.DELETED_AT IS NULL
	`, userEmail, userEmail).Scan(&dbDividends).Error
	if err != nil {
		return nil, err
	}

	dividends := make([]domain.DividendWithId, len(dbDividends))
	for i, dbDividend := range dbDividends {
		dividends[i] = domain.DividendWithId{
			Id: dbDividend.ID,
			Dividend: domain.Dividend{
				Company:                   dbDividend.Company,
				Amount:                    dbDividend.Amount,
				Country:                   dbDividend.Country,
				Currency:                  dbDividend.Currency,
				DoubleTaxationOrigin:      dbDividend.DoubleTaxationOrigin,
				DoubleTaxationDestination: dbDividend.DoubleTaxationDestination,
				IsReinvested:              dbDividend.IsReinvested,
				Date:                      domain.Date(dbDividend.Date),
			},
		}
	}

	return dividends, nil
}

func (r *DividendsRepository) Delete(id string, userEmail string) error {
	return r.db.Where("id = ? AND user_email = ?", id, userEmail).Delete(&Dividend{}).Error
}

func (r *DividendsRepository) UpdateDividends(userEmail string, ids []string, reinvested bool) error {
	return r.db.Model(&Dividend{}).Where("user_email = ? AND id IN ?", userEmail, ids).Update("is_reinvested", reinvested).Error
}

type UsersRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewUsersRepository(db *gorm.DB, logger *slog.Logger) *UsersRepository {
	return &UsersRepository{db: db, l: logger}
}

func (r *UsersRepository) Create(user domain.User) (*domain.UserWithId, error) {
	id := uuid.New().String()

	preferredCurrency := domain.USD
	if user.PreferredCurrency != nil {
		preferredCurrency = *user.PreferredCurrency
	}

	dbUser := User{
		ID:                id,
		Email:             user.Email,
		Picture:           user.Picture,
		PreferredCurrency: preferredCurrency,
	}

	if err := r.db.Create(&dbUser).Error; err != nil {
		return nil, err
	}
	return &domain.UserWithId{
		Id:   id,
		User: user,
	}, nil
}

func (r *UsersRepository) FindByEmail(email string) (*domain.UserWithId, error) {
	dbUser := User{}
	if err := r.db.Where("email = ?", email).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &domain.UserWithId{
		Id: dbUser.ID,
		User: domain.User{
			Email:             dbUser.Email,
			Picture:           dbUser.Picture,
			PreferredCurrency: &dbUser.PreferredCurrency,
		},
	}, nil
}

func (r *UsersRepository) FindByID(id string) (*domain.UserWithId, error) {
	dbUser := User{}
	if err := r.db.Where("id = ?", id).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &domain.UserWithId{
		Id: dbUser.ID,
		User: domain.User{
			Email:             dbUser.Email,
			Picture:           dbUser.Picture,
			PreferredCurrency: &dbUser.PreferredCurrency,
		},
	}, nil
}

func (r *UsersRepository) UpdatePreferences(id string, preferredCurrency string) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("preferred_currency", preferredCurrency).Error
}

type AssetsRepository struct {
	db *gorm.DB
	ur domain.UserRepository
	tr domain.TickersRepository
	l  *slog.Logger
}

type assetsIterimResult struct {
	Ticker             string    `gorm:"column:TICKER"`
	Currency           string    `gorm:"column:CURRENCY"`
	BuyValue           float32   `gorm:"column:BUY_VALUE"`
	ReinvestedBuyValue float32   `gorm:"column:REINVESTED_BUY_VALUE"`
	Units              float32   `gorm:"column:UNITS"`
	ReinvestUnits      float32   `gorm:"column:REINVEST_UNITS"`
	BuyUnits           float32   `gorm:"column:BUY_UNITS"`
	SoldUnits          float32   `gorm:"column:SOLD_UNITS"`
	LastBuyDate        time.Time `gorm:"column:LAST_BUY_DATE"`
}

type interimHistoricResult struct {
	Date                 string  `gorm:"column:DATE"`
	BuyValue             float32 `gorm:"column:BUY_VALUE"`
	Value                float32 `gorm:"column:VALUE"`
	ValueWithoutReinvest float32 `gorm:"column:VALUE_WITHOUT_REINVEST"`
	Currency             string  `gorm:"column:CURRENCY"`
	Rate                 float32 `gorm:"column:RATE"`
	RateWithoutReinvest  float32 `gorm:"column:RATE_WITHOUT_REINVEST"`
}

func NewAssetsRepository(db *gorm.DB, ur domain.UserRepository, tr domain.TickersRepository, logger *slog.Logger) *AssetsRepository {
	return &AssetsRepository{
		db: db,
		ur: ur,
		tr: tr,
		l:  logger,
	}
}

func (r *AssetsRepository) FindAll(userEmail string) (domain.Assets, error) {
	var results []assetsIterimResult

	user, err := r.ur.FindByEmail(userEmail)
	if err != nil {
		return nil, err
	}

	err = r.db.Raw(`
	WITH _RATES AS (
		SELECT
			SOURCE_CURRENCY,
			RATE
		FROM EXCHANGE_RATES
		WHERE TARGET_CURRENCY = ?
	),

	_SOLD_UNITS AS (
		SELECT
			USER_EMAIL,
			TICKER,
			SUM(UNITS) AS TOTAL_UNITS
		FROM SELLS
		WHERE USER_EMAIL = ? AND DELETED_AT IS NULL
		GROUP BY USER_EMAIL, TICKER
	),
	
	_BUYS_SINGLE_CURRENCY AS (
		SELECT
			BUYS.*,
			USERS.PREFERRED_CURRENCY,
			BUYS.AMOUNT * _RATES.RATE AS TOTAL_AMOUNT,
			FEE * _RATES.RATE AS FEE,
			TAXES * _RATES.RATE AS TAXES,
			BUYS.DATE
		FROM BUYS
		INNER JOIN USERS ON BUYS.USER_EMAIL = USERS.EMAIL
		INNER JOIN _RATES ON _RATES.SOURCE_CURRENCY = BUYS.CURRENCY
		WHERE USERS.EMAIL = ? AND BUYS.DELETED_AT IS NULL
	),

	_BUYS_DATE_W_RN AS (
			SELECT
					TICKER,
					DATE,
					ROW_NUMBER() OVER (PARTITION BY TICKER ORDER BY DATE DESC) AS RN
			FROM _BUYS_SINGLE_CURRENCY
	),

	_BUYS_LAST_DATE AS (
			SELECT TICKER, DATE
			FROM _BUYS_DATE_W_RN
			WHERE RN = 1
	),

	_BUYS AS (
		SELECT
			USER_EMAIL,
			TICKER,
			PREFERRED_CURRENCY,
			SUM(UNITS) AS TOTAL_UNITS,
			SUM(TOTAL_AMOUNT + TAXES + FEE) AS TOTAL_AMOUNT
		FROM _BUYS_SINGLE_CURRENCY
		WHERE IS_REINVESTMENT = false
		GROUP BY USER_EMAIL, TICKER, PREFERRED_CURRENCY
	),

	_REINVESTMENTS AS (
		SELECT
			USER_EMAIL,
			TICKER,
			PREFERRED_CURRENCY,
			SUM(UNITS) AS TOTAL_UNITS,
			SUM(TOTAL_AMOUNT + TAXES + FEE) AS TOTAL_AMOUNT
		FROM _BUYS_SINGLE_CURRENCY
		WHERE IS_REINVESTMENT = true
		GROUP BY USER_EMAIL, TICKER, PREFERRED_CURRENCY
	)

	SELECT
		COALESCE(_BUYS.TICKER, _REINVESTMENTS.TICKER) AS TICKER,
		COALESCE(_BUYS.PREFERRED_CURRENCY, _REINVESTMENTS.PREFERRED_CURRENCY) AS CURRENCY,
		COALESCE(_BUYS.TOTAL_AMOUNT, 0) AS BUY_VALUE,
		COALESCE(_BUYS.TOTAL_UNITS, 0) AS BUY_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_AMOUNT, 0) AS REINVESTED_BUY_VALUE,
		COALESCE(_SOLD_UNITS.TOTAL_UNITS, 0) AS SOLD_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_UNITS, 0) AS REINVEST_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_UNITS, 0) + COALESCE(_BUYS.TOTAL_UNITS, 0) AS UNITS,
		_BUYS_LAST_DATE.DATE AS LAST_BUY_DATE
	FROM _BUYS
	FULL OUTER JOIN _REINVESTMENTS ON _BUYS.TICKER = _REINVESTMENTS.TICKER
	LEFT JOIN _BUYS_LAST_DATE ON COALESCE(_BUYS.TICKER, _REINVESTMENTS.TICKER) = _BUYS_LAST_DATE.TICKER
	LEFT JOIN _SOLD_UNITS ON _BUYS.TICKER = _SOLD_UNITS.TICKER
	`, *user.PreferredCurrency, userEmail, userEmail).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return domain.Assets{}, nil
	}

	allTickers := arrayutils.Map(results, func(r assetsIterimResult) string {
		return r.Ticker
	})

	var tickersInfo map[string]domain.Ticker
	if len(allTickers) == 1 {
		ticker, err := r.tr.FindByTicker(allTickers[0], *user.PreferredCurrency)
		if err != nil {
			return nil, err
		}
		tickersInfo = map[string]domain.Ticker{allTickers[0]: ticker}
	} else {
		tickersInfo, err = r.tr.FindMultipleTickers(allTickers, *user.PreferredCurrency)
		if err != nil {
			return nil, err
		}
	}

	assets := arrayutils.Map(results, func(r assetsIterimResult) domain.Asset {
		if r.Ticker == "LYB" {
			fmt.Printf("%+v\n", r)
		}
		ownedUnits := r.Units - r.SoldUnits
		unitsWithoutReinvest := ownedUnits - r.ReinvestUnits
		var averageStockPrice float32
		if ownedUnits > 0 {
			averageStockPrice = r.BuyValue / float32(ownedUnits)
		}
		var averageStockPriceWithoutReinvest float32
		if unitsWithoutReinvest > 0 {
			averageStockPriceWithoutReinvest = r.BuyValue / float32(unitsWithoutReinvest)
		}

		var yieldOnCost float32
		if averageStockPrice > 0 {
			yieldOnCost = tickersInfo[r.Ticker].YearlyDividendValue / averageStockPrice
		}

		var yieldOnCostWOR float32
		if averageStockPriceWithoutReinvest > 0 {
			yieldOnCostWOR = tickersInfo[r.Ticker].YearlyDividendValue / averageStockPriceWithoutReinvest
		}

		return domain.Asset{
			Ticker:                             tickersInfo[r.Ticker],
			Name:                               tickersInfo[r.Ticker].Name,
			BuyValue:                           r.BuyValue,
			ReinvestedBuyValue:                 r.ReinvestedBuyValue,
			Value:                              ownedUnits * tickersInfo[r.Ticker].Price,
			ValueWithoutReinvest:               unitsWithoutReinvest * tickersInfo[r.Ticker].Price,
			Units:                              ownedUnits,
			UnitsWithoutReinvest:               unitsWithoutReinvest,
			AverageStockPrice:                  averageStockPrice,
			AverageStockPriceWithoutReinvest:   averageStockPriceWithoutReinvest,
			LastBuyDate:                        domain.Date(r.LastBuyDate),
			YieldWithRespectBuy:                yieldOnCost,
			YieldWithRespectBuyWithoutReinvest: yieldOnCostWOR,
			YieldWithRespectValue:              tickersInfo[r.Ticker].YearlyDividendValue / tickersInfo[r.Ticker].Price,
			Currency:                           r.Currency,
			Country:                            tickersInfo[r.Ticker].Country,
			Sector:                             tickersInfo[r.Ticker].Sector,
		}
	})

	assets = arrayutils.Filter(assets, func(a domain.Asset) bool {
		return a.Units > 0.0001
	})

	return assets, nil
}

func (r *AssetsRepository) FindEvents(userEmail string) (domain.EventCalendar, error) {
	assets, err := r.FindAll(userEmail)
	if err != nil {
		return nil, err
	}

	filteredAssets := arrayutils.Filter(assets, func(a domain.Asset) bool {
		return a.Units > 0
	})

	events := domain.EventCalendar{}

	for _, asset := range filteredAssets {
		if asset.Ticker.ExDividendDate != nil {
			events[*asset.Ticker.ExDividendDate] = append(events[*asset.Ticker.ExDividendDate], domain.FinancialEvent{
				EventType: domain.ExDividend,
				Ticker:    asset.Ticker,
				ExtraData: map[string]interface{}{
					"dividendValue":  asset.Ticker.NextDividendValue,
					"dividendYield":  asset.Ticker.NextDividendYield,
					"expectedAmount": asset.Units * asset.Ticker.NextDividendValue,
				},
			})
		}

		if asset.Ticker.DividendPaymentDate != nil {
			events[*asset.Ticker.DividendPaymentDate] = append(events[*asset.Ticker.DividendPaymentDate], domain.FinancialEvent{
				EventType: domain.DividendPayment,
				Ticker:    asset.Ticker,
				ExtraData: map[string]interface{}{
					"dividendValue":  asset.Ticker.NextDividendValue,
					"dividendYield":  asset.Ticker.NextDividendYield,
					"expectedAmount": asset.Units * asset.Ticker.NextDividendValue,
				},
			})
		}

		for _, earningDate := range asset.Ticker.EarningDates {
			events[domain.Date(earningDate)] = append(events[domain.Date(earningDate)], domain.FinancialEvent{
				EventType: domain.Earning,
				Ticker:    asset.Ticker,
				ExtraData: map[string]interface{}{},
			})
		}
	}

	return events, nil
}

func (r *AssetsRepository) FindHistoric(userEmail string, startDate, endDate domain.Date) (domain.PortfolioHistoric, error) {
	var results []interimHistoricResult

	if err := r.db.Raw(`
	WITH _RATES AS (
		SELECT
			SOURCE_CURRENCY,
			RATE
		FROM EXCHANGE_RATES
		WHERE TARGET_CURRENCY = (SELECT PREFERRED_CURRENCY FROM USERS WHERE EMAIL = ?)
	),

	_PORTFOLIO_HISTORICS_SINGLE_CURRENCY AS (
		SELECT
			PORTFOLIO_HISTORICS.*,
			USERS.PREFERRED_CURRENCY AS CURRENCY
		FROM PORTFOLIO_HISTORICS
		INNER JOIN USERS ON PORTFOLIO_HISTORICS.USER_EMAIL = USERS.EMAIL
		INNER JOIN _RATES ON _RATES.SOURCE_CURRENCY = PORTFOLIO_HISTORICS.CURRENCY
		WHERE USERS.EMAIL = ?
	),

	_GROUPED_HISTORICS AS (
		SELECT
			DATE(CREATED_AT) AS DATE,
			_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.VALUE,
			_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.BUY_VALUE,
			_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.VALUE_WITHOUT_REINVEST,
			_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.CURRENCY,
			(_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.VALUE / _PORTFOLIO_HISTORICS_SINGLE_CURRENCY.BUY_VALUE - 1) * 100 AS RATE,
			(_PORTFOLIO_HISTORICS_SINGLE_CURRENCY.VALUE_WITHOUT_REINVEST / _PORTFOLIO_HISTORICS_SINGLE_CURRENCY.BUY_VALUE - 1) * 100 AS RATE_WITHOUT_REINVEST,
			ROW_NUMBER() OVER (PARTITION BY DATE(CREATED_AT) ORDER BY CREATED_AT ASC) AS ROW_NUM
		FROM _PORTFOLIO_HISTORICS_SINGLE_CURRENCY
		WHERE DATE(CREATED_AT) BETWEEN ? AND ?
	)
	SELECT *
	FROM _GROUPED_HISTORICS
	WHERE ROW_NUM = 1;
	`, userEmail, userEmail, time.Time(startDate).Format("2006-01-01"), time.Time(endDate).Format("2006-01-01")).Scan(&results).Error; err != nil {
		return nil, err
	}

	historic := arrayutils.Map(results, func(r interimHistoricResult) domain.HistoricEntry {
		d, _ := time.Parse("2006-01-02", r.Date)
		return domain.HistoricEntry{
			Date:                 domain.Date(d),
			Value:                r.Value,
			ValueWithoutReinvest: r.ValueWithoutReinvest,
			BuyValue:             r.BuyValue,
			Currency:             r.Currency,
			Rate:                 r.Rate,
			RateWithoutReinvest:  r.RateWithoutReinvest,
		}
	})
	return historic, nil
}

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

type SellsRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewSellsRepository(db *gorm.DB, logger *slog.Logger) *SellsRepository {
	return &SellsRepository{db: db, l: logger}
}

func (r *SellsRepository) Create(sell domain.Sell, userEmail string) (*domain.SellWithId, error) {
	id := uuid.New().String()
	dbSell := Sell{
		ID:               id,
		UserEmail:        userEmail,
		Units:            sell.Units,
		Ticker:           sell.Ticker,
		Amount:           sell.Amount,
		AcquisitionValue: sell.AcquisitionValue,
		Currency:         sell.Currency,
		Fees:             sell.Fees,
		Date:             time.Time(sell.Date),
	}
	if err := r.db.Create(&dbSell).Error; err != nil {
		return nil, err
	}
	return &domain.SellWithId{
		Id:   id,
		Sell: sell,
	}, nil
}

func (r *SellsRepository) FindAll(userEmail string) (domain.Sells, error) {
	dbSells := []Sell{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbSells).Error; err != nil {
		return nil, err
	}

	sells := make([]domain.SellWithId, len(dbSells))
	for i, dbSell := range dbSells {
		sells[i] = domain.SellWithId{
			Id: dbSell.ID,
			Sell: domain.Sell{
				Units:            dbSell.Units,
				Ticker:           dbSell.Ticker,
				AcquisitionValue: dbSell.AcquisitionValue,
				Amount:           dbSell.Amount,
				Fees:             dbSell.Fees,
				AccumulatedFees:  dbSell.AccumulatedFees,
				Currency:         dbSell.Currency,
				Date:             domain.Date(dbSell.Date),
			},
		}
	}
	return sells, nil
}

func (r *SellsRepository) FindByTicker(ticker string, userEmail string) (domain.Sells, error) {
	dbSells := []Sell{}
	if err := r.db.Where("user_email = ? AND ticker = ?", userEmail, ticker).Find(&dbSells).Order("date asc").Error; err != nil {
		return nil, err
	}

	sells := make([]domain.SellWithId, len(dbSells))
	for i, dbSell := range dbSells {
		sells[i] = domain.SellWithId{
			Id: dbSell.ID,
			Sell: domain.Sell{
				Units:            dbSell.Units,
				Ticker:           dbSell.Ticker,
				Amount:           dbSell.Amount,
				AccumulatedFees:  dbSell.AccumulatedFees,
				AcquisitionValue: dbSell.AcquisitionValue,
				Currency:         dbSell.Currency,
				Fees:             dbSell.Fees,
				Date:             domain.Date(dbSell.Date),
			},
		}
	}
	return sells, nil
}

func (r *SellsRepository) Delete(id string, userEmail string) error {
	if err := r.db.Where("id = ? AND user_email = ?", id, userEmail).Delete(&Sell{}).Error; err != nil {
		return err
	}
	return nil
}
