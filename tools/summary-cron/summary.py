#!/usr/bin/env python3
"""
BotPress AI — Automated Email Summary Report Generator

Fetches businesses with enabled summary settings from Supabase,
aggregates conversation/message/escalation stats for the period,
generates an HTML email, and sends via Resend API.

Environment variables:
  SUPABASE_URL        — Supabase project URL
  SUPABASE_SERVICE_KEY — Service role key (server-side access)
  RESEND_API_KEY      — Resend API key (optional — logs HTML if missing)
  FREQUENCY           — "daily", "weekly", or "monthly"
  DRY_RUN             — "true" to print HTML without sending
  DASHBOARD_URL       — Base URL for dashboard CTA (default: https://botpress-ai.vercel.app)

Usage:
  python summary.py                  # Uses FREQUENCY env var
  python summary.py --frequency daily
  python summary.py --dry-run        # Print HTML, don't send
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timedelta, timezone

import requests
from supabase import create_client, Client

from email_template import build_summary_html

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("summary-cron")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "https://botpress-ai.vercel.app")

FREQUENCY_LABELS = {
    "daily": "יומי",
    "weekly": "שבועי",
    "monthly": "חודשי",
}


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------
def get_period_range(frequency: str) -> tuple[datetime, datetime, datetime, datetime]:
    """
    Return (current_start, current_end, prev_start, prev_end) in UTC
    based on the frequency.
    """
    now = datetime.now(timezone.utc)

    if frequency == "daily":
        current_end = now
        current_start = now - timedelta(days=1)
        prev_end = current_start
        prev_start = prev_end - timedelta(days=1)
    elif frequency == "weekly":
        current_end = now
        current_start = now - timedelta(weeks=1)
        prev_end = current_start
        prev_start = prev_end - timedelta(weeks=1)
    elif frequency == "monthly":
        current_end = now
        current_start = now - timedelta(days=30)
        prev_end = current_start
        prev_start = prev_end - timedelta(days=30)
    else:
        raise ValueError(f"Unknown frequency: {frequency}")

    return current_start, current_end, prev_start, prev_end


def format_date_range(start: datetime, end: datetime) -> str:
    """Format a date range in Hebrew-friendly format."""
    months_he = {
        1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
        5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
        9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר",
    }
    s_month = months_he[start.month]
    e_month = months_he[end.month]

    if start.month == end.month and start.year == end.year:
        return f"{start.day}–{end.day} {e_month} {end.year}"
    elif start.year == end.year:
        return f"{start.day} {s_month} — {end.day} {e_month} {end.year}"
    else:
        return f"{start.day} {s_month} {start.year} — {end.day} {e_month} {end.year}"


# ---------------------------------------------------------------------------
# Supabase queries
# ---------------------------------------------------------------------------
def fetch_enabled_businesses(supabase: Client, frequency: str) -> list[dict]:
    """Fetch businesses with summary_settings.enabled=true and matching frequency."""
    resp = (
        supabase.table("summary_settings")
        .select("business_id, email, frequency")
        .eq("enabled", True)
        .eq("frequency", frequency)
        .execute()
    )
    if not resp.data:
        return []

    business_ids = [row["business_id"] for row in resp.data]
    email_map = {row["business_id"]: row["email"] for row in resp.data}

    # Fetch business details
    biz_resp = (
        supabase.table("businesses")
        .select("id, name, logo_url")
        .in_("id", business_ids)
        .execute()
    )

    results = []
    for biz in biz_resp.data or []:
        biz["summary_email"] = email_map.get(biz["id"], "")
        results.append(biz)
    return results


def count_conversations(supabase: Client, business_id: str, start: datetime, end: datetime) -> int:
    resp = (
        supabase.table("conversations")
        .select("id", count="exact")
        .eq("business_id", business_id)
        .gte("started_at", start.isoformat())
        .lt("started_at", end.isoformat())
        .execute()
    )
    return resp.count or 0


def count_messages(supabase: Client, business_id: str, start: datetime, end: datetime) -> int:
    """Count messages for a business in a time range (via conversation join)."""
    # Get conversation IDs first
    conv_resp = (
        supabase.table("conversations")
        .select("id")
        .eq("business_id", business_id)
        .gte("started_at", start.isoformat())
        .lt("started_at", end.isoformat())
        .execute()
    )
    conv_ids = [c["id"] for c in (conv_resp.data or [])]
    if not conv_ids:
        return 0

    msg_resp = (
        supabase.table("messages")
        .select("id", count="exact")
        .in_("conversation_id", conv_ids)
        .execute()
    )
    return msg_resp.count or 0


def count_escalations(supabase: Client, business_id: str, start: datetime, end: datetime) -> int:
    """Count escalations for a business in a time range."""
    conv_resp = (
        supabase.table("conversations")
        .select("id")
        .eq("business_id", business_id)
        .gte("started_at", start.isoformat())
        .lt("started_at", end.isoformat())
        .execute()
    )
    conv_ids = [c["id"] for c in (conv_resp.data or [])]
    if not conv_ids:
        return 0

    esc_resp = (
        supabase.table("escalations")
        .select("id", count="exact")
        .in_("conversation_id", conv_ids)
        .execute()
    )
    return esc_resp.count or 0


def avg_satisfaction(supabase: Client, business_id: str, start: datetime, end: datetime) -> float:
    """Calculate average satisfaction rating for conversations in a period."""
    resp = (
        supabase.table("conversations")
        .select("satisfaction_rating")
        .eq("business_id", business_id)
        .gte("started_at", start.isoformat())
        .lt("started_at", end.isoformat())
        .not_.is_("satisfaction_rating", "null")
        .execute()
    )
    ratings = [r["satisfaction_rating"] for r in (resp.data or []) if r.get("satisfaction_rating")]
    if not ratings:
        return 0.0
    return round(sum(ratings) / len(ratings), 1)


def top_questions(supabase: Client, business_id: str, start: datetime, end: datetime, limit: int = 5) -> list[dict]:
    """
    Get top N most asked questions from the unanswered_questions table
    within the period, falling back to intent grouping from messages.
    """
    # First try unanswered_questions (which tracks times_asked)
    resp = (
        supabase.table("unanswered_questions")
        .select("question, times_asked")
        .eq("business_id", business_id)
        .gte("created_at", start.isoformat())
        .lt("created_at", end.isoformat())
        .order("times_asked", desc=True)
        .limit(limit)
        .execute()
    )

    results = []
    for row in resp.data or []:
        results.append({"question": row["question"], "count": row["times_asked"]})

    # If we have fewer than limit, supplement with customer message intents
    if len(results) < limit:
        conv_resp = (
            supabase.table("conversations")
            .select("id")
            .eq("business_id", business_id)
            .gte("started_at", start.isoformat())
            .lt("started_at", end.isoformat())
            .execute()
        )
        conv_ids = [c["id"] for c in (conv_resp.data or [])]
        if conv_ids:
            msg_resp = (
                supabase.table("messages")
                .select("intent, content")
                .in_("conversation_id", conv_ids)
                .eq("role", "customer")
                .not_.is_("intent", "null")
                .limit(200)
                .execute()
            )
            # Group by intent
            intent_counts: dict[str, int] = {}
            intent_example: dict[str, str] = {}
            for msg in msg_resp.data or []:
                intent = msg.get("intent", "")
                if not intent:
                    continue
                intent_counts[intent] = intent_counts.get(intent, 0) + 1
                if intent not in intent_example:
                    intent_example[intent] = msg.get("content", intent)

            existing_questions = {r["question"] for r in results}
            sorted_intents = sorted(intent_counts.items(), key=lambda x: x[1], reverse=True)
            for intent, count in sorted_intents:
                example = intent_example.get(intent, intent)
                if example not in existing_questions and len(results) < limit:
                    results.append({"question": example, "count": count})

    return results[:limit]


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------
def aggregate_stats(supabase: Client, business_id: str, frequency: str) -> dict:
    """Aggregate all stats for a business for the current and previous period."""
    cur_start, cur_end, prev_start, prev_end = get_period_range(frequency)

    cur_convs = count_conversations(supabase, business_id, cur_start, cur_end)
    cur_msgs = count_messages(supabase, business_id, cur_start, cur_end)
    cur_escs = count_escalations(supabase, business_id, cur_start, cur_end)
    cur_sat = avg_satisfaction(supabase, business_id, cur_start, cur_end)
    cur_questions = top_questions(supabase, business_id, cur_start, cur_end)

    prev_convs = count_conversations(supabase, business_id, prev_start, prev_end)
    prev_msgs = count_messages(supabase, business_id, prev_start, prev_end)
    prev_escs = count_escalations(supabase, business_id, prev_start, prev_end)
    prev_sat = avg_satisfaction(supabase, business_id, prev_start, prev_end)

    return {
        "conversations": cur_convs,
        "messages": cur_msgs,
        "escalations": cur_escs,
        "satisfaction_avg": str(cur_sat) if cur_sat > 0 else "—",
        "top_questions": cur_questions,
        "prev_conversations": prev_convs,
        "prev_messages": prev_msgs,
        "prev_escalations": prev_escs,
        "prev_satisfaction": prev_sat,
        "date_range": format_date_range(cur_start, cur_end),
    }


# ---------------------------------------------------------------------------
# Email sending
# ---------------------------------------------------------------------------
def send_email_resend(to: str, subject: str, html: str) -> bool:
    """Send an email via Resend API. Returns True on success."""
    if not RESEND_API_KEY:
        log.warning("No RESEND_API_KEY — skipping send, logging HTML to file")
        return False

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": "BotPress AI <summaries@botpress-ai.com>",
            "to": [to],
            "subject": subject,
            "html": html,
        },
        timeout=30,
    )

    if resp.status_code in (200, 201):
        data = resp.json()
        log.info(f"Email sent to {to} — id: {data.get('id', 'unknown')}")
        return True
    else:
        log.error(f"Resend API error {resp.status_code}: {resp.text}")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="BotPress AI Summary Email Cron")
    parser.add_argument("--frequency", choices=["daily", "weekly", "monthly"], default=None)
    parser.add_argument("--dry-run", action="store_true", default=False)
    args = parser.parse_args()

    frequency = args.frequency or os.environ.get("FREQUENCY", "weekly")
    dry_run = args.dry_run or os.environ.get("DRY_RUN", "").lower() == "true"

    if frequency not in FREQUENCY_LABELS:
        log.error(f"Invalid frequency: {frequency}")
        sys.exit(1)

    period_label = FREQUENCY_LABELS[frequency]
    log.info(f"Starting summary cron — frequency={frequency}, dry_run={dry_run}")

    if not SUPABASE_URL or not SUPABASE_KEY:
        log.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch businesses
    businesses = fetch_enabled_businesses(supabase, frequency)
    log.info(f"Found {len(businesses)} businesses with {frequency} summaries enabled")

    if not businesses:
        log.info("No businesses to process. Exiting.")
        return

    sent = 0
    failed = 0

    for biz in businesses:
        biz_id = biz["id"]
        biz_name = biz["name"]
        to_email = biz["summary_email"]

        log.info(f"Processing: {biz_name} ({biz_id}) -> {to_email}")

        try:
            stats = aggregate_stats(supabase, biz_id, frequency)

            html = build_summary_html(
                business_name=biz_name,
                logo_url=biz.get("logo_url"),
                period_label=period_label,
                date_range=stats["date_range"],
                conversations=stats["conversations"],
                messages=stats["messages"],
                escalations=stats["escalations"],
                satisfaction_avg=stats["satisfaction_avg"],
                top_questions=stats["top_questions"],
                prev_conversations=stats["prev_conversations"],
                prev_messages=stats["prev_messages"],
                prev_escalations=stats["prev_escalations"],
                prev_satisfaction=stats["prev_satisfaction"],
                dashboard_url=f"{DASHBOARD_URL}/dashboard",
            )

            if dry_run:
                log.info(f"[DRY RUN] Would send to {to_email}")
                # Write HTML to file for inspection
                filename = f"preview_{biz_id[:8]}.html"
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(html)
                log.info(f"  -> Saved preview to {filename}")
                print(f"\n{'='*60}")
                print(f"PREVIEW: {biz_name} -> {to_email}")
                print(f"{'='*60}")
                print(html[:500] + "...\n")
                sent += 1
            else:
                subject = f"סיכום {period_label} — {biz_name}"
                success = send_email_resend(to_email, subject, html)
                if success:
                    sent += 1
                else:
                    # Fallback: save HTML to file
                    filename = f"fallback_{biz_id[:8]}.html"
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(html)
                    log.warning(f"  -> Saved fallback HTML to {filename}")
                    failed += 1

        except Exception as e:
            log.error(f"Error processing {biz_name}: {e}", exc_info=True)
            failed += 1
            continue

    total = len(businesses)
    log.info(f"Done. Processed {total} businesses, sent {sent} emails, {failed} failures.")


if __name__ == "__main__":
    main()
