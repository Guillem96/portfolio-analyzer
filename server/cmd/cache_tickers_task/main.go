package main

import (
	"log"
	"log/slog"
	"os"
	"strconv"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/infra_http"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sql"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"
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

	// Curre
	tickerInfoUrl, present := os.LookupEnv("TICKER_INFO_API")
	if !present {
		log.Fatal("TICKER_INFO_API not found")
	}

	cr := sql.NewExchangeRatesRepository(db, l)
	tr := infra_http.NewTickerRepository(tickerInfoUrl, cr, l)
	sqltr := sql.NewTickersRepository(db, l)
	br := sql.NewBuysRepository(db, sqltr, l)

	tickers, err := br.FindAllTickers()
	if err != nil {
		l.Error("Failed to fetch tickers from buys", "error", err.Error())
		return err
	}

	bs, err := getBatchSizeOrDefaut()
	if err != nil {
		l.Error("Failed to get batch size", "error", err.Error())
		return err
	}

	for i := 0; i < len(tickers); i += bs {
		// Clamp the last chunk to the slice bound as necessary.
		end := min(bs, len(tickers[i:]))
		chunk := tickers[i : i+end : i+end]
		l.Info("Processing batch", "batch", chunk, "size", len(chunk))
		if err := processBatch(chunk, tr, sqltr); err != nil {
			l.Error("Failed to process batch", "error", err.Error())
			return err
		}
	}

	return nil
}

func getBatchSizeOrDefaut() (int, error) {
	batchSizeStr, present := os.LookupEnv("TICKER_BATCH_SIZE")
	if !present {
		return 6, nil // default value
	}

	batchSize, err := strconv.Atoi(batchSizeStr)
	if err != nil {
		return 0, err
	}

	return batchSize, nil
}

func processBatch(tickers []string, s domain.TickersRepository, d domain.WritableTickersRepository) error {
	tickersInfo, err := s.FindMultipleTickers(tickers, nil)
	if err != nil {
		return err
	}

	for _, t := range tickersInfo {
		if err := d.Create(t); err != nil {
			return err
		}
	}

	return nil
}
