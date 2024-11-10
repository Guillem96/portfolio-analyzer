package dividends

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

func TestDividendHandlers(t *testing.T) {

	t.Run("Create, list and delete work as expected", func(t *testing.T) {
		h := New(utils.NewDividedndsInMemoryRepository(), slog.Default())

		// Create a dividend
		createBody := `{"doubleTaxationOrigin": 0, "doubleTaxationDestination": 0, "company": "APPL", "date": "2021-01-01", "amount": 200, "currency": "$"}`
		request, _ := http.NewRequest(http.MethodPost, "/dividends", bytes.NewBufferString(createBody))
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response := httptest.NewRecorder()
		h.CreateDividendHandler(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
		var divResponse domain.DividendWithId
		err := json.Unmarshal(response.Body.Bytes(), &divResponse)
		assert.NoError(t, err)
		assert.Equal(t, "APPL", divResponse.Company)

		// List my dividends
		request, _ = http.NewRequest(http.MethodGet, "/dividends", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response = httptest.NewRecorder()
		h.ListDividendsHandler(response, request)
		assert.Equal(t, http.StatusOK, response.Code)
		var divs []domain.DividendWithId
		err = json.Unmarshal(response.Body.Bytes(), &divs)
		assert.NoError(t, err)
		assert.Len(t, divs, 1)

		// List dividends of another user
		request, _ = http.NewRequest(http.MethodGet, "/dividends", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "another@email.com"},
		}})

		response = httptest.NewRecorder()
		h.ListDividendsHandler(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
		err = json.Unmarshal(response.Body.Bytes(), &divs)
		assert.NoError(t, err)
		assert.Len(t, divs, 0)

		// Delete the dividend
		request, _ = http.NewRequest(http.MethodDelete, "/dividends/"+divResponse.Id, nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		request = mux.SetURLVars(request, map[string]string{"id": divResponse.Id})
		response = httptest.NewRecorder()
		h.DeleteDividendHandler(response, request)
		assert.Equal(t, http.StatusOK, response.Code)

		// List dividends again
		request, _ = http.NewRequest(http.MethodGet, "/dividends", nil)
		request = authenticateRequest(request, &auth.Claims{User: &domain.UserWithId{
			User: domain.User{Email: "test@email.com"},
		}})

		response = httptest.NewRecorder()
		h.ListDividendsHandler(response, request)
		err = json.Unmarshal(response.Body.Bytes(), &divs)
		assert.NoError(t, err)
		assert.Len(t, divs, 0)
	})
}

func authenticateRequest(r *http.Request, claims *auth.Claims) *http.Request {
	ctx := context.WithValue(r.Context(), auth.UserKeyContext, claims)
	return r.WithContext(ctx)
}
