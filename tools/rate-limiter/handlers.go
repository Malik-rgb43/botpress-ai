package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"
)

// CheckRequest is the JSON body for POST /check.
type CheckRequest struct {
	IP       string `json:"ip"`
	Endpoint string `json:"endpoint"`
	APIKey   string `json:"api_key,omitempty"`
}

// CheckResponseAllowed is returned when the request is allowed.
type CheckResponseAllowed struct {
	Allowed   bool   `json:"allowed"`
	Remaining int    `json:"remaining"`
	ResetAt   string `json:"reset_at"`
}

// CheckResponseDenied is returned when the request is denied.
type CheckResponseDenied struct {
	Allowed    bool    `json:"allowed"`
	RetryAfter float64 `json:"retry_after"`
}

// HealthResponse is returned by GET /health.
type HealthResponse struct {
	Status        string `json:"status"`
	Uptime        string `json:"uptime"`
	TotalRequests int64  `json:"total_requests"`
	Allowed       int64  `json:"allowed"`
	Denied        int64  `json:"denied"`
	ActiveBuckets int64  `json:"active_buckets"`
}

// StatsResponse is returned by GET /stats.
type StatsResponse struct {
	TotalRequests  int64            `json:"total_requests"`
	Allowed        int64            `json:"allowed"`
	Denied         int64            `json:"denied"`
	ActiveBuckets  int64            `json:"active_buckets"`
	DenyRate       string           `json:"deny_rate"`
	EndpointCounts map[string]int64 `json:"endpoint_counts"`
}

// RegisterHandlers sets up the HTTP routes.
func RegisterHandlers(mux *http.ServeMux, rl *RateLimiter, startTime time.Time) {
	mux.HandleFunc("/check", makeCheckHandler(rl))
	mux.HandleFunc("/health", makeHealthHandler(rl, startTime))
	mux.HandleFunc("/stats", makeStatsHandler(rl))
}

func makeCheckHandler(rl *RateLimiter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}

		var req CheckRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		if req.IP == "" || req.Endpoint == "" {
			http.Error(w, `{"error":"ip and endpoint are required"}`, http.StatusBadRequest)
			return
		}

		// Use API key as identifier if provided, otherwise IP
		identifier := req.IP
		if req.APIKey != "" {
			identifier = "key:" + req.APIKey
		}

		allowed, remaining, resetAt, retryAfter := rl.Check(identifier, req.Endpoint)

		logf("CHECK ip=%s endpoint=%s allowed=%v remaining=%.0f", req.IP, req.Endpoint, allowed, remaining)

		w.Header().Set("Content-Type", "application/json")

		if allowed {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(CheckResponseAllowed{
				Allowed:   true,
				Remaining: int(remaining),
				ResetAt:   resetAt.UTC().Format(time.RFC3339),
			})
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(CheckResponseDenied{
				Allowed:    false,
				RetryAfter: retryAfter,
			})
		}
	}
}

func makeHealthHandler(rl *RateLimiter, startTime time.Time) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}

		uptime := time.Since(startTime).Round(time.Second)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{
			Status:        "ok",
			Uptime:        uptime.String(),
			TotalRequests: rl.stats.TotalRequests.Load(),
			Allowed:       rl.stats.AllowedCount.Load(),
			Denied:        rl.stats.DeniedCount.Load(),
			ActiveBuckets: rl.stats.ActiveBuckets.Load(),
		})
	}
}

func makeStatsHandler(rl *RateLimiter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}

		total := rl.stats.TotalRequests.Load()
		denied := rl.stats.DeniedCount.Load()
		denyRate := "0.0%"
		if total > 0 {
			denyRate = fmt.Sprintf("%.1f%%", float64(denied)/float64(total)*100)
		}

		endpointCounts := make(map[string]int64)
		rl.stats.EndpointCounts.Range(func(key, value any) bool {
			endpointCounts[key.(string)] = value.(*atomic.Int64).Load()
			return true
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(StatsResponse{
			TotalRequests:  total,
			Allowed:        rl.stats.AllowedCount.Load(),
			Denied:         denied,
			ActiveBuckets:  rl.stats.ActiveBuckets.Load(),
			DenyRate:       denyRate,
			EndpointCounts: endpointCounts,
		})
	}
}
