package main

import (
	"math"
	"sync"
	"sync/atomic"
	"time"
)

// Bucket represents a token bucket for a single IP+endpoint pair.
type Bucket struct {
	mu         sync.Mutex
	tokens     float64
	maxTokens  float64
	refillRate float64 // tokens per second
	lastRefill time.Time
	lastAccess time.Time
}

// newBucket creates a new token bucket starting full.
func newBucket(maxTokens, refillRate float64) *Bucket {
	now := time.Now()
	return &Bucket{
		tokens:     maxTokens,
		maxTokens:  maxTokens,
		refillRate: refillRate,
		lastRefill: now,
		lastAccess: now,
	}
}

// Allow attempts to consume one token. Returns (allowed, remaining, resetAt).
func (b *Bucket) Allow() (bool, float64, time.Time) {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	b.lastAccess = now

	// Refill tokens based on elapsed time
	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens = math.Min(b.maxTokens, b.tokens+elapsed*b.refillRate)
	b.lastRefill = now

	// Calculate when bucket will be full again
	resetAt := now.Add(time.Duration((b.maxTokens-b.tokens)/b.refillRate*1000) * time.Millisecond)

	if b.tokens >= 1.0 {
		b.tokens -= 1.0
		remaining := math.Floor(b.tokens)
		return true, remaining, resetAt
	}

	// Calculate retry-after: time until 1 token is available
	return false, 0, resetAt
}

// RetryAfter returns how many seconds until the next token is available.
func (b *Bucket) RetryAfter() float64 {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.tokens >= 1.0 {
		return 0
	}
	needed := 1.0 - b.tokens
	return math.Ceil(needed / b.refillRate)
}

// IsExpired returns true if the bucket hasn't been accessed for the given duration.
func (b *Bucket) IsExpired(ttl time.Duration) bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	return time.Since(b.lastAccess) > ttl
}

// RateLimiter manages token buckets for all IP+endpoint combinations.
type RateLimiter struct {
	config  *Config
	buckets sync.Map // key: "ip:endpoint" -> *Bucket
	stats   Stats
	stopCh  chan struct{}
}

// Stats tracks rate limiter statistics.
type Stats struct {
	TotalRequests  atomic.Int64
	AllowedCount   atomic.Int64
	DeniedCount    atomic.Int64
	ActiveBuckets  atomic.Int64
	EndpointCounts sync.Map // endpoint -> *atomic.Int64 (total hits)
}

// NewRateLimiter creates a new rate limiter with the given config.
func NewRateLimiter(cfg *Config) *RateLimiter {
	rl := &RateLimiter{
		config: cfg,
		stopCh: make(chan struct{}),
	}
	go rl.cleanupLoop()
	return rl
}

// Check evaluates whether a request from ip to endpoint is allowed.
func (rl *RateLimiter) Check(ip, endpoint string) (allowed bool, remaining float64, resetAt time.Time, retryAfter float64) {
	rl.stats.TotalRequests.Add(1)
	rl.incrementEndpoint(endpoint)

	key := ip + ":" + endpoint
	ec := rl.config.GetEndpointConfig(endpoint)

	val, loaded := rl.buckets.LoadOrStore(key, newBucket(ec.MaxTokens, ec.RefillRate))
	if !loaded {
		rl.stats.ActiveBuckets.Add(1)
	}

	bucket := val.(*Bucket)
	allowed, remaining, resetAt = bucket.Allow()

	if allowed {
		rl.stats.AllowedCount.Add(1)
	} else {
		rl.stats.DeniedCount.Add(1)
		retryAfter = bucket.RetryAfter()
	}
	return
}

func (rl *RateLimiter) incrementEndpoint(endpoint string) {
	val, _ := rl.stats.EndpointCounts.LoadOrStore(endpoint, &atomic.Int64{})
	val.(*atomic.Int64).Add(1)
}

// cleanupLoop removes expired buckets every 5 minutes.
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.cleanup()
		case <-rl.stopCh:
			return
		}
	}
}

func (rl *RateLimiter) cleanup() {
	ttl := 10 * time.Minute
	removed := 0
	rl.buckets.Range(func(key, value any) bool {
		bucket := value.(*Bucket)
		if bucket.IsExpired(ttl) {
			rl.buckets.Delete(key)
			rl.stats.ActiveBuckets.Add(-1)
			removed++
		}
		return true
	})
	if removed > 0 {
		logf("Cleanup: removed %d expired buckets", removed)
	}
}

// Stop shuts down the background cleanup goroutine.
func (rl *RateLimiter) Stop() {
	close(rl.stopCh)
}
