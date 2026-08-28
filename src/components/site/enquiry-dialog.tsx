"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
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
import { submitLead, type LeadFormState } from "@/lib/actions/leads";

const initialState: LeadFormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Sending..." : "Send my enquiry"}
    </Button>
  );
}

export function EnquiryDialog({
  children,
  className,
  courseInterest,
  title = "Talk to our course counsellor",
}: {
  children: ReactNode;
  className?: string;
  courseInterest?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitLead, initialState);
  const pathname = usePathname();

  useEffect(() => {
    if (!state.ok) return;
    toast.success(state.message ?? "Thanks! We'll be in touch shortly.");
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>
            Share a few details and we&apos;ll call you back within a few hours.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="sourcePage" value={pathname} />
          <div className="space-y-1.5">
            <Label htmlFor="enq-name">Full name</Label>
            <Input id="enq-name" name="name" placeholder="Your name" inputSize="lg" required />
            {state.errors?.name ? (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="enq-email">Email</Label>
              <Input id="enq-email" type="email" name="email" placeholder="you@email.com" inputSize="lg" required />
              {state.errors?.email ? (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enq-phone">Phone</Label>
              <Input id="enq-phone" name="phone" placeholder="10-digit mobile" inputSize="lg" required />
              {state.errors?.phone ? (
                <p className="text-xs text-destructive">{state.errors.phone[0]}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-course">Course interested in</Label>
            <Input
              id="enq-course"
              name="courseInterest"
              placeholder="e.g. Full Stack Development"
              defaultValue={courseInterest}
              inputSize="lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-message">Message (optional)</Label>
            <Textarea id="enq-message" name="message" placeholder="Tell us anything that helps" rows={3} />
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
