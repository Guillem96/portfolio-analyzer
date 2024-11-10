FROM golang:1.22.9-alpine3.20 AS build

WORKDIR /build

ENV CGO_ENABLED=1
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
COPY internal internal
COPY cmd cmd

RUN go build -ldflags='-s -w -extldflags "-static"' \
    -tags lambda.norpc -o main ./cmd/api

FROM alpine:3.20
COPY --from=build /build/main /main
COPY static/dist /static/dist
ENTRYPOINT [ "/main" ]
