"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  title: z.string().trim().min(3),
  excerpt: z.string().trim().min(10),
  content: z.string().trim().min(20),
  category: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

async function resolveCover(formData: FormData, existing?: string | null) {
  const file = formData.get("coverFile");
  if (file instanceof File && file.size > 0) return saveUploadedFile(file);
  const url = formData.get("coverImageUrl");
  if (typeof url === "string" && url.trim()) return url.trim();
  return existing ?? undefined;
}

export async function createPost(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category") || undefined,
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const coverImageUrl = await resolveCover(formData);
  const d = parsed.data;
  const baseSlug = slugify(d.title);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.blogPost.findUnique({ where: { slug } })) slug = `${baseSlug}-${attempt++}`;

  const post = await db.blogPost.create({
    data: {
      title: d.title,
      slug,
      excerpt: d.excerpt,
      content: d.content,
      category: d.category,
      status: d.status,
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
      coverImageUrl,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect(`/admin/blog/${post.id}/edit`);
}

export async function updatePost(
  postId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category") || undefined,
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const existing = await db.blogPost.findUnique({ where: { id: postId } });
  if (!existing) return { ok: false, message: "Post not found." };

  const coverImageUrl = await resolveCover(formData, existing.coverImageUrl);
  const d = parsed.data;

  await db.blogPost.update({
    where: { id: postId },
    data: {
      title: d.title,
      excerpt: d.excerpt,
      content: d.content,
      category: d.category,
      status: d.status,
      publishedAt: d.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
      coverImageUrl,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/blog");
  return { ok: true, message: "Post updated." };
}

export async function deletePost(postId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);
  await db.blogPost.delete({ where: { id: postId } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
