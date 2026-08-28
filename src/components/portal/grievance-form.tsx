"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitGrievance, type GrievanceFormState } from "@/lib/actions/grievances";

const initialState: GrievanceFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

export function GrievanceForm() {
  const [state, formAction] = useActionState(submitGrievance, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="gr-subject">Subject</Label>
        <Input id="gr-subject" name="subject" placeholder="What's this about?" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gr-body">Details</Label>
        <Textarea id="gr-body" name="body" placeholder="Tell us what happened" rows={4} required />
      </div>
      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
