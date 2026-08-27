import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";
import { ReviewRowActions } from "@/components/admin/review-row-actions";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
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
