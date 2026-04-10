# Health Monitor

Lightweight Go service that periodically checks the health of the BotPress AI app and its dependencies.

## Quick Start

```bash
go build -o health-monitor.exe .
./health-monitor.exe
```

Open http://localhost:8788 for the dashboard.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8788` | HTTP server port |
| `CHECK_INTERVAL` | `60` | Seconds between checks |
| `APP_URL` | `https://botpress-ai.vercel.app` | Base URL to monitor |
| `SUPABASE_URL` | _(none)_ | Supabase project URL (enables Supabase check) |

## Endpoints

- `GET /` — HTML dashboard (auto-refreshes every 30s)
- `GET /api/status` — JSON API with all check results and 24h uptime

## Features

- Concurrent health checks via goroutines
- Circular buffer stores last 1440 checks (24h at 1/min)
- Response time history bars (last 10 checks)
- Uptime percentage calculation
- Zero external dependencies (stdlib only)
