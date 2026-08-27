"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReview, type ReviewFormState } from "@/lib/actions/reviews";

const initialState: ReviewFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Submitting..." : "Submit review"}
    </Button>
  );
}

export function ReviewForm({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const [state, formAction] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
  }, [state]);

  if (state.ok && state.message) {
    return <p className="text-sm text-muted-foreground">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border p-4">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} stars`}
            className="p-0.5"
          >
            <Star className={cn("h-5 w-5", n <= rating ? "fill-[var(--brand-2)] text-[var(--brand-2)]" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      <Input name="authorName" placeholder="Your name" required />
      <Textarea name="comment" placeholder="Share your experience with this course..." rows={3} required minLength={10} />
      {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
}
