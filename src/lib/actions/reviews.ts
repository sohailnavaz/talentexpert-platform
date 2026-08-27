"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth/session";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";

const reviewSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  authorName: z.string().trim().min(2, "Please enter your name"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(1000),
});

export type ReviewFormState = { ok: boolean; message?: string };

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse({
    courseId: formData.get("courseId"),
    courseSlug: formData.get("courseSlug"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your review." };
  }

  const session = await getStudentSession();

  await db.review.create({
    data: {
      courseId: parsed.data.courseId,
      studentId: session?.studentId,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath(`/courses/${parsed.data.courseSlug}`);
  return { ok: true, message: "Thanks for your review!" };
}

export async function setReviewHidden(reviewId: string, hidden: boolean) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const review = await db.review.update({
    where: { id: reviewId },
    data: { hidden },
    include: { course: { select: { slug: true } } },
  });

  revalidatePath(`/courses/${review.course.slug}`);
  revalidatePath("/admin/reviews");
}
