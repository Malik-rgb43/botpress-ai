package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	port := envOrDefault("PORT", "8788")
	intervalStr := envOrDefault("CHECK_INTERVAL", "60")
	appURL := envOrDefault("APP_URL", "https://botpress-ai.vercel.app")
	supabaseURL := os.Getenv("SUPABASE_URL")

	interval, err := strconv.Atoi(intervalStr)
	if err != nil || interval < 1 {
		interval = 60
	}

	// Build targets
	targets := []Target{
		{Name: "App (Homepage)", URL: appURL},
		{Name: "API (Webhook)", URL: appURL + "/api/webhook"},
	}
	if supabaseURL != "" {
		targets = append(targets, Target{
			Name: "Supabase",
			URL:  supabaseURL + "/rest/v1/",
		})
	}

	// 1440 entries = 24h at 1 check/min
	mon := NewMonitor(targets, 1440)

	// Run initial check immediately
	fmt.Printf("Health Monitor starting on :%s  interval=%ds  targets=%d\n", port, interval, len(targets))
	fmt.Println("Targets:")
	for _, t := range targets {
		fmt.Printf("  - %s: %s\n", t.Name, t.URL)
	}
	fmt.Println()

	mon.RunChecks()

	// Periodic checks
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	go func() {
		for range ticker.C {
			mon.RunChecks()
		}
	}()

	// Routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		data := BuildDashboardData(mon)
		if err := dashboardTemplate.Execute(w, data); err != nil {
			http.Error(w, err.Error(), 500)
		}
	})

	http.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		latest := mon.GetLatest()
		type statusResponse struct {
			OK        bool          `json:"ok"`
			Timestamp *time.Time    `json:"timestamp,omitempty"`
			Checks    []CheckResult `json:"checks"`
			Uptime    map[string]float64 `json:"uptime_24h"`
		}

		resp := statusResponse{
			OK:     true,
			Uptime: make(map[string]float64),
		}

		if latest != nil {
			ts := latest.Timestamp
			resp.Timestamp = &ts
			resp.Checks = latest.Checks
			for _, c := range latest.Checks {
				if !c.Healthy {
					resp.OK = false
				}
				resp.Uptime[c.Name] = mon.UptimePercent(c.Name)
			}
		}

		enc := json.NewEncoder(w)
		enc.SetIndent("", "  ")
		enc.Encode(resp)
	})

	log.Printf("Dashboard: http://localhost:%s\n", port)
	log.Printf("JSON API:  http://localhost:%s/api/status\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
