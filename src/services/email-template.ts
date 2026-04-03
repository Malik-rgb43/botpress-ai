// Professional HTML email template for business replies

export interface EmailTemplateOptions {
  businessName: string
  logoUrl?: string | null
  primaryColor?: string
  replyContent: string
  footerText?: string
}

export function buildEmailHtml(options: EmailTemplateOptions): string {
  const {
    businessName,
    logoUrl,
    primaryColor = '#2563eb',
    replyContent,
    footerText,
  } = options

  // Convert newlines to <br> for HTML
  const htmlContent = replyContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  // Generate a gradient from the primary color
  const gradientEnd = adjustColor(primaryColor, -30)

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg, ${primaryColor}, ${gradientEnd});padding:28px 32px;text-align:center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${businessName}" width="48" height="48" style="border-radius:12px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;">` : ''}
              <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;letter-spacing:-0.3px;">${businessName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px 32px;">
              <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0;white-space:pre-line;">${htmlContent}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;text-align:center;">
              ${footerText ? `<p style="color:#64748b;font-size:12px;line-height:1.5;margin:0 0 8px 0;">${footerText}</p>` : ''}
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                הודעה זו נשלחה אוטומטית על ידי הבוט של ${businessName}
              </p>
            </td>
          </tr>

        </table>

        <!-- Branding -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;">
          <tr>
            <td style="padding:16px 0;text-align:center;">
              <p style="color:#cbd5e1;font-size:10px;margin:0;">
                Powered by BotPress AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}
