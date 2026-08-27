"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteReview, setReviewHidden } from "@/lib/actions/reviews";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export function ReviewRowActions({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setReviewHidden(id, !hidden);
            toast.success(hidden ? "Review shown." : "Review hidden.");
            router.refresh();
          })
        }
      >
        {hidden ? "Show" : "Hide"}
      </Button>
      <ConfirmDeleteButton action={deleteReview.bind(null, id)} description="Permanently delete this review?" />
    </div>
  );
}
