package sells

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/go-playground/validator"
	"github.com/gorilla/mux"
	"github.com/judedaryl/go-arrayutils"
)

type Handler struct {
	sr domain.SellsRepository
	br domain.BuysRepository
	l  *slog.Logger
}

func New(sr domain.SellsRepository, br domain.BuysRepository, l *slog.Logger) *Handler {
	return &Handler{sr: sr, br: br, l: l}
}

type CreateSellRequest struct {
	Ticker   string      `json:"ticker" validate:"required"`
	Units    float32     `json:"units" validate:"required,gt=0"`
	Fees     float32     `json:"fees" validate:"required,gt=0"`
	Amount   float32     `json:"amount" validate:"required,gt=0"`
	Currency string      `json:"currency" validate:"required,eq=$|eq=€|eq=£"`
	Date     domain.Date `json:"date" validate:"required"`
}

func (h *Handler) CreateSellHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User
	userEmail := user.Email

	var csr CreateSellRequest
	if err := json.NewDecoder(r.Body).Decode(&csr); err != nil {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to parse request body")
		return
	}

	validate := validator.New()
	if err := validate.Struct(csr); err != nil {
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	buys, err := h.br.FindByTicker(csr.Ticker, userEmail)
	if err != nil {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find buys")
		return
	}

	alreadySold, err := h.sr.FindByTicker(csr.Ticker, userEmail)
	if err != nil {
		h.l.Error("Failed to find previous sells", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find previous sells")
		return
	}

	acquisitionValue, err := computeAcquisitionValue(buys, alreadySold, csr.Units)
	if err != nil {
		utils.SendHTTPMessage(w, http.StatusBadRequest, err.Error())
		return
	}

	sell := domain.Sell{
		Units:            csr.Units,
		Ticker:           csr.Ticker,
		AcquisitionValue: acquisitionValue,
		Amount:           csr.Amount,
		Currency:         csr.Currency,
		Date:             csr.Date,
		Fees:             csr.Fees,
	}

	newSell, err := h.sr.Create(sell, userEmail)
	if err != nil {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to create sell")
		return
	}

	if err := newSell.ToJSON(w); err != nil {
		h.l.Error("Failed to serialize sell", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize sell")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) ListSellsHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	sells, err := h.sr.FindAll(user.Email)
	if err != nil {
		h.l.Error("Failed to find sells", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find sells")
		return
	}

	if err := json.NewEncoder(w).Encode(sells); err != nil {
		h.l.Error("Failed to serialize sells", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to serialize sells")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) DeleteSellHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(auth.UserKeyContext).(*auth.Claims)
	user := claims.User

	vars := mux.Vars(r)
	id, present := vars["id"]
	if !present {
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Missing id parameter")
		return
	}

	if err := h.sr.Delete(id, user.Email); err != nil {
		h.l.Error("Failed to delete sell", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to delete sell")
		return
	}
	utils.SendHTTPMessage(w, http.StatusOK, "Sell deleted successfully")
}

func computeAcquisitionValue(buys domain.Buys, sells domain.Sells, soldUnits float32) (float32, error) {
	boughtUnits := arrayutils.Reduce(buys, 0, func(agg float32, b domain.BuyWithId) float32 {
		return agg + b.Buy.Units
	})

	alreadySoldUnits := arrayutils.Reduce(sells, 0, func(agg float32, s domain.SellWithId) float32 {
		return agg + s.Sell.Units
	})

	remainingUnits := boughtUnits - alreadySoldUnits
	if remainingUnits < soldUnits {
		return 0, fmt.Errorf("not enough units to sell")
	}

	packetsRemaining := arrayutils.Map(buys, func(b domain.BuyWithId) float32 {
		return b.Buy.Units
	})

	startingPackageIndex := 0
	i := 0
	for alreadySoldUnits > 0 {
		packet := packetsRemaining[i]
		if packet <= alreadySoldUnits {
			packetsRemaining[i] = 0
			alreadySoldUnits -= packet
			startingPackageIndex++
			i++
		} else {
			packetsRemaining[i] -= alreadySoldUnits
			alreadySoldUnits = 0
			break
		}
	}

	weightedSum := 0.0
	j := startingPackageIndex
	soldUnitsIt := soldUnits
	for soldUnitsIt > 0 {
		currentBuy := buys[j]
		if currentBuy.Buy.Units <= soldUnitsIt {
			weightedSum += float64(currentBuy.Buy.Amount)
			soldUnitsIt -= currentBuy.Buy.Units
			j++
		} else {
			packetUnitValue := float64(currentBuy.Buy.Amount) / float64(currentBuy.Buy.Units)
			weightedSum += float64(soldUnitsIt) * packetUnitValue
			soldUnitsIt = 0
			break
		}
	}

	return float32(weightedSum) / float32(soldUnits), nil
}
