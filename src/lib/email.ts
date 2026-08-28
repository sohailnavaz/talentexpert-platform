import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Talent Expert <no-reply@talentexpertedu.com>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const iconUrl = `${siteUrl}/brand/icon-mark-512.png`;
const navy = "#04122f";

function layout(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <img src="${iconUrl}" alt="" width="32" height="32" style="display:block;border-radius:7px;">
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:16px;font-weight:700;color:${navy};">Talent Expert</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#18181b;font-size:15px;line-height:1.65;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f0f0f0;color:#9a9aa2;font-size:12px;line-height:1.5;">
                <p style="margin:0;">Talent Expert</p>
                <p style="margin:4px 0 0;">This is an automated message — please don't reply directly to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailButton(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background-color:${navy};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:6px;">${label}</a>`;
}

export function emailCode(code: string) {
  return `<div style="background-color:#f4f4f5;border-radius:8px;padding:16px;text-align:center;font-size:28px;font-weight:700;letter-spacing:0.3em;color:${navy};">${code}</div>`;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const body = layout(html);
  if (!resend) {
    console.log(`[email:dev-mode] to=${to} subject="${subject}"\n${html}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html: body });
  if (error) {
    console.error(`[email:failed] to=${to} subject="${subject}" — ${error.name}: ${error.message}`);
  }
}
