package tickers

import "github.com/Guillem96/portfolio-analyzer-server/internal/domain"

type tickersCache interface {
	domain.TickersRepository
	domain.WritableTickersRepository
}

type CacheManager struct {
	externalRepository domain.TickersRepository
	cache              tickersCache
}

func NewCacheManager(externalRepo domain.TickersRepository, cache tickersCache) *CacheManager {
	return &CacheManager{
		externalRepository: externalRepo,
		cache:              cache,
	}
}

func (cm *CacheManager) WriteToCache(ticker string) error {
	exists, err := cm.cache.Exists(ticker)
	if err != nil {
		return err
	}

	if exists {
		return nil
	}

	tickerData, err := cm.externalRepository.FindByTicker(ticker, nil)
	if err != nil {
		return err
	}

	if err := cm.cache.Create(tickerData); err != nil {
		return err
	}

	return nil
}
