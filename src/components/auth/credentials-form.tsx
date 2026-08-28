"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Signing in..." : label}
    </Button>
  );
}

export function CredentialsForm({
  action,
  submitLabel = "Sign in",
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/80">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          inputSize="lg"
          className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/80">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          inputSize="lg"
          className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
        />
      </div>
      {!state.ok && state.message ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
