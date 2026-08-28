"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPassword, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Updating..." : "Update password"}
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, initialState);

  if (state.message && state.ok) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.message}</p>
        <Button render={<Link href="/login" />} nativeButton={false} className="w-full">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/80">
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          inputSize="lg"
          className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
        />
      </div>
      {!state.ok && state.message ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
