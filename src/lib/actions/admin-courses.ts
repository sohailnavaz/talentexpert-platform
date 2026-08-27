"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";

const MODES = ["ONLINE", "CLASSROOM", "WEEKEND", "CORPORATE", "INTERNSHIP", "WORKSHOP"] as const;

const courseSchema = z.object({
  title: z.string().trim().min(3, "Title is too short"),
  shortDescription: z.string().trim().min(10, "Add a short description"),
  description: z.string().trim().min(20, "Add a full description"),
  categoryId: z.string().optional(),
  trainerId: z.string().optional(),
  level: z.string().trim().optional(),
  durationText: z.string().trim().optional(),
  regularFee: z.coerce.number().min(0, "Fee must be positive"),
  modes: z.array(z.enum(MODES)).min(1, "Select at least one mode"),
  highlights: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.coerce.boolean().optional(),
});

export type AdminFormState = { ok: boolean; message?: string };

function linesToArray(input: string | undefined) {
  return (input ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

async function resolveThumbnail(formData: FormData, existing?: string | null) {
  const file = formData.get("thumbnailFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedFile(file);
  }
  const url = formData.get("thumbnailUrl");
  if (typeof url === "string" && url.trim()) return url.trim();
  return existing ?? undefined;
}

export async function createCourse(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || undefined,
    trainerId: formData.get("trainerId") || undefined,
    level: formData.get("level") || undefined,
    durationText: formData.get("durationText") || undefined,
    regularFee: formData.get("regularFee"),
    modes: formData.getAll("modes"),
    highlights: formData.get("highlights") || undefined,
    status: formData.get("status") ?? "DRAFT",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const thumbnailUrl = await resolveThumbnail(formData);
  const data = parsed.data;
  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const course = await db.course.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      trainerId: data.trainerId || null,
      level: data.level,
      durationText: data.durationText,
      regularFee: data.regularFee,
      modes: data.modes,
      highlights: linesToArray(data.highlights),
      status: data.status,
      featured: Boolean(data.featured),
      thumbnailUrl,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourse(
  courseId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || undefined,
    trainerId: formData.get("trainerId") || undefined,
    level: formData.get("level") || undefined,
    durationText: formData.get("durationText") || undefined,
    regularFee: formData.get("regularFee"),
    modes: formData.getAll("modes"),
    highlights: formData.get("highlights") || undefined,
    status: formData.get("status") ?? "DRAFT",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const existing = await db.course.findUnique({ where: { id: courseId } });
  if (!existing) return { ok: false, message: "Course not found." };

  const thumbnailUrl = await resolveThumbnail(formData, existing.thumbnailUrl);
  const data = parsed.data;

  await db.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      trainerId: data.trainerId || null,
      level: data.level,
      durationText: data.durationText,
      regularFee: data.regularFee,
      modes: data.modes,
      highlights: linesToArray(data.highlights),
      status: data.status,
      featured: Boolean(data.featured),
      thumbnailUrl,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/courses/${existing.slug}`);
  revalidatePath("/courses");
  return { ok: true, message: "Course updated." };
}

export async function deleteCourse(courseId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const course = await db.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
}

export async function addModule(courseId: string, title: string) {
  await verifyAdminSession();
  const count = await db.courseModule.count({ where: { courseId } });
  await db.courseModule.create({ data: { courseId, title, order: count } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  await verifyAdminSession();
  await db.courseModule.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function addTopic(moduleId: string, courseId: string, title: string) {
  await verifyAdminSession();
  const count = await db.courseTopic.count({ where: { moduleId } });
  await db.courseTopic.create({ data: { moduleId, title, order: count } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteTopic(topicId: string, courseId: string) {
  await verifyAdminSession();
  await db.courseTopic.delete({ where: { id: topicId } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}
