import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Reviews" };

const STATUS_OPTIONS = { visible: "Visible", hidden: "Hidden" };
const RATING_OPTIONS = { "5": "5 stars", "4": "4 stars", "3": "3 stars", "2": "2 stars", "1": "1 star" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; rating?: string }>;
}) {
  const { q, status, rating } = await searchParams;

  const where: Prisma.ReviewWhereInput = {
    ...(q
      ? {
          OR: [
            { authorName: { contains: q, mode: "insensitive" } },
            { comment: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "visible" ? { hidden: false } : status === "hidden" ? { hidden: true } : {}),
    ...(rating && rating in RATING_OPTIONS ? { rating: Number(rating) } : {}),
  };

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { course: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate course reviews. Hidden reviews stay in the database but don&apos;t show publicly.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by author or comment" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All" />
        <ParamSelect paramKey="rating" options={RATING_OPTIONS} allLabel="All ratings" />
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{r.authorName}</p>
                <span className="text-xs text-muted-foreground">on {r.course.title}</span>
                {r.hidden ? <Badge variant="secondary">Hidden</Badge> : null}
              </div>
              <div className="mt-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < r.rating ? "h-3.5 w-3.5 fill-[var(--brand-2)] text-[var(--brand-2)]" : "h-3.5 w-3.5 text-muted-foreground/30"} />
                ))}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
            </div>
            <ReviewRowActions id={r.id} hidden={r.hidden} />
          </div>
        ))}
        {reviews.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No reviews yet.</p>
        ) : null}
      </div>
    </div>
  );
}
