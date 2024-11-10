package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

func SendHTTPMessage(w http.ResponseWriter, statusCode int, message string) {
	var resMsg struct {
		Message string `json:"message"`
	}
	resMsg.Message = message

	jsonResponse, err := json.Marshal(resMsg)
	if err != nil {
		log.Fatal("error serializing message:" + err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(jsonResponse)
}
