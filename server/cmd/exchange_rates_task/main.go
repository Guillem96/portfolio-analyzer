package main

import (
	"errors"
	"log"
	"log/slog"
	"os"

	"github.com/Guillem96/portfolio-analyzer-server/internal/infra_http"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sql"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"
	"gorm.io/gorm/clause"
)

// This script fetches the exchange rates from the currency exchange rates API and stores them in the database.
func main() {
	err := godotenv.Load()
	if os.IsNotExist(err) {
		slog.Warn("No .env file found")
	} else if err != nil {
		log.Fatal("Error loading .env file")
	}

	if utils.IsRunningInLambdaEnv() {
		lambda.Start(task)
		return
	}

	if err := task(); err != nil {
		log.Fatal(err)
	}
}

func task() error {
	l := slog.Default()
	db := sql.GetDB()
	sql.InitDB()

	// Currency service
	currencyUrl, present := os.LookupEnv("CURRENCY_EXCHANGE_RATES_API")
	if !present {
		l.Error("CURRENCY_EXCHANGE_RATES_API not found", "error", "CURRENCY_EXCHANGE_RATES_API not found")
		return errors.New("CURRENCY_EXCHANGE_RATES_API not found")
	}
	cr := infra_http.NewCurrencyRepository(currencyUrl, l)

	aer, err := cr.FindAllExchangeRates()
	if err != nil {
		l.Error("Failed to fetch exchange rates", "error", err.Error())
		return err
	}

	for sc, rates := range aer {
		for tc, rate := range rates {
			ner := sql.ExchangeRate{
				SourceCurrency: sc,
				TargetCurrency: tc,
				Rate:           rate,
			}
			db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "source_currency"}, {Name: "target_currency"}},
				DoUpdates: clause.AssignmentColumns([]string{"rate"}),
			}).Create(&ner)
		}
	}
	db.Commit()
	return nil
}
