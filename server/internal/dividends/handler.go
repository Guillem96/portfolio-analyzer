package dividends

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/gorilla/mux"
	"github.com/judedaryl/go-arrayutils"
)

type updateDividend struct {
	ID         string `json:"id"`
	Reinvested bool   `json:"reinvested"`
}

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

// ListPreferredCurrencyDividendsHandler returns all the dividends of the user in the preferred currency
func (dh *Handler) ListPreferredCurrencyDividendsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	dividends, err := dh.repository.FindAllPreferredCurrency(user.Email)
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

// UpdateDividendsHandler updates the reinvestment status of the dividends
func (dh *Handler) UpdateDividendsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	var dividends []updateDividend

	if err := json.NewDecoder(r.Body).Decode(&dividends); err != nil {
		dh.l.Error("Failed to parse request body", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to parse request body")
		return
	}

	defer r.Body.Close()

	markAsTrue := arrayutils.Filter(dividends, func(d updateDividend) bool {
		return d.Reinvested
	})
	markAsTrueIDs := arrayutils.Map(markAsTrue, func(d updateDividend) string {
		return d.ID
	})

	markAsFalse := arrayutils.Filter(dividends, func(d updateDividend) bool {
		return !d.Reinvested
	})
	markAsFalseIDs := arrayutils.Map(markAsFalse, func(d updateDividend) string {
		return d.ID
	})

	errTrue := dh.repository.UpdateDividends(user.Email, markAsTrueIDs, true)
	if errTrue != nil {
		dh.l.Error("Failed to update dividends", "error", errTrue.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to update dividends")
		return
	}
	errFalse := dh.repository.UpdateDividends(user.Email, markAsFalseIDs, false)
	if errFalse != nil {
		dh.l.Error("Failed to update dividends", "error", errFalse.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to update dividends")
		return
	}

	w.WriteHeader(http.StatusOK)
}
