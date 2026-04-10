package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

// CheckResult holds the outcome of a single health check.
type CheckResult struct {
	Name       string        `json:"name"`
	URL        string        `json:"url"`
	Healthy    bool          `json:"healthy"`
	StatusCode int           `json:"status_code"`
	ResponseMs int64         `json:"response_ms"`
	Error      string        `json:"error,omitempty"`
	CheckedAt  time.Time     `json:"checked_at"`
}

// HistoryEntry stores a snapshot of all checks at a point in time.
type HistoryEntry struct {
	Checks    []CheckResult `json:"checks"`
	Timestamp time.Time     `json:"timestamp"`
}

// Monitor manages periodic health checks and stores history.
type Monitor struct {
	mu      sync.RWMutex
	targets []Target
	history []HistoryEntry // circular buffer
	maxHist int
	head    int
	count   int
	client  *http.Client
}

// Target defines an endpoint to check.
type Target struct {
	Name string
	URL  string
}

// NewMonitor creates a monitor with the given targets and buffer size.
func NewMonitor(targets []Target, bufferSize int) *Monitor {
	return &Monitor{
		targets: targets,
		history: make([]HistoryEntry, bufferSize),
		maxHist: bufferSize,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// checkOne performs a single HTTP GET and returns the result.
func (m *Monitor) checkOne(t Target) CheckResult {
	start := time.Now()
	result := CheckResult{
		Name:      t.Name,
		URL:       t.URL,
		CheckedAt: start,
	}

	resp, err := m.client.Get(t.URL)
	elapsed := time.Since(start)
	result.ResponseMs = elapsed.Milliseconds()

	if err != nil {
		result.Healthy = false
		result.Error = err.Error()
		return result
	}
	defer resp.Body.Close()

	result.StatusCode = resp.StatusCode
	result.Healthy = resp.StatusCode >= 200 && resp.StatusCode < 400

	return result
}

// RunChecks executes all health checks concurrently and stores the results.
func (m *Monitor) RunChecks() []CheckResult {
	results := make([]CheckResult, len(m.targets))
	var wg sync.WaitGroup

	for i, t := range m.targets {
		wg.Add(1)
		go func(idx int, target Target) {
			defer wg.Done()
			results[idx] = m.checkOne(target)
		}(i, t)
	}
	wg.Wait()

	entry := HistoryEntry{
		Checks:    results,
		Timestamp: time.Now(),
	}

	m.mu.Lock()
	m.history[m.head] = entry
	m.head = (m.head + 1) % m.maxHist
	if m.count < m.maxHist {
		m.count++
	}
	m.mu.Unlock()

	// Console log
	for _, r := range results {
		status := "OK"
		if !r.Healthy {
			status = "FAIL"
		}
		fmt.Printf("[%s] %-20s %s  %dms  status=%d  %s\n",
			r.CheckedAt.Format("15:04:05"), r.Name, status, r.ResponseMs, r.StatusCode, r.Error)
	}

	return results
}

// GetHistory returns all stored history entries in chronological order.
func (m *Monitor) GetHistory() []HistoryEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]HistoryEntry, 0, m.count)
	start := 0
	if m.count == m.maxHist {
		start = m.head // oldest is at head when buffer is full
	}
	for i := 0; i < m.count; i++ {
		idx := (start + i) % m.maxHist
		out = append(out, m.history[idx])
	}
	return out
}

// GetLatest returns the most recent check results, or nil if none.
func (m *Monitor) GetLatest() *HistoryEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.count == 0 {
		return nil
	}
	idx := (m.head - 1 + m.maxHist) % m.maxHist
	entry := m.history[idx]
	return &entry
}

// UptimePercent calculates the percentage of checks where a given target was healthy.
func (m *Monitor) UptimePercent(targetName string) float64 {
	history := m.GetHistory()
	if len(history) == 0 {
		return 100.0
	}

	total := 0
	healthy := 0
	for _, entry := range history {
		for _, c := range entry.Checks {
			if c.Name == targetName {
				total++
				if c.Healthy {
					healthy++
				}
			}
		}
	}
	if total == 0 {
		return 100.0
	}
	return float64(healthy) / float64(total) * 100.0
}

// ResponseTimeHistory returns the last N response times for a target.
func (m *Monitor) ResponseTimeHistory(targetName string, n int) []int64 {
	history := m.GetHistory()
	var times []int64
	for _, entry := range history {
		for _, c := range entry.Checks {
			if c.Name == targetName {
				times = append(times, c.ResponseMs)
			}
		}
	}
	if len(times) > n {
		times = times[len(times)-n:]
	}
	return times
}
