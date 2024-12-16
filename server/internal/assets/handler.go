package assets

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
)

type Handler struct {
	repo domain.AssetsRepository
	l    *slog.Logger
}

func New(repo domain.AssetsRepository, logger *slog.Logger) *Handler {
	return &Handler{
		repo: repo,
		l:    logger,
	}
}

func (bh *Handler) ListAssetsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	assets, err := bh.repo.FindAll(user.Email)

	if err != nil {
		bh.l.Error("Failed to retrieve assets", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to retrieve assets")
		return
	}

	if err := assets.ToJSON(w); err != nil {
		bh.l.Error("Failed to serialize assets", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize assets")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

// Handle next events endpoint
func (bh *Handler) ListEventsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	events, err := bh.repo.FindEvents(user.Email)

	if err != nil {
		bh.l.Error("Failed to retrieve events", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to retrieve events")
		return
	}

	if err := events.ToJSON(w); err != nil {
		bh.l.Error("Failed to serialize events", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize events")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

// Retrieve historic data between two dates
func (bh *Handler) RetrieveHistoricDataHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	// Parse query parameters
	query := r.URL.Query()
	startDate := query.Get("start")
	if startDate == "" {
		startDate = "2020-01-01"
	}

	endDate := query.Get("end")
	if endDate == "" {
		endDate = "2999-01-01"
	}

	parsedStartDate, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		bh.l.Error("Failed to parse start date", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to parse start date")
		return
	}

	parsedEndDate, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		bh.l.Error("Failed to parse end date", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to parse end date")
		return
	}

	hist, err := bh.repo.FindHistoric(user.Email,
		domain.Date(parsedStartDate),
		domain.Date(parsedEndDate))

	if err != nil {
		bh.l.Error("Failed to retrieve historic data", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to retrieve historic data")
		return
	}

	if err := hist.ToJSON(w); err != nil {
		bh.l.Error("Failed to serialize historic data", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize historic data")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}
