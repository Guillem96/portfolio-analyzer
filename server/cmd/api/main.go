package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/Guillem96/portfolio-analyzer-server/internal/assets"
	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/buys"
	"github.com/Guillem96/portfolio-analyzer-server/internal/dividends"
	"github.com/Guillem96/portfolio-analyzer-server/internal/infra_http"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sells"
	"github.com/Guillem96/portfolio-analyzer-server/internal/server"
	"github.com/Guillem96/portfolio-analyzer-server/internal/sql"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if os.IsNotExist(err) {
		slog.Warn("No .env file found")
	} else if err != nil {
		log.Fatal("Error loading .env file")
	}

	if utils.IsRunningInLambdaEnv() {
		slog.Info("Running in Lambda environment")
		lambda.Start(lambdaHandler)
		return
	}
	httpServer()
}

func lambdaHandler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	host := req.Headers["host"]

	lth := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: fetchLogLevel(),
	})
	l := slog.New(lth)

	handler := setupRouter(l, host)
	adapter := httpadapter.NewV2(handler)
	return adapter.ProxyWithContext(ctx, req)
}

func httpServer() {
	lth := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: fetchLogLevel(),
	})
	l := slog.New(lth)
	handler := setupRouter(l, "localhost:8080")
	slog.Info("Server started", "host", "localhost", "port", 8080)
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func fetchLogLevel() slog.Level {
	logLevel, present := os.LookupEnv("LOG_LEVEL")
	if !present {
		return slog.LevelInfo
	}

	switch logLevel {
	case "DEBUG":
		return slog.LevelDebug
	case "INFO":
		return slog.LevelInfo
	case "WARN":
		return slog.LevelWarn
	case "ERROR":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func setupRouter(l *slog.Logger, host string) http.Handler {
	db := sql.GetDB()

	makeMigrations, present := os.LookupEnv("MAKE_MIGRATIONS")
	if present && makeMigrations == "true" {
		sql.InitDB()
	}

	tickerInfoUrl, present := os.LookupEnv("TICKER_INFO_API")
	if !present {
		log.Fatal("TICKER_INFO_API not found")
	}

	cr := sql.NewExchangeRatesRepository(db, l)
	tr := infra_http.NewTickerRepository(tickerInfoUrl, cr, l)
	br := sql.NewBuysRepository(db, l)
	dr := sql.NewDividendsRepository(db, l)
	ur := sql.NewUsersRepository(db, l)
	sr := sql.NewSellsRepository(db, l)
	ar := sql.NewAssetsRepository(db, ur, tr, sr, br, l)

	// Handlers
	ah := auth.New(ur, host, l)
	bh := buys.New(br, l)
	sh := sells.New(sr, br, l)
	dh := dividends.New(dr, l)
	assetsHandler := assets.New(ar, l)

	return server.SetupRouter(ah, bh, dh, assetsHandler, sh)
}
