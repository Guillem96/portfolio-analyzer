package utils

import "os"

func IsProdEnvironment() bool {
	return os.Getenv("ENVIRONMENT") == "prod"
}

func IsRunningInLambdaEnv() bool {
	runtime_api, _ := os.LookupEnv("AWS_LAMBDA_RUNTIME_API")
	return runtime_api != ""
}
