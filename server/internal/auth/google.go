package auth

import (
	"log"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const OAUTH_STATE = "random"

func GoogleOauthConfig(redirectUrl string) *oauth2.Config {
	clientId, present := os.LookupEnv("GOOGLE_AUTH_CLIENT_ID")
	if !present {
		log.Fatal("GOOGLE_AUTH_CLIENT_ID not found")
	}

	clientSecret, present := os.LookupEnv("GOOGLE_AUTH_CLIENT_SECRET")
	if !present {
		log.Fatal("GOOGLE_AUTH_CLIENT_SECRET not found")
	}

	return &oauth2.Config{
		RedirectURL:  redirectUrl,
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}
