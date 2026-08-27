import { db } from "@/lib/db";

export async function getActiveTestimonials(take = 8) {
  return db.testimonial.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getActivePlacements(take = 12) {
  return db.placement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getActiveTrainers() {
  return db.trainer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });
}

export async function getTrainerBySlug(slug: string) {
  return db.trainer.findUnique({
    where: { slug },
    include: { courses: { where: { status: "PUBLISHED" } } },
  });
}

export async function getPublishedPosts(params: { category?: string; take?: number } = {}) {
  return db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(params.category ? { category: params.category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: params.take,
  });
}

export async function getPostBySlug(slug: string) {
  return db.blogPost.findUnique({ where: { slug } });
}

export async function getActiveJobOpenings() {
  return db.jobOpening.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
}

export async function getContentBlock<T>(key: string, fallback: T): Promise<T> {
  const block = await db.contentBlock.findUnique({ where: { key } });
  return (block?.data as T) ?? fallback;
}
