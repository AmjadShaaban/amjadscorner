import "server-only";
import { env } from "@/lib/env";

export type Email = {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string; contentType: string }[];
};

// Sends through Resend's REST API when RESEND_API_KEY is set; otherwise logs, so local
// dev and previews work without an email account. Never throws: a failed email must not
// fail the booking that triggered it.
export async function sendEmail(email: Email): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.info(`[email:dev] to=${email.to} subject="${email.subject}"\n${email.text}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: email.to,
        subject: email.subject,
        text: email.text,
        attachments: email.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content).toString("base64"),
          content_type: a.contentType,
        })),
      }),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status}: ${await res.text()}`);
  } catch (error) {
    console.error("[email] send failed", error);
  }
}
