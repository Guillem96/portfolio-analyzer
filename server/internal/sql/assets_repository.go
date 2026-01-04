package sql

import (
	"log/slog"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sells"
	"github.com/judedaryl/go-arrayutils"
	"gorm.io/gorm"
)

type AssetsRepository struct {
	db *gorm.DB
	ur domain.UserRepository
	tr domain.TickersRepository
	sr domain.SellsRepository
	br domain.BuysRepository
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

func NewAssetsRepository(db *gorm.DB, ur domain.UserRepository, tr domain.TickersRepository, sr domain.SellsRepository, br domain.BuysRepository, logger *slog.Logger) *AssetsRepository {
	return &AssetsRepository{
		db: db,
		ur: ur,
		tr: tr,
		sr: sr,
		br: br,
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

	_SELLS_SINGLE_CURRENCY AS (
		SELECT
			SELLS.*,
			USERS.PREFERRED_CURRENCY,
			SELLS.AMOUNT * _RATES.RATE AS TOTAL_AMOUNT,
			FEES * _RATES.RATE AS FEES,
			SELLS.DATE
		FROM SELLS
		INNER JOIN USERS ON SELLS.USER_EMAIL = USERS.EMAIL
		INNER JOIN _RATES ON _RATES.SOURCE_CURRENCY = SELLS.CURRENCY
		WHERE USERS.EMAIL = ? AND SELLS.DELETED_AT IS NULL
	),

	_SELLS AS (
		SELECT
			USER_EMAIL,
			TICKER,
			SUM(UNITS) AS TOTAL_UNITS,
			SUM(TOTAL_AMOUNT + FEES) AS TOTAL_AMOUNT
		FROM _SELLS_SINGLE_CURRENCY
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
		COALESCE(_BUYS.TOTAL_AMOUNT, 0) - COALESCE(_SELLS.TOTAL_AMOUNT, 0) AS BUY_VALUE,
		COALESCE(_BUYS.TOTAL_UNITS, 0) AS BUY_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_AMOUNT, 0) AS REINVESTED_BUY_VALUE,
		COALESCE(_SELLS.TOTAL_UNITS, 0) AS SOLD_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_UNITS, 0) AS REINVEST_UNITS,
		COALESCE(_REINVESTMENTS.TOTAL_UNITS, 0) + COALESCE(_BUYS.TOTAL_UNITS, 0) AS UNITS,
		_BUYS_LAST_DATE.DATE AS LAST_BUY_DATE
	FROM _BUYS
	FULL OUTER JOIN _REINVESTMENTS ON _BUYS.TICKER = _REINVESTMENTS.TICKER
	LEFT JOIN _BUYS_LAST_DATE ON COALESCE(_BUYS.TICKER, _REINVESTMENTS.TICKER) = _BUYS_LAST_DATE.TICKER
	LEFT JOIN _SELLS ON _BUYS.TICKER = _SELLS.TICKER
	`, *user.PreferredCurrency, userEmail, userEmail, userEmail).Scan(&results).Error
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
		ticker, err := r.tr.FindByTicker(allTickers[0], user.PreferredCurrency)
		if err != nil {
			return nil, err
		}
		tickersInfo = map[string]domain.Ticker{allTickers[0]: ticker}
	} else {
		tickersInfo, err = r.tr.FindMultipleTickers(allTickers, user.PreferredCurrency)
		if err != nil {
			return nil, err
		}
	}

	airs := arrayutils.Filter(results, func(a assetsIterimResult) bool {
		return a.Units-a.SoldUnits > 0.0001
	})

	assets := arrayutils.Map(airs, func(air assetsIterimResult) domain.Asset {
		ownedUnits := air.Units - air.SoldUnits
		averageStockPrice, _ := r.computeTickerAveragePurchasePrice(air, user, true)
		averageStockPriceWithoutReinvest, _ := r.computeTickerAveragePurchasePrice(air, user, false)
		buyValue := averageStockPriceWithoutReinvest * ownedUnits
		buyValueWithoutReinvest := averageStockPrice * ownedUnits
		buyReinvestedValue := buyValueWithoutReinvest - buyValue

		unitsWithoutReinvest := ownedUnits - air.ReinvestUnits

		var yieldOnCost float32
		if averageStockPrice > 0 {
			yieldOnCost = tickersInfo[air.Ticker].YearlyDividendValue / averageStockPrice
		}

		var yieldOnCostWOR float32
		if averageStockPriceWithoutReinvest > 0 {
			yieldOnCostWOR = tickersInfo[air.Ticker].YearlyDividendValue / averageStockPriceWithoutReinvest
		}

		return domain.Asset{
			Ticker:             tickersInfo[air.Ticker],
			Name:               tickersInfo[air.Ticker].Name,
			BuyValue:           buyValue,
			ReinvestedBuyValue: buyReinvestedValue,
			Value:              ownedUnits * tickersInfo[air.Ticker].Price,
			// <Not used>
			ValueWithoutReinvest: unitsWithoutReinvest * tickersInfo[air.Ticker].Price,
			UnitsWithoutReinvest: unitsWithoutReinvest,
			// </Not used>

			Units:                              ownedUnits,
			AverageStockPrice:                  averageStockPrice,
			AverageStockPriceWithoutReinvest:   averageStockPriceWithoutReinvest,
			LastBuyDate:                        domain.Date(air.LastBuyDate),
			YieldWithRespectBuy:                yieldOnCost,
			YieldWithRespectBuyWithoutReinvest: yieldOnCostWOR,
			YieldWithRespectValue:              tickersInfo[air.Ticker].YearlyDividendValue / tickersInfo[air.Ticker].Price,
			Currency:                           *user.PreferredCurrency,
			Country:                            tickersInfo[air.Ticker].Country,
			Sector:                             tickersInfo[air.Ticker].Sector,
		}
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

func (r *AssetsRepository) computeTickerAveragePurchasePrice(air assetsIterimResult, user *domain.UserWithId, reinvestmentsAsFree bool) (float32, error) {
	ownedUnits := air.Units - air.SoldUnits
	buyValue := air.BuyValue
	if reinvestmentsAsFree {
		buyValue += air.ReinvestedBuyValue
	}
	if ownedUnits > 0 && air.SoldUnits == 0 {
		return buyValue / float32(ownedUnits), nil
	} else if ownedUnits > 1e-4 && air.SoldUnits > 0 {
		tbs, err := r.br.FindByTickerAndCurrency(air.Ticker, *user.PreferredCurrency, user.Email)
		if err != nil {
			return 0, err
		}
		tss, err := r.sr.FindByTicker(air.Ticker, user.Email)
		if err != nil {
			return 0, err
		}
		averageStockPrice, err := sells.ComputeFIFORuleAvgPurchasePrice(tbs, tss, reinvestmentsAsFree)
		if err != nil {
			return 0, err
		}
		return averageStockPrice, nil
	}
	return 0, nil
}
