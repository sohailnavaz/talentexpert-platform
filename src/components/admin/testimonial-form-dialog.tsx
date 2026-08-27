"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTestimonial, updateTestimonial } from "@/lib/actions/admin-testimonials";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Testimonial } from "@/generated/prisma";

const RATING_LABELS = { "1": "1 star", "2": "2 stars", "3": "3 stars", "4": "4 stars", "5": "5 stars" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function TestimonialFormDialog({ testimonial }: { testimonial?: Testimonial }) {
  const [open, setOpen] = useState(false);
  const action = testimonial
    ? (updateTestimonial.bind(null, testimonial.id) as (state: AdminFormState, formData: FormData) => Promise<AdminFormState>)
    : createTestimonial;
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        setOpen(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          testimonial ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit testimonial" />
          ) : (
            <Button />
          )
        }
      >
        {testimonial ? <Pencil className="h-4 w-4" /> : (
          <>
            <Plus className="h-4 w-4" /> New testimonial
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{testimonial ? "Edit testimonial" : "New testimonial"}</DialogTitle>
          <DialogDescription>
            Shown in the &ldquo;Don&apos;t take our word for it&rdquo; scroller on the homepage and placements page.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Student name</Label>
              <Input id="studentName" name="studentName" defaultValue={testimonial?.studentName} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course (optional)</Label>
              <Input id="courseName" name="courseName" defaultValue={testimonial?.courseName ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote">Quote</Label>
            <Textarea id="quote" name="quote" rows={4} defaultValue={testimonial?.quote} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rating">Rating</Label>
              <Select name="rating" defaultValue={String(testimonial?.rating ?? 5)} items={RATING_LABELS}>
                <SelectTrigger id="rating" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RATING_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">Photo URL (optional)</Label>
              <Input id="photoUrl" name="photoUrl" placeholder="https://..." defaultValue={testimonial?.photoUrl ?? ""} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="active" defaultChecked={testimonial?.active ?? true} />
            Active (visible on the site)
          </label>
          {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
          <SubmitButton label={testimonial ? "Save changes" : "Add testimonial"} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
