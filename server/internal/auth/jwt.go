package auth

import (
	"os"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

var JWT_SECRET = []byte(os.Getenv("JWT_SECRET"))

type Claims struct {
	User *domain.UserWithId
	jwt.RegisteredClaims
}
