FROM golang:1.22.9-alpine3.20 AS build

WORKDIR /build

ENV CGO_ENABLED=1
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
COPY internal internal
COPY cmd cmd

RUN go build -ldflags='-s -w -extldflags "-static"' \
    -tags lambda.norpc -o main ./cmd/api

RUN go build -ldflags='-s -w -extldflags "-static"' \
    -tags lambda.norpc -o compute-value-task ./cmd/compute_value_task

RUN go build -ldflags='-s -w -extldflags "-static"' \
    -tags lambda.norpc -o exchange-rates-task ./cmd/exchange_rates_task

RUN go build -ldflags='-s -w -extldflags "-static"' \
    -tags lambda.norpc -o cache-tickers-task ./cmd/cache_tickers_task

FROM alpine:3.20
COPY --from=build /build/main /main
COPY --from=build /build/compute-value-task /compute-value-task
COPY --from=build /build/exchange-rates-task /exchange-rates-task
COPY --from=build /build/cache-tickers-task /cache-tickers-task
COPY static/dist /static/dist

ENTRYPOINT [ "/main" ]
