import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [], batches: [], posts: [] });
  }

  const [courses, batches, posts] = await Promise.all([
    db.course.findMany({
      where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, slug: true },
      take: 6,
    }),
    db.batch.findMany({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
        course: { title: { contains: q, mode: "insensitive" } },
      },
      select: {
        id: true,
        startDate: true,
        course: { select: { title: true, slug: true } },
      },
      take: 6,
      orderBy: { startDate: "asc" },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, slug: true },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    courses,
    batches: batches.map((b) => ({
      id: b.id,
      courseTitle: b.course.title,
      courseSlug: b.course.slug,
      startDate: b.startDate,
    })),
    posts,
  });
}
