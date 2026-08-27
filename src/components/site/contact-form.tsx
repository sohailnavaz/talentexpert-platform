"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitLead, type LeadFormState } from "@/lib/actions/leads";

const initialState: LeadFormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending..." : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitLead, initialState);

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "Message sent!");
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sourcePage" value="/contact" />
      <div className="space-y-1.5">
        <Label htmlFor="c-name">Full name</Label>
        <Input id="c-name" name="name" required />
        {state.errors?.name ? <p className="text-xs text-destructive">{state.errors.name[0]}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" required />
          {state.errors?.email ? <p className="text-xs text-destructive">{state.errors.email[0]}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-phone">Phone</Label>
          <Input id="c-phone" name="phone" required />
          {state.errors?.phone ? <p className="text-xs text-destructive">{state.errors.phone[0]}</p> : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" name="message" rows={4} placeholder="How can we help?" />
      </div>
      <SubmitButton />
    </form>
  );
}
