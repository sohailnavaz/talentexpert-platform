"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSiteContactInfo } from "@/lib/site-settings";
import { appendRowToSheet } from "@/lib/google-sheets";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  courseInterest: z.string().trim().optional(),
  message: z.string().trim().max(1000).optional(),
  sourcePage: z.string().trim().optional(),
});

export type LeadFormState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof leadSchema>, string[]>>;
};

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    courseInterest: formData.get("courseInterest") || undefined,
    message: formData.get("message") || undefined,
    sourcePage: formData.get("sourcePage") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, courseInterest, message, sourcePage } = parsed.data;

  await db.lead.create({
    data: {
      name,
      email,
      phone,
      courseInterest,
      message,
      sourcePage,
    },
  });

  const contact = await getSiteContactInfo();
  await sendEmail({
    to: contact.email,
    subject: `New enquiry: ${name}`,
    html: `
      <p>New enquiry from the website:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Email:</strong> ${email}</li>
        ${courseInterest ? `<li><strong>Interested in:</strong> ${courseInterest}</li>` : ""}
        ${sourcePage ? `<li><strong>Source page:</strong> ${sourcePage}</li>` : ""}
      </ul>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
    `,
  });
  await appendRowToSheet(process.env.GOOGLE_SHEETS_LEADS_TAB || "Sheet1", [
    new Date().toISOString(),
    name,
    email,
    phone,
    courseInterest ?? "",
    message ?? "",
    sourcePage ?? "",
  ]);

  return { ok: true, message: "Thanks! Our team will reach out to you shortly." };
}
