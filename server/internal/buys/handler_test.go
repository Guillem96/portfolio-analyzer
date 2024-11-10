package buys

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Guillem96/portfolio-analyzer-server/internal/auth"
	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

func TestBuysHandlers(t *testing.T) {

	t.Run("Create, list and delete work as expected", func(t *testing.T) {
		h := New(utils.NewBuysInMemoryRepository(), slog.Default())

		// Create a buy
		createBody := `{"units": 1, "ticker": "APPL", "date": "2021-01-01", "amount": 200, "currency": "€"}`
		request, _ := http.NewRequest(http.MethodPost, "/buys", bytes.NewBufferString(createBody))
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response := httptest.NewRecorder()
		h.CreateBuyHandler(response, request)
		assert.Equal(t, http.StatusOK, response.Code)

		var buyResponse domain.BuyWithId
		err := json.Unmarshal(response.Body.Bytes(), &buyResponse)
		assert.NoError(t, err)
		assert.Equal(t, "APPL", buyResponse.Ticker)

		// List my buys
		request, _ = http.NewRequest(http.MethodGet, "/buys", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})
		response = httptest.NewRecorder()
		h.ListBuysHandler(response, request)
		assert.Equal(t, http.StatusOK, response.Code)
		var buys []domain.BuyWithId
		err = json.Unmarshal(response.Body.Bytes(), &buys)
		assert.NoError(t, err)
		assert.Len(t, buys, 1)

		// List dividends of another user
		request, _ = http.NewRequest(http.MethodGet, "/dividends", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "another@email.com"},
		}})
		response = httptest.NewRecorder()
		h.ListBuysHandler(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
		err = json.Unmarshal(response.Body.Bytes(), &buys)
		assert.NoError(t, err)
		assert.Len(t, buys, 0)

		// Delete the buy
		request, _ = http.NewRequest(http.MethodDelete, "/buys/"+buyResponse.Id, nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})
		request = mux.SetURLVars(request, map[string]string{"id": buyResponse.Id})
		response = httptest.NewRecorder()
		h.DeleteBuyHandler(response, request)
		assert.Equal(t, http.StatusOK, response.Code)

		// List buys again
		request, _ = http.NewRequest(http.MethodGet, "/dividends", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})
		response = httptest.NewRecorder()
		h.ListBuysHandler(response, request)
		err = json.Unmarshal(response.Body.Bytes(), &buys)
		assert.NoError(t, err)
		assert.Len(t, buys, 0)
	})

	t.Run("Create fails with invalid data", func(t *testing.T) {
		h := New(utils.NewBuysInMemoryRepository(), slog.Default())

		// Create a buy with no units
		createBody := `{"units": 0, "ticker": "APPL", "date": "2021-01-01", "amount": 200, "currency": "€"}`
		request, _ := http.NewRequest(http.MethodPost, "/buys", bytes.NewBufferString(createBody))
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response := httptest.NewRecorder()
		h.CreateBuyHandler(response, request)
		assert.Equal(t, http.StatusBadRequest, response.Code)

		// Create a buy with no ticker
		createBody = `{"units": 1, "date": "2021-01-01", "amount": 200, "currency": "€"}`
		request, _ = http.NewRequest(http.MethodPost, "/buys", bytes.NewBufferString(createBody))
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response = httptest.NewRecorder()
		h.CreateBuyHandler(response, request)
		assert.Equal(t, http.StatusBadRequest, response.Code)
	})
}

func authenticateRequest(r *http.Request, claims *auth.Claims) *http.Request {
	ctx := context.WithValue(r.Context(), auth.UserKeyContext, claims)
	return r.WithContext(ctx)
}
