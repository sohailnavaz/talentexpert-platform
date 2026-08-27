"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { TestimonialFormDialog } from "@/components/admin/testimonial-form-dialog";
import { toggleTestimonialActive, deleteTestimonial } from "@/lib/actions/admin-testimonials";
import type { Testimonial } from "@/generated/prisma";

export function TestimonialRowActions({ testimonial }: { testimonial: Testimonial }) {
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
            await toggleTestimonialActive(testimonial.id);
            toast.success(testimonial.active ? "Testimonial hidden." : "Testimonial shown.");
            router.refresh();
          })
        }
      >
        {testimonial.active ? "Hide" : "Show"}
      </Button>
      <TestimonialFormDialog testimonial={testimonial} />
      <ConfirmDeleteButton
        action={deleteTestimonial.bind(null, testimonial.id)}
        description="Permanently delete this testimonial?"
      />
    </div>
  );
}
