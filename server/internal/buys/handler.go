package buys

import (
	"log/slog"
	"net/http"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/gorilla/mux"
)

type Handler struct {
	repo domain.BuysRepository
	l    *slog.Logger
}

func New(repo domain.BuysRepository, logger *slog.Logger) *Handler {
	return &Handler{
		repo: repo,
		l:    logger,
	}
}

func (bh *Handler) CreateBuyHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	buy := &domain.Buy{}
	if err := buy.FromJSON(r.Body); err != nil {
		bh.l.Error("Failed to parse request body", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to parse request body")
		return
	}
	defer r.Body.Close()

	if err := buy.Validate(); err != nil {
		bh.l.Error("Invalid buy", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, err.Error())
		return
	}

	newBuy, err := bh.repo.Create(*buy, user.Email)
	if err != nil {
		bh.l.Error("Failed to create buy", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to create buy")
		return
	}

	if err := newBuy.ToJSON(w); err != nil {
		bh.l.Error("Failed to serialize buy", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize buy")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

func (bh *Handler) ListBuysHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	buys, err := bh.repo.FindAll(user.Email)

	if err != nil {
		bh.l.Error("Failed to retrieve buys", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to retrieve buys")
		return
	}

	if err := buys.ToJSON(w); err != nil {
		bh.l.Error("Failed to serialize buys", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize buys")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

func (bh *Handler) DeleteBuyHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	vars := mux.Vars(r)
	id, present := vars["id"]
	if !present {
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Missing id parameter")
		return
	}
	if err := bh.repo.Delete(id, user.Email); err != nil {
		bh.l.Error("Failed to delete buy", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to delete buy")
		return
	}
	utils.SendHTTPMessage(w, http.StatusOK, "Buy deleted successfully")
}
