"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { JobOpening } from "@/generated/prisma";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function JobForm({
  action,
  job,
  submitLabel = "Save opening",
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  job?: JobOpening;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Role title</Label>
          <Input id="title" name="title" defaultValue={job?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={job?.company ?? "Talent Expert"} required />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={job?.location} placeholder="Remote / Hyderabad" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experience">Experience</Label>
          <Input id="experience" name="experience" defaultValue={job?.experience} placeholder="0-2 years" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={8} defaultValue={job?.description} required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="active" defaultChecked={job?.active ?? true} />
        Active (visible on careers page)
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
