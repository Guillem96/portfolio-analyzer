package main

import (
	"errors"
	"log"
	"log/slog"
	"os"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/infra_http"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sql"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/judedaryl/go-arrayutils"
)

// This script computes dailty the value of user's portfolios and stores them in the database.
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

	var users []sql.User
	if err := db.Find(&users).Error; err != nil {
		l.Error("Failed to fetch users", "error", err.Error())
		return errors.New("failed to fetch users")
	}

	tickerInfoUrl, present := os.LookupEnv("TICKER_INFO_API")
	if !present {
		l.Error("TICKER_INFO_API not found")
	}

	cr := sql.NewExchangeRatesRepository(db, l)
	tr := infra_http.NewTickerRepository(tickerInfoUrl, cr, l)
	ur := sql.NewUsersRepository(db, l)
	sr := sql.NewSellsRepository(db, l)
	br := sql.NewBuysRepository(db, l)
	ar := sql.NewAssetsRepository(db, ur, tr, sr, br, l)

	historics := make([]*sql.PortfolioHistoric, 0)
	for _, user := range users {
		assets, err := ar.FindAll(user.Email)
		if err != nil {
			l.Error("Failed to fetch assets", "error", err.Error())
			return err
		}

		totalValue := arrayutils.Reduce(assets, 0, func(agg float32, asset domain.Asset) float32 {
			return agg + asset.Value
		})

		totalValueWithoutReinvest := arrayutils.Reduce(assets, 0, func(agg float32, asset domain.Asset) float32 {
			return agg + asset.ValueWithoutReinvest
		})

		totalBuyValue := arrayutils.Reduce(assets, 0, func(agg float32, asset domain.Asset) float32 {
			return agg + asset.BuyValue
		})

		historics = append(historics, &sql.PortfolioHistoric{
			UserEmail:            user.Email,
			Value:                totalValue,
			ValueWithoutReinvest: totalValueWithoutReinvest,
			BuyValue:             totalBuyValue,
			Currency:             user.PreferredCurrency,
			ID:                   uuid.New().String(),
		})
	}

	if err := db.Create(historics).Error; err != nil {
		l.Error("Failed to create portfolio historic", "error", err.Error())
		return err
	}
	return nil
}
