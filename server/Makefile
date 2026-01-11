AWS_PROFILE=personal
AWS_ACCOUNT_ID=720505047185
AWS_REGION=eu-west-2

TURSO_DB_NAME=main

BUILDIR=bin
API_CMD_DIR=cmd/api
DEPLOYMENT_DIR=infrastructure

TARGET=bootstrap

BASE_PATH := $(shell pwd)

.PHONY:
dev:
	go run cmd/api/main.go

.PHONY: dirs
dirs:
	@mkdir -p db
	@mkdir -p $(BUILDIR)

.PHONY: test
test:
	go test ./...

$(TARGET): dirs
	@cd $(API_CMD_DIR) && \
		env GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o $(BASE_PATH)/$(BUILDIR)/$(TARGET)

.PHONY: build
build: $(TARGET)

.PHONY: deploy
deploy: build
	cd $(DEPLOYMENT_DIR) && \
		AWS_PROFILE=$(AWS_PROFILE) terraform apply -var-file="prod.tfvars"

.PHONY: build-image
build-image:
	docker build --platform linux/amd64 -t portfolio-analyzer:latest .

.PHONY: push-image
push-image: build-image
	AWS_PROFILE=$(AWS_PROFILE) aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
	docker tag portfolio-analyzer:latest $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/portfolio-analyzer:latest
	AWS_PROFILE=$(AWS_PROFILE) docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/portfolio-analyzer:latest

.PHONY: dump-prod-database
dump-prod-database: dirs
	rm -f db/local.sqlite
	turso db shell $(TURSO_DB_NAME) .dump > db/dump.sql
	cat db/dump.sql | sqlite3 db/local.sqlite
	rm -f db/dump.sql
