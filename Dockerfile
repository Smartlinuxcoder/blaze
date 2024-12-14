# Stage 1: Build Go compiler
FROM golang:1.23-alpine AS compiler-builder
WORKDIR /app
COPY compiler/ ./compiler/
WORKDIR /app/compiler
RUN go build -o blaze

# Stage 2: Build SolidJS app thingy
FROM oven/bun:alpine AS website-builder
WORKDIR /app
COPY website/ ./
COPY --from=compiler-builder /app/compiler/blaze ./blaze
RUN bun install
RUN bun run build

# Stage 3: Final stage
FROM oven/bun:latest

# HELL
RUN apt-get update && apt-get install -y wget && \
    wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz && \
    rm -rf /usr/local/go && \
    tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz && \
    rm go1.21.5.linux-amd64.tar.gz && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin"

WORKDIR /app
COPY --from=website-builder /app/.output ./.output
COPY --from=website-builder /app/blaze ./blaze
RUN mkdir -p /app/uploads

ENV GOOS=linux
ENV GOARCH=amd64

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]