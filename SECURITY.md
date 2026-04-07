# Security Policy — BotPress AI

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:
- Email: security@botpress-ai.com
- Do NOT open a public GitHub issue for security vulnerabilities
- We aim to respond within 48 hours

## Security Architecture

### Authentication & Authorization
- **Auth Provider:** Supabase Auth (email/password, OAuth)
- **Session Management:** Supabase JWT tokens with automatic refresh
- **Row Level Security (RLS):** Enforced on all database tables
- **API Routes:** All authenticated endpoints verify user session via `supabase.auth.getUser()`
- **Webhook Auth:** WhatsApp (X-Hub-Signature-256), Email poll (CRON_SECRET), Push/Inbound (secret param)
- **OAuth CSRF:** State parameter stored in httpOnly cookie

### Data Protection
- **Encryption at rest:** Supabase (AES-256)
- **Encryption in transit:** TLS 1.3 (Vercel + Supabase)
- **Sensitive data:** Gmail OAuth tokens stripped from client-side responses
- **PII:** Customer data stored in Supabase with RLS, never exposed cross-business

### Input Validation & Sanitization
- **XSS:** escapeHtml on all user content in emails (quotes, angles, ampersands)
- **SSRF:** Private IP blocking + redirect:manual on all URL fetches
- **SQL Injection:** Supabase client library with parameterized queries
- **LLM Prompt Injection:** 20+ injection patterns filtered, output validated
- **Email Template:** primaryColor (hex-only), logoUrl (https-only), footerText (escaped)

### Infrastructure
- **Hosting:** Vercel (DDoS protection, edge CDN, automatic TLS)
- **Database:** Supabase (PostgreSQL 17, encrypted, daily backups)
- **CDN:** Cloudflare via Vercel
- **CSP:** Content-Security-Policy header with strict directives

### Monitoring & CI/CD
- **CI:** GitHub Actions (type check, build, npm audit, CodeQL, TruffleHog)
- **Dependency Scanning:** Dependabot (weekly), npm audit (on every push)
- **Secret Scanning:** TruffleHog in CI pipeline
- **SAST:** CodeQL analysis on every push/PR

## Secret Rotation Policy

| Secret | Rotation Frequency | How to Rotate |
|--------|-------------------|---------------|
| GEMINI_API_KEY | Quarterly | Google AI Studio → API Keys → Create new → Update Vercel env → Delete old |
| SUPABASE_SERVICE_ROLE_KEY | On compromise only | Supabase Dashboard → Settings → API → Generate new key |
| GOOGLE_CLIENT_SECRET | On compromise only | Google Cloud Console → OAuth → Create new credentials |
| WHATSAPP_APP_SECRET | On compromise only | Meta Developer Console → App Settings |
| CRON_SECRET | Quarterly | Generate: `openssl rand -hex 32` → Update Vercel env + cron config |

### Rotation Checklist
1. Generate new secret
2. Update in Vercel Environment Variables
3. Deploy to verify
4. Delete/revoke old secret
5. Log rotation date

## MFA Policy
- MFA is available via Supabase Auth
- Recommended for all admin accounts
- Can be enforced via Supabase Dashboard → Authentication → Settings

## Environment Separation

| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | botpress-ai.vercel.app | Live customers |
| Preview | *.vercel.app (PR deploys) | PR review |
| Local | localhost:3000 | Development |

Vercel automatically creates preview deployments for each PR, providing staging-like isolation.

## OWASP LLM Top 10 Mitigations

| Risk | Mitigation |
|------|-----------|
| LLM01: Prompt Injection | sanitizeLLMInput() strips 20+ injection patterns |
| LLM02: Insecure Output | validateLLMOutput() strips leaked prompts + phishing URLs |
| LLM03: Training Data Poisoning | N/A (using Google's Gemini, not fine-tuned) |
| LLM04: Model DoS | Token limits on all Gemini calls (250-8000 max) |
| LLM05: Supply Chain | npm audit + Dependabot + lockfile |
| LLM06: Sensitive Info Disclosure | System prompts never exposed to client |
| LLM07: Insecure Plugin Design | No plugins/extensions on AI |
| LLM08: Excessive Agency | AI cannot execute code, only generate text responses |
| LLM09: Overreliance | Escalation to human agent when AI uncertain |
| LLM10: Model Theft | Using cloud API (Gemini), no local models |

## Compliance
- **Data Residency:** EU (Supabase eu-central-1)
- **GDPR:** Data deletion available via Supabase, consent managed per business
- **SOC 2:** Supabase and Vercel are SOC 2 Type II certified
