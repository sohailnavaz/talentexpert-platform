import { db } from "@/lib/db";
import type { DeliveryMode } from "@/generated/prisma";

export async function getFeaturedCourses(take = 6) {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    include: { category: true, trainer: true },
  });
}

export async function getPublishedCourses(params: {
  categorySlug?: string;
  mode?: DeliveryMode;
  q?: string;
} = {}) {
  const { categorySlug, mode, q } = params;
  return db.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(mode ? { modes: { has: mode } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { category: true, trainer: true },
  });
}

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      trainer: true,
      modules: { orderBy: { order: "asc" }, include: { topics: { orderBy: { order: "asc" } } } },
      batches: {
        where: { status: { in: ["UPCOMING", "ONGOING"] } },
        orderBy: { startDate: "asc" },
        include: { offers: true, trainer: true },
      },
    },
  });
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getUpcomingBatches(params: { mode?: DeliveryMode; take?: number } = {}) {
  const { mode, take } = params;
  return db.batch.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      ...(mode ? { mode } : {}),
    },
    orderBy: { startDate: "asc" },
    take,
    include: { course: true, trainer: true, offers: true },
  });
}

export async function getRelatedCourses(courseId: string, categoryId: string | null, take = 3) {
  return db.course.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: courseId },
      ...(categoryId ? { categoryId } : {}),
    },
    take,
    include: { category: true },
  });
}
