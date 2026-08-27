"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
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
import { Button } from "@/components/ui/button";
import { submitJobApplication, type JobApplicationFormState } from "@/lib/actions/job-applications";

const initialState: JobApplicationFormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Submit application"}
    </Button>
  );
}

export function JobApplicationDialog({
  jobOpeningId,
  jobTitle,
  className,
  children,
}: {
  jobOpeningId: string;
  jobTitle: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitJobApplication, initialState);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Apply — {jobTitle}</DialogTitle>
          <DialogDescription>Share your details and we&apos;ll review your application.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="jobOpeningId" value={jobOpeningId} />
          <div className="space-y-1.5">
            <Label htmlFor="app-name">Full name</Label>
            <Input id="app-name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-email">Email</Label>
            <Input id="app-email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-phone">Phone</Label>
            <Input id="app-phone" name="phone" required />
          </div>
          {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
