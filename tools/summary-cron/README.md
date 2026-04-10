# Summary Cron — BotPress AI

Automated email summary reports for businesses. Fetches stats from Supabase, generates RTL Hebrew HTML emails, sends via Resend API.

## Setup

```bash
cd tools/summary-cron
pip install -r requirements.txt
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Service role key (bypasses RLS) |
| `RESEND_API_KEY` | No | Resend API key — if missing, saves HTML to file |
| `FREQUENCY` | No | `daily`, `weekly`, or `monthly` (default: `weekly`) |
| `DRY_RUN` | No | Set to `true` to preview without sending |
| `DASHBOARD_URL` | No | Base URL for CTA button (default: `https://botpress-ai.vercel.app`) |

## Usage

```bash
# Dry run — preview HTML
python summary.py --dry-run

# Send weekly summaries
python summary.py --frequency weekly

# Via env vars
FREQUENCY=daily DRY_RUN=true python summary.py
```

## Cron Setup

### GitHub Actions

```yaml
# .github/workflows/summary-cron.yml
name: Summary Emails
on:
  schedule:
    - cron: '0 7 * * *'    # Daily at 07:00 UTC
    - cron: '0 7 * * 0'    # Weekly on Sunday
    - cron: '0 7 1 * *'    # Monthly on 1st
  workflow_dispatch:
    inputs:
      frequency:
        type: choice
        options: [daily, weekly, monthly]

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r tools/summary-cron/requirements.txt
      - run: python tools/summary-cron/summary.py --frequency ${{ github.event.inputs.frequency || 'weekly' }}
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

### Vercel Cron

Add to `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/summary?frequency=daily", "schedule": "0 7 * * *" },
    { "path": "/api/cron/summary?frequency=weekly", "schedule": "0 7 * * 0" },
    { "path": "/api/cron/summary?frequency=monthly", "schedule": "0 7 1 * *" }
  ]
}
```

### Local crontab

```bash
# Every day at 07:00
0 7 * * * cd /path/to/project/tools/summary-cron && FREQUENCY=daily python summary.py
# Every Sunday at 07:00
0 7 * * 0 cd /path/to/project/tools/summary-cron && FREQUENCY=weekly python summary.py
# First of month at 07:00
0 7 1 * * cd /path/to/project/tools/summary-cron && FREQUENCY=monthly python summary.py
```

## What Gets Aggregated

For each business with matching `summary_settings.enabled = true` and `frequency`:

- **Conversations count** — from `conversations` table
- **Messages count** — from `messages` via conversation IDs
- **Escalation count** — from `escalations` via conversation IDs
- **Satisfaction average** — from `conversations.satisfaction_rating`
- **Top 5 questions** — from `unanswered_questions` + message intents
- **Period comparison** — all metrics compared to previous equivalent period (% change arrows)
