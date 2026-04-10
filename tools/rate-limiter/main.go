package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func logf(format string, args ...any) {
	log.Printf("[rate-limiter] "+format, args...)
}

func main() {
	cfg := LoadConfig()
	rl := NewRateLimiter(cfg)
	defer rl.Stop()

	startTime := time.Now()

	mux := http.NewServeMux()
	RegisterHandlers(mux, rl, startTime)

	addr := ":" + cfg.Port
	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		logf("Starting rate limiter on %s", addr)
		logf("Endpoints configured: %d", len(cfg.Endpoints))
		for ep, ec := range cfg.Endpoints {
			logf("  %-30s → %.0f req/%s", ep, ec.MaxTokens, ec.WindowStr)
		}
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
			os.Exit(1)
		}
	}()

	sig := <-quit
	logf("Received signal %v, shutting down...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logf("Shutdown error: %v", err)
	}

	logf("Server stopped. Total requests served: %d", rl.stats.TotalRequests.Load())
}
