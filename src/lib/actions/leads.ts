"use server";

import { z } from "zod";
import { db } from "@/lib/db";

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

  return { ok: true, message: "Thanks! Our team will reach out to you shortly." };
}
