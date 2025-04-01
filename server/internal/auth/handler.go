package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/Guillem96/portfolio-analyzer-server/internal/utils"
	"github.com/go-playground/validator"
	"github.com/golang-jwt/jwt/v5"
)

type Handler struct {
	ur          domain.UserRepository
	redirectUrl string
	l           *slog.Logger
}

func New(ur domain.UserRepository, host string, logger *slog.Logger) *Handler {
	schema := "http://"
	if utils.IsProdEnvironment() {
		schema = "https://"
	}

	return &Handler{
		ur:          ur,
		redirectUrl: fmt.Sprintf("%s%s/auth/google/callback", schema, host),
		l:           logger,
	}
}

func (ah *Handler) HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := GoogleOauthConfig(ah.redirectUrl).AuthCodeURL(OAUTH_STATE)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (ah *Handler) HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	if r.FormValue("state") != OAUTH_STATE {
		ah.l.Error("Invalid OAuth state")
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Invalid OAuth state")
		return
	}

	code := r.FormValue("code")
	token, err := GoogleOauthConfig(ah.redirectUrl).Exchange(context.Background(), code)
	if err != nil {
		ah.l.Error("Failed to exchange code", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to exchange code")
		return
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		ah.l.Error("Failed to get user info", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to get user info")
		return
	}
	defer response.Body.Close()

	var googleUser struct {
		Email      string `json:"email"`
		Name       string `json:"given_name"`
		FamilyName string `json:"family_name"`
		Picture    string `json:"picture"`
	}

	if err = json.NewDecoder(response.Body).Decode(&googleUser); err != nil {
		ah.l.Error("Failed to decode user info", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to decode user info")
		return
	}

	user := domain.User{
		Email:   googleUser.Email,
		Name:    googleUser.Name + " " + googleUser.FamilyName,
		Picture: googleUser.Picture,
	}

	existingUser, err := ah.ur.FindByEmail(user.Email)
	if err != nil {
		ah.l.Error("Failed to find user", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find user")
		return
	}

	if existingUser == nil {
		ah.l.Info("Creating new user", "email", user.Email)
		existingUser, err = ah.ur.Create(user)
		if err != nil {
			ah.l.Error("Failed to create user", "error", err.Error())
			utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to create user")
			return
		}
	}

	// Create JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		User: existingUser,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(JWT_SECRET)
	if err != nil {
		ah.l.Error("Failed to generate JWT token", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to generate JWT token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "portfolio-analyzer-token",
		Value:    tokenString,
		MaxAge:   int((24 * 7 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   utils.IsProdEnvironment(),
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})

	// Redirect to a frontend page or return the token as JSON
	frontendUrl, present := os.LookupEnv("FRONTEND_URL")
	if !present {
		http.Redirect(w, r, "/portfolio-analyzer/", http.StatusTemporaryRedirect)
	} else {
		http.Redirect(w, r, frontendUrl, http.StatusTemporaryRedirect)
	}
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(map[string]string{
	// 	"token": tokenString,
	// })
}

func (ah *Handler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "portfolio-analyzer-token",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   utils.IsProdEnvironment(),
	})
	utils.SendHTTPMessage(w, http.StatusOK, "Logged out")
}

func (ah *Handler) HandleUserInfo(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(UserKeyContext).(*Claims)
	if !ok {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Could not retrieve user from context")
		return
	}

	foundUser, err := ah.ur.FindByID(claims.User.Id)
	if err != nil {
		ah.l.Error("Failed to find user", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to find user")
		return
	}

	if foundUser == nil {
		utils.SendHTTPMessage(w, http.StatusNotFound, "User not found")
		return
	}

	if err := foundUser.ToJSON(w); err != nil {
		ah.l.Error("Failed to encode user info", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to encode user info")
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

func (ah *Handler) UpdateUserPreferences(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(UserKeyContext).(*Claims)
	if !ok {
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Could not retrieve user from context")
		return
	}

	var preferencesToUpdate struct {
		PreferredCurrency string `json:"preferredCurrency" validate:"eq=$|eq=€|eq=£"`
	}

	if err := json.NewDecoder(r.Body).Decode(&preferencesToUpdate); err != nil {
		ah.l.Error("Failed to decode user preferences", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, "Failed to decode user preferences")
		return
	}

	v := validator.New()
	if err := v.Struct(preferencesToUpdate); err != nil {
		ah.l.Error("Invalid user preferences", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusBadRequest, fmt.Sprintf("Invalid user preferences: %v", err))
		return
	}

	if err := ah.ur.UpdatePreferences(claims.User.Id, preferencesToUpdate.PreferredCurrency); err != nil {
		ah.l.Error("Failed to update user preferences", "error", err.Error())
		utils.SendHTTPMessage(w, http.StatusInternalServerError, "Failed to update user preferences")
		return
	}

	w.WriteHeader(http.StatusOK)
}
