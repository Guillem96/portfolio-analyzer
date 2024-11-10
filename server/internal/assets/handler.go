package assets

import (
	"log/slog"
	"net/http"

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
