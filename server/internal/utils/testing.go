package utils

import (
	"fmt"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/judedaryl/go-arrayutils"
)

type BuysInMemoryRepository struct {
	data map[string][]domain.BuyWithId
}

type DividendsInMemoryRepository struct {
	data map[string][]domain.DividendWithId
}

func NewBuysInMemoryRepository() *BuysInMemoryRepository {
	return &BuysInMemoryRepository{
		data: make(map[string][]domain.BuyWithId),
	}
}

func NewDividedndsInMemoryRepository() *DividendsInMemoryRepository {
	return &DividendsInMemoryRepository{
		data: make(map[string][]domain.DividendWithId),
	}
}

func (r *BuysInMemoryRepository) Create(buy domain.Buy, email string) (*domain.BuyWithId, error) {
	currentBuys, ok := r.data[email]
	if !ok {
		r.data[email] = []domain.BuyWithId{}
		currentBuys = r.data[email]
	}

	id := fmt.Sprint(len(currentBuys) + 1)
	newBuy := domain.BuyWithId{
		Id:  id,
		Buy: buy,
	}

	r.data[email] = append(currentBuys, newBuy)

	return &newBuy, nil
}

func (r *BuysInMemoryRepository) FindAll(email string) (domain.Buys, error) {
	buys, ok := r.data[email]
	if !ok {
		return nil, nil
	}

	return buys, nil
}

func (r *BuysInMemoryRepository) Delete(id string, email string) error {
	buys, ok := r.data[email]
	if !ok {
		return nil
	}
	r.data[email] = arrayutils.Filter(buys, func(b domain.BuyWithId) bool {
		return b.Id != id
	})

	return nil
}

func (r *DividendsInMemoryRepository) Create(dividend domain.Dividend, email string) (*domain.DividendWithId, error) {
	currentDividends, ok := r.data[email]
	if !ok {
		r.data[email] = []domain.DividendWithId{}
		currentDividends = r.data[email]
	}

	id := fmt.Sprint(len(currentDividends) + 1)
	newDividend := domain.DividendWithId{
		Id:       id,
		Dividend: dividend,
	}

	r.data[email] = append(currentDividends, newDividend)

	return &newDividend, nil
}

func (r *DividendsInMemoryRepository) FindAll(email string) (domain.Dividends, error) {
	dividends, ok := r.data[email]
	if !ok {
		return nil, nil
	}

	return dividends, nil
}

func (r *DividendsInMemoryRepository) Delete(id string, email string) error {
	dividends, ok := r.data[email]
	if !ok {
		return nil
	}
	r.data[email] = arrayutils.Filter(dividends, func(d domain.DividendWithId) bool {
		return d.Id != id
	})

	return nil
}
