package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/golang-jwt/jwt/v5"
)

type UserKey string

const UserKeyContext UserKey = "user"

func JwtMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr, err := getTokenFromRequest(r)
		if err != nil {
			log.Println("Error getting token from request", err)
			switch {
			case errors.Is(err, http.ErrNoCookie):
				utils.SendHTTPMessage(w, http.StatusUnauthorized, "auth token not found")
			default:
				utils.SendHTTPMessage(w, http.StatusInternalServerError, "server error")
			}
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return JWT_SECRET, nil
		})

		if err != nil || !token.Valid {
			utils.SendHTTPMessage(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Attach user information to request context
		ctx := context.WithValue(r.Context(), UserKeyContext, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getTokenFromRequest(r *http.Request) (string, error) {
	tokenStr := r.Header.Get("Authorization")
	if tokenStr != "" {
		parts := strings.Split(tokenStr, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return "", errors.New("invalid authorization header format")
		}

		return parts[1], nil
	}

	cookie, err := r.Cookie("portfolio-analyzer-token")
	if err != nil {
		return "", err
	}

	return cookie.Value, nil
}
