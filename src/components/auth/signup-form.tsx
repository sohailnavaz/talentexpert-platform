"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signupStudent, type SignupState } from "@/lib/actions/signup";

const initialState: SignupState = { ok: true };
const fieldClass = "border-white/15 bg-white/5 text-white placeholder:text-white/40";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Creating account..." : "Create free account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupStudent, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="su-name" className="text-white/80">
          Full name
        </Label>
        <Input id="su-name" name="name" required placeholder="Your name" className={fieldClass} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-email" className="text-white/80">
          Email
        </Label>
        <Input id="su-email" name="email" type="email" required placeholder="you@email.com" className={fieldClass} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-phone" className="text-white/80">
          Phone
        </Label>
        <Input id="su-phone" name="phone" required placeholder="10-digit mobile" className={fieldClass} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-password" className="text-white/80">
          Password
        </Label>
        <Input
          id="su-password"
          name="password"
          type="password"
          required
          placeholder="At least 8 characters"
          className={fieldClass}
        />
      </div>
      {!state.ok && state.message ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
