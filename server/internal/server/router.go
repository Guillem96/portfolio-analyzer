package server

import (
	"net/http"
	"os"

	"github.com/Guillem96/portfolio-analyzer-server/internal/assets"
	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/buys"
	"github.com/Guillem96/portfolio-analyzer-server/internal/dividends"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func SetupRouter(
	authHandler *auth.Handler,
	buysHandler *buys.Handler,
	dividendsHandler *dividends.Handler,
	assetsHandler *assets.Handler,
) http.Handler {
	router := mux.NewRouter()
	authRounter := router.PathPrefix("/auth").Subrouter()
	authRounter.HandleFunc("/google/login", authHandler.HandleGoogleLogin).Methods("GET")
	authRounter.HandleFunc("/google/callback", authHandler.HandleGoogleCallback).Methods("GET")
	authRounter.HandleFunc("/logout", authHandler.HandleLogout).Methods("GET")
	authRounter.Handle("/user", auth.JwtMiddleware(http.HandlerFunc(authHandler.HandleUserInfo))).Methods("GET")
	authRounter.Handle("/user", auth.JwtMiddleware(http.HandlerFunc(authHandler.UpdateUserPreferences))).Methods("PATCH")

	buysRouter := router.PathPrefix("/buys").Subrouter()
	buysRouter.Use(auth.JwtMiddleware)
	buysRouter.HandleFunc("/", buysHandler.ListBuysHandler).Methods("GET")
	buysRouter.HandleFunc("/", buysHandler.CreateBuyHandler).Methods("POST")
	buysRouter.HandleFunc("/{id}", buysHandler.DeleteBuyHandler).Methods("DELETE")

	dividendsRouter := router.PathPrefix("/dividends").Subrouter()
	dividendsRouter.Use(auth.JwtMiddleware)
	dividendsRouter.HandleFunc("/", dividendsHandler.ListDividendsHandler).Methods("GET")
	dividendsRouter.HandleFunc("/", dividendsHandler.CreateDividendHandler).Methods("POST")
	dividendsRouter.HandleFunc("/{id}", dividendsHandler.DeleteDividendHandler).Methods("DELETE")

	assetsRouter := router.PathPrefix("/assets").Subrouter()
	assetsRouter.Use(auth.JwtMiddleware)
	assetsRouter.HandleFunc("/", assetsHandler.ListAssetsHandler).Methods("GET")
	assetsRouter.HandleFunc("/events", assetsHandler.ListEventsHandler).Methods("GET")

	// Serve static files
	staticDir := "./static/dist"
	router.PathPrefix("/portfolio-analyzer/").Handler(http.StripPrefix("/portfolio-analyzer/", http.FileServer(http.Dir(staticDir))))

	// Apply CORS if needed
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "https://guillem96.github.io"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PATCH"},
		Debug:            !utils.IsProdEnvironment(),
	})
	return c.Handler(handlers.LoggingHandler(os.Stdout, router))
}
