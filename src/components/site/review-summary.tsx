import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Review } from "@/generated/prisma";

export function ReviewStarsAverage({
  reviews,
  onDark = false,
}: {
  reviews: { rating: number }[];
  onDark?: boolean;
}) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={
              n <= Math.round(avg)
                ? "h-4 w-4 fill-[var(--brand-2)] text-[var(--brand-2)]"
                : `h-4 w-4 ${onDark ? "text-white/25" : "text-muted-foreground/40"}`
            }
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${onDark ? "text-white" : ""}`}>{avg.toFixed(1)}</span>
      <span className={`text-sm ${onDark ? "text-white/60" : "text-muted-foreground"}`}>
        ({reviews.length} review{reviews.length === 1 ? "" : "s"})
      </span>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{r.authorName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
          </div>
          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={n <= r.rating ? "h-3.5 w-3.5 fill-[var(--brand-2)] text-[var(--brand-2)]" : "h-3.5 w-3.5 text-muted-foreground/40"}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
