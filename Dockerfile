# Stage 1: Build Go compiler
FROM golang:1.23-alpine AS compiler-builder
WORKDIR /app
COPY compiler/ ./compiler/
WORKDIR /app/compiler
RUN go build -o blaze

# Stage 2: Build SolidJS app thingy
FROM oven/bun AS website-builder
WORKDIR /app
COPY website/ ./
COPY --from=compiler-builder /app/compiler/blaze ./blaze
RUN bun install
RUN bun run build

# Stage 3: Final stage
FROM oven/bun
RUN apt-get update && apt-get install -y golang-go
WORKDIR /app
COPY --from=website-builder /app/.output ./.output
COPY --from=website-builder /app/blaze ./blaze
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]