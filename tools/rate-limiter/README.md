# Rate Limiter Microservice

High-performance Go rate limiter for BotPress AI API routes. Uses token bucket algorithm with per-IP and per-API-key tracking.

## Quick Start

```bash
go build -o rate-limiter.exe .
./rate-limiter.exe
```

Server starts on port 8787 by default.

## API

### POST /check

Check if a request should be allowed.

```json
{
  "ip": "192.168.1.1",
  "endpoint": "/api/ai/chat",
  "api_key": "optional-key"
}
```

**Allowed response (200):**
```json
{
  "allowed": true,
  "remaining": 28,
  "reset_at": "2024-01-01T00:01:00Z"
}
```

**Denied response (429):**
```json
{
  "allowed": false,
  "retry_after": 45
}
```

### GET /health

Returns service status and basic stats.

### GET /stats

Returns detailed rate limit statistics per endpoint.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | HTTP server port |
| `CONFIG_FILE` | — | Path to JSON config file for custom limits |

### Default Limits

| Endpoint | Limit |
|----------|-------|
| `/api/ai/scan-website` | 3 req/hour |
| `/api/ai/chat` | 30 req/min |
| `/api/ai/generate-faq` | 5 req/hour |
| `/api/agent/reply` | 20 req/min |
| `/api/email/inbound` | 60 req/min |
| Default (any other) | 100 req/min |

### Custom Config File

```json
{
  "port": "9090",
  "endpoints": {
    "/api/custom": {
      "max_tokens": 10,
      "window": "1m"
    }
  }
}
```

## Integration with Next.js

Call from your Next.js API routes or middleware:

```typescript
const res = await fetch('http://localhost:8787/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
    endpoint: '/api/ai/chat',
  }),
});

const data = await res.json();
if (!data.allowed) {
  return new Response('Too Many Requests', { status: 429 });
}
```
