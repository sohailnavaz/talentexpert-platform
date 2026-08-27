import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Talent Expert <no-reply@talentexpertedu.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[email:dev-mode] to=${to} subject="${subject}"\n${html}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error(`[email:failed] to=${to} subject="${subject}" — ${error.name}: ${error.message}`);
  }
}
