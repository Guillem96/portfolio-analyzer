package sql

import (
	"log/slog"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/google/uuid"
	"github.com/judedaryl/go-arrayutils"
	"gorm.io/gorm"
)

type BuysRepository struct {
	db *gorm.DB
	tr domain.TickersRepository
	l  *slog.Logger
}

type interimBuyResult struct {
	ID             string    `gorm:"column:ID"`
	Units          float32   `gorm:"column:UNITS"`
	Ticker         string    `gorm:"column:TICKER"`
	Taxes          float32   `gorm:"column:TOTAL_TAXES"`
	Fee            float32   `gorm:"column:TOTAL_FEES"`
	Amount         float32   `gorm:"column:TOTAL_AMOUNT"`
	Currency       string    `gorm:"column:CURRENCY"`
	IsReinvestment bool      `gorm:"column:IS_REINVESTMENT"`
	Date           time.Time `gorm:"column:DATE"`
}

func NewBuysRepository(db *gorm.DB, tr domain.TickersRepository, logger *slog.Logger) *BuysRepository {
	return &BuysRepository{db: db, tr: tr, l: logger}
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

	nt, err := r.tr.FindByTicker(buy.Ticker, nil)
	if err != nil {
		return nil, err
	}

	return &domain.BuyWithId{
		Id: id,
		TickerData: &domain.SimplifiedTicker{
			Name:    nt.Name,
			Ticker:  nt.Ticker,
			Website: nt.Website,
		},
		Buy: buy,
	}, nil
}

func (r *BuysRepository) FindAll(userEmail string) (domain.Buys, error) {
	dbBuys := []Buy{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbBuys).Error; err != nil {
		return nil, err
	}

	uts := utils.ArrayUnique(arrayutils.Map(dbBuys, func(b Buy) string {
		return b.Ticker
	}))

	tickersInfo, err := r.tr.FindMultipleTickers(uts, nil)
	if err != nil {
		return nil, err
	}

	buys := make([]domain.BuyWithId, len(dbBuys))
	for i, dbBuy := range dbBuys {
		buys[i] = domain.BuyWithId{
			Id: dbBuy.ID,
			TickerData: &domain.SimplifiedTicker{
				Ticker:  tickersInfo[dbBuy.Ticker].Ticker,
				Name:    tickersInfo[dbBuy.Ticker].Name,
				Website: tickersInfo[dbBuy.Ticker].Website,
			},
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

func (r *BuysRepository) FindByTickerAndCurrency(ticker, currency, userEmail string) (domain.Buys, error) {
	dbBuys := []interimBuyResult{}
	err := r.db.Raw(`
	WITH _RATES AS (
		SELECT
			SOURCE_CURRENCY,
			RATE
		FROM EXCHANGE_RATES
		WHERE TARGET_CURRENCY = ?
	)
	SELECT
		BUYS.ID AS ID,
		BUYS.UNITS AS UNITS,
		BUYS.TICKER AS TICKER,
		BUYS.IS_REINVESTMENT AS IS_REINVESTMENT,
		BUYS.AMOUNT * _RATES.RATE AS TOTAL_AMOUNT,
		BUYS.FEE * _RATES.RATE AS TOTAL_FEES,
		BUYS.TAXES * _RATES.RATE AS TOTAL_TAXES,
		BUYS.CURRENCY = ? AS CURRENCY,
		BUYS.DATE AS DATE
	FROM BUYS
	INNER JOIN _RATES ON _RATES.SOURCE_CURRENCY = BUYS.CURRENCY
	WHERE USER_EMAIL = ? AND BUYS.DELETED_AT IS NULL AND TICKER = ?
	ORDER BY BUYS.DATE ASC
	`, currency, currency, userEmail, ticker).Scan(&dbBuys).Error
	if err != nil {
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

func (r *BuysRepository) FindAllTickers() ([]string, error) {
	var tickers []string
	err := r.db.Model(&Buy{}).Select("ticker").Distinct().Pluck("ticker", &tickers).Error
	return tickers, err
}

func (r *BuysRepository) Delete(id string, userEmail string) error {
	return r.db.Where("id = ? AND user_email = ?", id, userEmail).Delete(&Buy{}).Error
}
