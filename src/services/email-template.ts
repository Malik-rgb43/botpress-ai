export type TemplateName = 'modern' | 'classic' | 'minimal'

export interface EmailTemplateOptions {
  template?: TemplateName
  businessName: string
  logoUrl?: string | null
  primaryColor?: string
  replyContent: string
  footerText?: string
  showPoweredBy?: boolean
}

// ── Template 1: Modern (gradient header, rounded, shadows) ──
function modernTemplate(opts: EmailTemplateOptions): string {
  const { businessName, logoUrl, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const gradientEnd = adjustColor(primaryColor, -30)
  const htmlContent = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,${primaryColor},${gradientEnd});padding:32px;text-align:center;">
    ${logoUrl ? `<img src="${logoUrl}" alt="${businessName}" width="52" height="52" style="border-radius:14px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;border:3px solid rgba(255,255,255,0.3);">` : `<div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);margin:0 auto 14px;line-height:52px;font-size:24px;text-align:center;">💬</div>`}
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">${businessName}</h1>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <p style="color:#1e293b;font-size:15px;line-height:1.8;margin:0;">${htmlContent}</p>
  </td></tr>
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"></td></tr>
  <tr><td style="padding:20px 32px 28px;text-align:center;">
    ${footerText ? `<p style="color:#64748b;font-size:12px;line-height:1.5;margin:0 0 8px;">${footerText}</p>` : ''}
    <p style="color:#94a3b8;font-size:11px;margin:0;">הודעה אוטומטית מ-${businessName}</p>
  </td></tr>
</table>
${showPoweredBy ? `<p style="color:#cbd5e1;font-size:10px;margin:16px 0 0;text-align:center;">Powered by BotPress AI</p>` : ''}
</td></tr></table></body></html>`
}

// ── Template 2: Classic (clean, professional, side accent) ──
function classicTemplate(opts: EmailTemplateOptions): string {
  const { businessName, logoUrl, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const htmlContent = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <tr><td style="padding:24px 28px;border-bottom:1px solid #e2e8f0;">
    <table width="100%" cellspacing="0" cellpadding="0"><tr>
      <td style="text-align:right;">
        <h2 style="color:#1e293b;font-size:18px;font-weight:700;margin:0;">${businessName}</h2>
      </td>
      ${logoUrl ? `<td style="text-align:left;width:44px;"><img src="${logoUrl}" alt="" width="40" height="40" style="border-radius:10px;"></td>` : ''}
    </tr></table>
  </td></tr>
  <tr><td>
    <table width="100%" cellspacing="0" cellpadding="0"><tr>
      <td style="width:4px;background-color:${primaryColor};"></td>
      <td style="padding:24px 28px;">
        <p style="color:#334155;font-size:15px;line-height:1.8;margin:0;">${htmlContent}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 28px 20px;background-color:#f8fafc;text-align:center;">
    ${footerText ? `<p style="color:#64748b;font-size:12px;margin:0 0 4px;">${footerText}</p>` : ''}
    <p style="color:#94a3b8;font-size:11px;margin:0;">הודעה אוטומטית מ-${businessName}</p>
  </td></tr>
</table>
${showPoweredBy ? `<p style="color:#cbd5e1;font-size:10px;margin:16px 0 0;text-align:center;">Powered by BotPress AI</p>` : ''}
</td></tr></table></body></html>`
}

// ── Template 3: Minimal (clean, almost no design) ──
function minimalTemplate(opts: EmailTemplateOptions): string {
  const { businessName, primaryColor = '#2563eb', replyContent, footerText, showPoweredBy = true } = opts
  const htmlContent = escapeHtml(replyContent)

  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
  <tr><td style="padding:0 0 20px;">
    <p style="color:${primaryColor};font-size:14px;font-weight:700;margin:0;">${businessName}</p>
  </td></tr>
  <tr><td>
    <p style="color:#334155;font-size:15px;line-height:1.8;margin:0;">${htmlContent}</p>
  </td></tr>
  <tr><td style="padding:24px 0 0;">
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;">
    ${footerText ? `<p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">${footerText}</p>` : ''}
    <p style="color:#cbd5e1;font-size:11px;margin:0;">
      ${showPoweredBy ? 'Powered by BotPress AI · ' : ''}הודעה אוטומטית
    </p>
  </td></tr>
</table>
</td></tr></table></body></html>`
}

// ── Main export ──
export function buildEmailHtml(options: EmailTemplateOptions): string {
  switch (options.template || 'modern') {
    case 'classic': return classicTemplate(options)
    case 'minimal': return minimalTemplate(options)
    default: return modernTemplate(options)
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
