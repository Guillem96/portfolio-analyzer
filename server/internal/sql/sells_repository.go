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

type SellsRepository struct {
	db *gorm.DB
	tr domain.TickersRepository
	l  *slog.Logger
}

func NewSellsRepository(db *gorm.DB, tr *TickersRepository, logger *slog.Logger) *SellsRepository {
	return &SellsRepository{db: db, tr: tr, l: logger}
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

	nt, err := r.tr.FindByTicker(sell.Ticker, nil)
	if err != nil {
		return nil, err
	}
	return &domain.SellWithId{
		Id: id,
		TickerData: &domain.SimplifiedTicker{
			Ticker:  nt.Ticker,
			Website: nt.Website,
			Name:    nt.Name,
		},
		Sell: sell,
	}, nil
}

func (r *SellsRepository) FindAll(userEmail string) (domain.Sells, error) {
	dbSells := []Sell{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbSells).Error; err != nil {
		return nil, err
	}

	uts := utils.ArrayUnique(arrayutils.Map(dbSells, func(s Sell) string {
		return s.Ticker
	}))

	tickersInfo, err := r.tr.FindMultipleTickers(uts, nil)
	if err != nil {
		return nil, err
	}

	sells := make([]domain.SellWithId, len(dbSells))
	for i, dbSell := range dbSells {
		sells[i] = domain.SellWithId{
			TickerData: &domain.SimplifiedTicker{
				Ticker:  tickersInfo[dbSell.Ticker].Ticker,
				Name:    tickersInfo[dbSell.Ticker].Name,
				Website: tickersInfo[dbSell.Ticker].Website,
			},
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
