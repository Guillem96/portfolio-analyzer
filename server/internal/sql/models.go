package sql

import (
	"time"

	"gorm.io/gorm"
)

type Buy struct {
	ID             string `gorm:"primarykey"`
	UserEmail      string
	Units          float32
	Ticker         string
	Amount         float32
	Currency       string
	IsReinvestment bool
	Date           time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

type Dividend struct {
	ID                        string `gorm:"primarykey"`
	UserEmail                 string
	Company                   string
	Country                   string
	Amount                    float32
	Currency                  string
	DoubleTaxationOrigin      float32
	DoubleTaxationDestination float32
	Date                      time.Time
	CreatedAt                 time.Time
	UpdatedAt                 time.Time
	DeletedAt                 gorm.DeletedAt `gorm:"index"`
}

type User struct {
	ID                string `gorm:"primarykey"`
	Email             string `gorm:"unique"`
	PreferredCurrency string
	Picture           string
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

type ExchangeRate struct {
	SourceCurrency string `gorm:"primarykey"`
	TargetCurrency string `gorm:"primarykey"`
	Rate           float32
	CreatedAt      time.Time
}
