package main

import (
	"encoding/json"
	"os"
	"time"
)

// EndpointConfig defines rate limit settings for a single endpoint pattern.
type EndpointConfig struct {
	MaxTokens  float64       `json:"max_tokens"`
	RefillRate float64       `json:"refill_rate"` // tokens per second
	Window     time.Duration `json:"-"`
	WindowStr  string        `json:"window"` // human-readable, e.g. "1m", "1h"
}

// Config holds all rate limiter configuration.
type Config struct {
	Port      string                    `json:"port"`
	Endpoints map[string]EndpointConfig `json:"endpoints"`
}

// DefaultConfig returns the built-in configuration.
func DefaultConfig() *Config {
	return &Config{
		Port: "8787",
		Endpoints: map[string]EndpointConfig{
			"/api/ai/scan-website": {
				MaxTokens:  3,
				RefillRate:  3.0 / 3600.0, // 3 per hour
				Window:     time.Hour,
				WindowStr:  "1h",
			},
			"/api/ai/chat": {
				MaxTokens:  30,
				RefillRate:  30.0 / 60.0, // 30 per minute
				Window:     time.Minute,
				WindowStr:  "1m",
			},
			"/api/ai/generate-faq": {
				MaxTokens:  5,
				RefillRate:  5.0 / 3600.0, // 5 per hour
				Window:     time.Hour,
				WindowStr:  "1h",
			},
			"/api/agent/reply": {
				MaxTokens:  20,
				RefillRate:  20.0 / 60.0, // 20 per minute
				Window:     time.Minute,
				WindowStr:  "1m",
			},
			"/api/email/inbound": {
				MaxTokens:  60,
				RefillRate:  60.0 / 60.0, // 60 per minute
				Window:     time.Minute,
				WindowStr:  "1m",
			},
			"default": {
				MaxTokens:  100,
				RefillRate:  100.0 / 60.0, // 100 per minute
				Window:     time.Minute,
				WindowStr:  "1m",
			},
		},
	}
}

// LoadConfig loads configuration from environment and optional JSON file.
func LoadConfig() *Config {
	cfg := DefaultConfig()

	if port := os.Getenv("PORT"); port != "" {
		cfg.Port = port
	}

	configFile := os.Getenv("CONFIG_FILE")
	if configFile == "" {
		return cfg
	}

	data, err := os.ReadFile(configFile)
	if err != nil {
		logf("WARN: could not read config file %s: %v, using defaults", configFile, err)
		return cfg
	}

	var fileCfg Config
	if err := json.Unmarshal(data, &fileCfg); err != nil {
		logf("WARN: could not parse config file %s: %v, using defaults", configFile, err)
		return cfg
	}

	if fileCfg.Port != "" {
		cfg.Port = fileCfg.Port
	}

	// Merge file endpoints into defaults (file overrides)
	for pattern, ec := range fileCfg.Endpoints {
		// Parse window string into duration
		if ec.WindowStr != "" {
			d, err := time.ParseDuration(ec.WindowStr)
			if err == nil {
				ec.Window = d
			}
		}
		// Compute refill rate if not explicitly set
		if ec.RefillRate == 0 && ec.MaxTokens > 0 && ec.Window > 0 {
			ec.RefillRate = ec.MaxTokens / ec.Window.Seconds()
		}
		cfg.Endpoints[pattern] = ec
	}

	return cfg
}

// GetEndpointConfig returns the config for a given endpoint, falling back to default.
func (c *Config) GetEndpointConfig(endpoint string) EndpointConfig {
	if ec, ok := c.Endpoints[endpoint]; ok {
		return ec
	}
	return c.Endpoints["default"]
}
