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

type sellFIFORuleOutput struct {
	meanAcquisitionValue float32
	accumulatedFees      float32
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

	buys, err := h.br.FindByTickerAndCurrency(csr.Ticker, csr.Currency, userEmail)
	if err != nil {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find buys")
		return
	}

	if len(buys) == 0 {
		utils.SendHTTPMessage(w, http.StatusBadRequest, "No buys found for the given ticker and currency")
		return
	}

	alreadySold, err := h.sr.FindByTicker(csr.Ticker, userEmail)
	if err != nil {
		h.l.Error("Failed to find previous sells", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find previous sells")
		return
	}

	fifo, err := computeFIFOSellRule(buys, alreadySold, csr.Units)
	if err != nil {
		utils.SendHTTPMessage(w, http.StatusBadRequest, err.Error())
		return
	}

	sell := domain.Sell{
		Units:            csr.Units,
		Ticker:           csr.Ticker,
		AcquisitionValue: fifo.meanAcquisitionValue,
		AccumulatedFees:  fifo.accumulatedFees,
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

func computeFIFOSellRule(buys domain.Buys, sells domain.Sells, soldUnits float32) (sellFIFORuleOutput, error) {
	boughtUnits := arrayutils.Reduce(buys, 0, func(agg float32, b domain.BuyWithId) float32 {
		return agg + b.Buy.Units
	})

	alreadySoldUnits := arrayutils.Reduce(sells, 0, func(agg float32, s domain.SellWithId) float32 {
		return agg + s.Sell.Units
	})

	remainingUnits := boughtUnits - alreadySoldUnits
	if remainingUnits < soldUnits {
		return sellFIFORuleOutput{}, fmt.Errorf("not enough units to sell")
	}

	// Get all buy packets for example if in the past I did 4 purchases of 100 shares
	// here I'll get [100, 100, 100, 100]
	packetsRemaining := arrayutils.Map(buys, func(b domain.BuyWithId) float32 {
		return b.Buy.Units
	})

	// In this loop we clear the already sold packets. For example, if in the past I sold 150 units
	// the state after this loop will be
	// packetsRemaining := [0, 50, 100, 100]
	i := 0
	for alreadySoldUnits > 0 {
		packet := packetsRemaining[i]
		if packet <= alreadySoldUnits {
			packetsRemaining[i] = 0
			alreadySoldUnits -= packet
			i++
		} else {
			packetsRemaining[i] -= alreadySoldUnits
			alreadySoldUnits = 0
			break
		}
	}

	// Here starting from the startingPackageIndex (i) we obtain the weighted cost of the purchases
	weightedSum := 0.0
	var accumulatedFees float32
	j := i
	soldUnitsIt := soldUnits
	for soldUnitsIt > 0 {
		currentBuy := buys[j]
		currentBuyRemainingUnits := packetsRemaining[j]
		packetUnitValue := float64(currentBuy.Buy.Amount) / float64(currentBuy.Buy.Units)
		weightedSum += float64(currentBuyRemainingUnits) * packetUnitValue

		if currentBuyRemainingUnits <= soldUnitsIt {
			soldUnitsIt -= currentBuyRemainingUnits
			accumulatedFees += currentBuy.Buy.Fee
			j++
		} else {
			// Partially consume the packet and exit because there's no more sold units
			soldUnitsIt = 0
			break
		}
	}

	return sellFIFORuleOutput{
		meanAcquisitionValue: float32(weightedSum) / float32(soldUnits),
		accumulatedFees:      accumulatedFees,
	}, nil
}
