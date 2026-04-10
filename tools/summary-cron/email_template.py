"""
HTML email template generator for BotPress AI summary reports.
Matches the existing TypeScript template design — RTL Hebrew, blue/purple brand.
"""

from typing import Optional


def bar_width(value: int, max_val: int) -> int:
    if max_val == 0:
        return 0
    return round((value / max_val) * 100)


def change_arrow(current: float, previous: float) -> str:
    """Return an HTML arrow indicator showing % change vs previous period."""
    if previous == 0:
        if current > 0:
            return '<span style="color:#10b981;font-size:12px;font-weight:700;">&#9650; חדש</span>'
        return '<span style="color:#94a3b8;font-size:12px;">—</span>'

    pct = round(((current - previous) / previous) * 100)
    if pct > 0:
        return f'<span style="color:#10b981;font-size:12px;font-weight:700;">&#9650; {pct}%</span>'
    elif pct < 0:
        return f'<span style="color:#ef4444;font-size:12px;font-weight:700;">&#9660; {abs(pct)}%</span>'
    else:
        return '<span style="color:#94a3b8;font-size:12px;">— ללא שינוי</span>'


def build_summary_html(
    business_name: str,
    logo_url: Optional[str],
    period_label: str,
    date_range: str,
    conversations: int,
    messages: int,
    escalations: int,
    satisfaction_avg: str,
    top_questions: list[dict],
    prev_conversations: int = 0,
    prev_messages: int = 0,
    prev_escalations: int = 0,
    prev_satisfaction: float = 0.0,
    dashboard_url: str = "https://botpress-ai.vercel.app",
    primary_color: str = "#3b82f6",
) -> str:
    """
    Generate a complete HTML email for a summary report.

    Args:
        business_name: Name of the business
        logo_url: URL to business logo (optional)
        period_label: 'יומי' / 'שבועי' / 'חודשי'
        date_range: Human-readable date range string
        conversations: Total conversations this period
        messages: Total messages this period
        escalations: Total escalations this period
        satisfaction_avg: Formatted satisfaction score (e.g. "4.2")
        top_questions: List of dicts with 'question' and 'count' keys
        prev_conversations: Conversations in previous period (for comparison)
        prev_messages: Messages in previous period
        prev_escalations: Escalations in previous period
        prev_satisfaction: Satisfaction avg in previous period
        dashboard_url: Link for the CTA button
        primary_color: Brand color hex
    """
    color = primary_color
    max_question = top_questions[0]["count"] if top_questions else 1

    # Build logo HTML
    logo_html = ""
    if logo_url:
        logo_html = (
            f'<img src="{logo_url}" width="48" height="48" '
            f'style="border-radius:12px;margin-bottom:12px;border:2px solid rgba(255,255,255,0.25);" alt="">'
        )

    # Build top questions rows
    questions_html = ""
    for i, q in enumerate(top_questions[:5]):
        opacity = round(1 - i * 0.15, 2)
        bg_color = color if i == 0 else "#f1f5f9"
        text_color = "#fff" if i == 0 else "#64748b"
        width = bar_width(q["count"], max_question)
        questions_html += f"""
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
  <tr>
    <td width="28" style="vertical-align:top;">
      <div style="width:24px;height:24px;border-radius:6px;background:{bg_color};color:{text_color};font-size:12px;font-weight:700;text-align:center;line-height:24px;">
        {i + 1}
      </div>
    </td>
    <td style="padding:0 12px;vertical-align:middle;">
      <p style="margin:0;font-size:14px;color:#1e293b;">{q['question']}</p>
      <div style="background:#e2e8f0;border-radius:4px;height:6px;margin-top:6px;overflow:hidden;">
        <div style="background:{color};opacity:{opacity};height:6px;border-radius:4px;width:{width}%;"></div>
      </div>
    </td>
    <td width="50" style="font-size:13px;font-weight:600;color:#64748b;text-align:left;vertical-align:middle;">
      {q['count']}x
    </td>
  </tr>
  </table>"""

    # No questions fallback
    if not top_questions:
        questions_html = '<p style="margin:0;font-size:14px;color:#94a3b8;">אין שאלות נפוצות בתקופה זו</p>'

    # Parse satisfaction for comparison
    try:
        sat_float = float(satisfaction_avg)
    except (ValueError, TypeError):
        sat_float = 0.0

    conv_arrow = change_arrow(conversations, prev_conversations)
    msg_arrow = change_arrow(messages, prev_messages)
    esc_arrow = change_arrow(escalations, prev_escalations)
    sat_arrow = change_arrow(sat_float, prev_satisfaction)

    return f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>סיכום {period_label} — {business_name}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:rtl;">

<!-- Wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">

<!-- Main Card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,{color},#6366f1);padding:32px 40px;text-align:center;">
  {logo_html}
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">{business_name}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">סיכום {period_label} · {date_range}</p>
</td>
</tr>

<!-- KPI Grid -->
<tr>
<td style="padding:32px 32px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <!-- Conversations -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#eff6ff;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">{conversations}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">שיחות</p>
        <p style="margin:4px 0 0;">{conv_arrow}</p>
      </div>
    </td>
    <!-- Messages -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#f0fdf4;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">{messages}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">הודעות</p>
        <p style="margin:4px 0 0;">{msg_arrow}</p>
      </div>
    </td>
    <!-- Escalations -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#fef3c7;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">{escalations}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">העברות לנציג</p>
        <p style="margin:4px 0 0;">{esc_arrow}</p>
      </div>
    </td>
    <!-- Satisfaction -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#faf5ff;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">{satisfaction_avg}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">שביעות רצון</p>
        <p style="margin:4px 0 0;">{sat_arrow}</p>
      </div>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Top Questions -->
<tr>
<td style="padding:28px 32px;">
  <h2 style="margin:0 0 20px;font-size:16px;font-weight:700;color:#1e293b;">שאלות נפוצות</h2>
  {questions_html}
</td>
</tr>

<!-- CTA Button -->
<tr>
<td style="padding:0 32px 32px;text-align:center;">
  <a href="{dashboard_url}" style="display:inline-block;background:linear-gradient(135deg,{color},#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.3px;">
    צפה בדשבורד המלא
  </a>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="margin:0;font-size:12px;color:#94a3b8;">סיכום אוטומטי מ-BotPress AI · {business_name}</p>
  <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">לביטול קבלת סיכומים, עדכן את ההגדרות בדשבורד</p>
</td>
</tr>

</table>
<!-- End Main Card -->

</td></tr>
</table>
<!-- End Wrapper -->

</body>
</html>"""
