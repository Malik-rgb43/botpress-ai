export type TemplateName = 'modern' | 'classic' | 'minimal' | 'none'

export interface EmailTemplateOptions {
  template?: TemplateName
  businessName: string
  logoUrl?: string | null
  primaryColor?: string
  replyContent: string
  footerText?: string
  showPoweredBy?: boolean
}

// ── Template 1: Modern — gradient header, rounded corners, premium feel ──
function modernTemplate(opts: EmailTemplateOptions): string {
  const { businessName, logoUrl, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const gradientEnd = adjustColor(primaryColor, -30)
  const content = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;">
<tr><td align="center" style="padding:40px 16px;">

  <!-- Card -->
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,${primaryColor},${gradientEnd});padding:24px 24px 20px;text-align:center;border-radius:0 0 12px 12px;">
      ${logoUrl
        ? `<img src="${logoUrl}" alt="${businessName}" width="44" height="44" style="border-radius:11px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;border:2px solid rgba(255,255,255,0.25);">`
        : `<div style="width:44px;height:44px;border-radius:11px;background:rgba(255,255,255,0.15);margin:0 auto 14px;line-height:44px;font-size:20px;text-align:center;color:white;">✦</div>`
      }
      <h1 style="color:#ffffff;font-size:19px;font-weight:700;margin:0;letter-spacing:-0.3px;">${businessName}</h1>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:32px;">
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0;white-space:pre-line;">${content}</p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:0 32px 28px;">
      <hr style="border:none;border-top:1px solid #e8ecf1;margin:0 0 20px;">
      ${footerText ? `<p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 6px;text-align:center;">${footerText}</p>` : ''}
      <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">${businessName}</p>
    </td></tr>

  </table>

  ${showPoweredBy ? `<p style="color:#9ca3af;font-size:11px;margin:20px 0 0;text-align:center;letter-spacing:0.3px;">&#9670; Powered by <strong style="font-weight:600;">BotPress AI</strong></p>` : ''}

</td></tr></table></body></html>`
}

// ── Template 2: Classic — clean side accent, professional look ──
function classicTemplate(opts: EmailTemplateOptions): string {
  const { businessName, logoUrl, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const content = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
<tr><td align="center" style="padding:40px 16px;">

  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

    <!-- Header -->
    <tr><td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellspacing="0" cellpadding="0"><tr>
        ${logoUrl ? `<td style="width:44px;padding-left:12px;"><img src="${logoUrl}" alt="" width="40" height="40" style="border-radius:10px;display:block;"></td>` : ''}
        <td><h2 style="color:#1e293b;font-size:17px;font-weight:700;margin:0;">${businessName}</h2></td>
      </tr></table>
    </td></tr>

    <!-- Body with side accent -->
    <tr><td style="padding:0;">
      <table width="100%" cellspacing="0" cellpadding="0"><tr>
        <td style="width:4px;background-color:${primaryColor};border-radius:2px;"></td>
        <td style="padding:28px;">
          <p style="color:#334155;font-size:15px;line-height:1.75;margin:0;white-space:pre-line;">${content}</p>
        </td>
      </tr></table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:20px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;">
      ${footerText ? `<p style="color:#64748b;font-size:12px;margin:0 0 6px;text-align:center;">${footerText}</p>` : ''}
      <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">${businessName}</p>
    </td></tr>

  </table>

  ${showPoweredBy ? `<p style="color:#9ca3af;font-size:11px;margin:20px 0 0;text-align:center;">&#9670; Powered by <strong style="font-weight:600;">BotPress AI</strong></p>` : ''}

</td></tr></table></body></html>`
}

// ── Template 3: Minimal — text only, clean and simple ──
function minimalTemplate(opts: EmailTemplateOptions): string {
  const { businessName, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const content = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:40px 20px;">

  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">

    <!-- Name -->
    <tr><td style="padding-bottom:24px;">
      <p style="color:${primaryColor};font-size:14px;font-weight:700;margin:0;letter-spacing:-0.2px;">${businessName}</p>
    </td></tr>

    <!-- Body -->
    <tr><td>
      <p style="color:#334155;font-size:15px;line-height:1.75;margin:0;white-space:pre-line;">${content}</p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding-top:28px;">
      <hr style="border:none;border-top:1px solid #e8ecf1;margin:0 0 16px;">
      ${footerText ? `<p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">${footerText}</p>` : ''}
      <p style="color:#9ca3af;font-size:11px;margin:0;">${showPoweredBy ? '&#9670; Powered by <strong style="font-weight:600;">BotPress AI</strong> · ' : ''}${businessName}</p>
    </td></tr>

  </table>

</td></tr></table></body></html>`
}

// ── Template 4: None — plain text, no HTML at all ──
function noTemplate(opts: EmailTemplateOptions): string {
  // Return empty string — the caller will send plain text only
  return ''
}

// ── Main export ──
export function buildEmailHtml(options: EmailTemplateOptions): string {
  switch (options.template || 'modern') {
    case 'classic': return classicTemplate(options)
    case 'minimal': return minimalTemplate(options)
    case 'none': return noTemplate(options)
    default: return modernTemplate(options)
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}

function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}
