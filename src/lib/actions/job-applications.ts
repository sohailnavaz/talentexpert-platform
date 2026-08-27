"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth/session";

const applicationSchema = z.object({
  jobOpeningId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
});

export type JobApplicationFormState = { ok: boolean; message?: string };

export async function submitJobApplication(
  _prev: JobApplicationFormState,
  formData: FormData
): Promise<JobApplicationFormState> {
  const parsed = applicationSchema.safeParse({
    jobOpeningId: formData.get("jobOpeningId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const session = await getStudentSession();

  await db.jobApplication.create({
    data: {
      jobOpeningId: parsed.data.jobOpeningId,
      studentId: session?.studentId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    },
  });

  return { ok: true, message: "Application submitted! We'll be in touch if there's a match." };
}
