import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { TestimonialFormDialog } from "@/components/admin/testimonial-form-dialog";
import { TestimonialRowActions } from "@/components/admin/testimonial-row-actions";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the quotes shown in the homepage and placements-page review scroller.
          </p>
        </div>
        <TestimonialFormDialog />
      </div>

      <div className="flex flex-col gap-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{t.studentName}</p>
                {t.courseName ? <span className="text-xs text-muted-foreground">— {t.courseName}</span> : null}
                {!t.active ? <Badge variant="secondary">Hidden</Badge> : null}
              </div>
              <div className="mt-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < t.rating
                        ? "h-3.5 w-3.5 fill-[var(--brand-2)] text-[var(--brand-2)]"
                        : "h-3.5 w-3.5 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
            </div>
            <TestimonialRowActions testimonial={t} />
          </div>
        ))}
        {testimonials.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No testimonials yet.</p>
        ) : null}
      </div>
    </div>
  );
}
