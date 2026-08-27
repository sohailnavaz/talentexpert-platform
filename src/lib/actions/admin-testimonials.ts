"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  studentName: z.string().trim().min(2, "Enter the student's name"),
  courseName: z.string().trim().optional(),
  quote: z.string().trim().min(10, "Quote should be at least 10 characters").max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  photoUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

function parseTestimonialForm(formData: FormData) {
  return schema.safeParse({
    studentName: formData.get("studentName"),
    courseName: formData.get("courseName") || undefined,
    quote: formData.get("quote"),
    rating: formData.get("rating"),
    photoUrl: formData.get("photoUrl") || undefined,
    active: formData.get("active") === "on",
  });
}

function revalidateTestimonialPaths() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/placements");
}

export async function createTestimonial(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const testimonial = await db.testimonial.create({
    data: {
      studentName: parsed.data.studentName,
      courseName: parsed.data.courseName || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      photoUrl: parsed.data.photoUrl || null,
      active: parsed.data.active,
    },
  });
  await logActivity(session.adminId, "testimonial.create", "Testimonial", testimonial.id, {
    studentName: testimonial.studentName,
  });

  revalidateTestimonialPaths();
  return { ok: true, message: "Testimonial added." };
}

export async function updateTestimonial(
  testimonialId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  await db.testimonial.update({
    where: { id: testimonialId },
    data: {
      studentName: parsed.data.studentName,
      courseName: parsed.data.courseName || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      photoUrl: parsed.data.photoUrl || null,
      active: parsed.data.active,
    },
  });
  await logActivity(session.adminId, "testimonial.update", "Testimonial", testimonialId);

  revalidateTestimonialPaths();
  return { ok: true, message: "Testimonial updated." };
}

export async function toggleTestimonialActive(testimonialId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const testimonial = await db.testimonial.findUnique({ where: { id: testimonialId } });
  if (!testimonial) return;

  await db.testimonial.update({ where: { id: testimonialId }, data: { active: !testimonial.active } });
  revalidateTestimonialPaths();
}

export async function deleteTestimonial(testimonialId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  await db.testimonial.delete({ where: { id: testimonialId } });
  await logActivity(session.adminId, "testimonial.delete", "Testimonial", testimonialId);

  revalidateTestimonialPaths();
}
