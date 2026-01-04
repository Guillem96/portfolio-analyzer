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

type DividendsRepository struct {
	db *gorm.DB
	tr domain.TickersRepository
	l  *slog.Logger
}

func NewDividendsRepository(db *gorm.DB, tr *TickersRepository, logger *slog.Logger) *DividendsRepository {
	return &DividendsRepository{db: db, tr: tr, l: logger}
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

	nt, err := r.tr.FindByTicker(dividend.Company, nil)
	if err != nil {
		return nil, err
	}

	return &domain.DividendWithId{
		Id: id,
		TickerData: &domain.SimplifiedTicker{
			Name:    nt.Name,
			Website: nt.Website,
			Ticker:  nt.Ticker,
		},
		Dividend: dividend,
	}, nil
}

func (r *DividendsRepository) FindAll(userEmail string) (domain.Dividends, error) {
	dbDividends := []Dividend{}
	if err := r.db.Where("user_email = ?", userEmail).Find(&dbDividends).Error; err != nil {
		return nil, err
	}

	uts := utils.ArrayUnique(arrayutils.Map(dbDividends, func(d Dividend) string {
		return d.Company
	}))

	tickersInfo, err := r.tr.FindMultipleTickers(uts, nil)
	if err != nil {
		return nil, err
	}

	dividends := make([]domain.DividendWithId, len(dbDividends))
	for i, dbDividend := range dbDividends {
		dividends[i] = domain.DividendWithId{
			Id: dbDividend.ID,
			TickerData: &domain.SimplifiedTicker{
				Ticker:  tickersInfo[dbDividend.Company].Ticker,
				Name:    tickersInfo[dbDividend.Company].Name,
				Website: tickersInfo[dbDividend.Company].Website,
			},
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

	uts := utils.ArrayUnique(arrayutils.Map(dbDividends, func(d Dividend) string {
		return d.Company
	}))

	tickersInfo, err := r.tr.FindMultipleTickers(uts, nil)
	if err != nil {
		return nil, err
	}
	dividends := make([]domain.DividendWithId, len(dbDividends))
	for i, dbDividend := range dbDividends {
		dividends[i] = domain.DividendWithId{
			Id: dbDividend.ID,
			TickerData: &domain.SimplifiedTicker{
				Ticker:  tickersInfo[dbDividend.Company].Ticker,
				Name:    tickersInfo[dbDividend.Company].Name,
				Website: tickersInfo[dbDividend.Company].Website,
			},
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
