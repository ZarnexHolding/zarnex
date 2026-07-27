"use server";

import { CONTACT } from "@/lib/site";

export type ContactState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const MAX = { name: 120, email: 160, company: 160, message: 4000 };

/** Deliberately permissive — the point is to catch typos, not police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: FormDataEntryValue | null, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Contact submission.
 *
 * Sent through Resend over plain fetch — no SDK, so nothing lands in the
 * client bundle. Without `RESEND_API_KEY` the action refuses honestly and
 * points the visitor at the real inbox rather than pretending to have sent.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a field no human sees. Silent success starves the bot of signal.
  if (clean(formData.get("website"), 200)) {
    return { ok: true, message: "Thank you — we will be in touch." };
  }

  const name = clean(formData.get("name"), MAX.name);
  const email = clean(formData.get("email"), MAX.email);
  const company = clean(formData.get("company"), MAX.company);
  const message = clean(formData.get("message"), MAX.message);

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Please enter a valid email address.";
  if (message.length < 10) fieldErrors.message = "Please tell us a little more.";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  /**
   * Where enquiries land. Defaults to the published address, but that inbox may
   * not exist yet — CONTACT_TO lets it point somewhere real without a code
   * change, and can hold several addresses separated by commas.
   */
  const to = (process.env.CONTACT_TO ?? CONTACT.email)
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!key || !from) {
    return {
      ok: false,
      message: `Our contact form is not connected yet. Please email ${CONTACT.email} directly and we will reply.`,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Website enquiry — ${name}${company ? ` (${company})` : ""}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          company ? `Company: ${company}` : null,
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  } catch (err) {
    console.error("[contact] send failed", err);
    return {
      ok: false,
      message: `We could not send that. Please email ${CONTACT.email} directly.`,
    };
  }

  return { ok: true, message: "Thank you — we will be in touch." };
}
