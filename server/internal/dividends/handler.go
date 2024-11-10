package dividends

import (
	"log/slog"
	"net/http"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/gorilla/mux"
)

type Handler struct {
	repository domain.DividendsRepository
	l          *slog.Logger
}

func New(repository domain.DividendsRepository, logger *slog.Logger) *Handler {
	return &Handler{
		repository: repository,
		l:          logger,
	}
}

// CreateDividendHandler creates a new dividend
func (dh *Handler) CreateDividendHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	dividend := &domain.Dividend{}
	if err := dividend.FromJSON(r.Body); err != nil {
		dh.l.Error("Failed to parse request body", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to parse request body")
		return
	}
	defer r.Body.Close()

	if err := dividend.Validate(); err != nil {
		dh.l.Error("Invalid dividend", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, err.Error())
		return
	}

	newDividend, err := dh.repository.Create(*dividend, user.Email)
	if err != nil {
		dh.l.Error("Failed to create dividend", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to create dividend")
		return
	}

	if err := newDividend.ToJSON(w); err != nil {
		dh.l.Error("Failed to serialize dividend", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize dividend")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

// ListDividendsHandler returns all the dividends of the user
func (dh *Handler) ListDividendsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	dividends, err := dh.repository.FindAll(user.Email)
	if err != nil {
		dh.l.Error("Failed to get dividends", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to get dividends")
		return
	}

	if err := dividends.ToJSON(w); err != nil {
		dh.l.Error("Failed to serialize dividends", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize dividends")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

// DeleteDividendHandler deletes a dividend
func (dh *Handler) DeleteDividendHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	vars := mux.Vars(r)
	id, present := vars["id"]
	if !present {
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Missing id parameter")
		return
	}

	err := dh.repository.Delete(id, user.Email)
	if err != nil {
		dh.l.Error("Failed to delete dividend", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to delete dividend")
		return
	}

	w.WriteHeader(http.StatusOK)
}
