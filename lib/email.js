// Transactional email via Resend.
//
// Every function here degrades gracefully: with no RESEND_API_KEY set, the
// caller still succeeds and just learns that nothing was sent. A missing key
// should never break a check-in.

import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "FanFest <onboarding@resend.dev>";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Returns { sent: boolean, id?: string, error?: string } — never throws. */
export async function sendEmail({ to, subject, html }) {
  if (!emailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return { sent: false, error: "not_configured" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error.message);
      return { sent: false, error: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (e) {
    console.error("[email] send threw:", e.message);
    return { sent: false, error: e.message };
  }
}

const BRAND = "#6f597d";

/** The "You're all checked in" auto-reply for a listening party. */
export function checkInEmail({ displayName, eventName, eventDetail, xp }) {
  const name = displayName || "there";

  return {
    subject: "You're all checked in ✓",
    html: `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;">

          <tr><td style="background:${BRAND};padding:28px 32px;">
            <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">EJAE &middot; FANFEST</div>
          </td></tr>

          <tr><td style="padding:32px;">
            <div style="display:inline-block;background:#f0f0f0;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border-radius:999px;">
              Checked in
            </div>

            <h1 style="margin:20px 0 8px;font-size:26px;line-height:1.25;color:#000;font-weight:700;">
              You're all checked in, ${escapeHtml(name)}!
            </h1>

            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#444;">
              Your spot at <strong>${escapeHtml(eventName)}</strong> is locked in. We'll send the link right before we go live &mdash; just show up and bring your questions.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;border-radius:16px;">
              <tr><td style="padding:20px 24px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#777;">The details</div>
                <div style="margin-top:6px;font-size:16px;color:#000;font-weight:600;">${escapeHtml(eventDetail)}</div>
              </td></tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:${BRAND};border-radius:16px;">
              <tr><td style="padding:20px 24px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.75);">Your balance</div>
                <div style="margin-top:6px;font-size:26px;color:#ffffff;font-weight:700;">${Number(xp).toLocaleString()} XP</div>
                <div style="margin-top:4px;font-size:14px;color:rgba(255,255,255,0.85);">+500 XP for checking in</div>
              </td></tr>
            </table>

            <div style="margin-top:28px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://fanfest-web.vercel.app"}"
                 style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;">
                Back to FanFest
              </a>
            </div>
          </td></tr>

          <tr><td style="padding:20px 32px 28px;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#999;">
              You're getting this because you checked in on FanFest. See you at the party.
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
</html>`.trim(),
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
