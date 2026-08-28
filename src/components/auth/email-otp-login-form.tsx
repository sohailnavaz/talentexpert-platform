"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestStudentLoginOtp, verifyStudentLoginOtp, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };
const fieldClass = "border-white/15 bg-white/5 text-white placeholder:text-white/40";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function EmailOtpLoginForm() {
  const [requestState, requestAction] = useActionState(requestStudentLoginOtp, initialState);
  const [verifyState, verifyAction] = useActionState(verifyStudentLoginOtp, initialState);
  const [codeSent, setCodeSent] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!requestState.ok || !requestState.message) return;
    const timer = setTimeout(() => setCodeSent(true), 0);
    return () => clearTimeout(timer);
  }, [requestState]);

  if (codeSent) {
    return (
      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          If that email is registered, a 6-digit code is on its way to {email}.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="eo-otp" className="text-white/80">
            6-digit code
          </Label>
          <Input
            id="eo-otp"
            name="otp"
            inputMode="numeric"
            maxLength={6}
            required
            placeholder="123456"
            className={fieldClass}
          />
        </div>
        {!verifyState.ok && verifyState.message ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{verifyState.message}</p>
        ) : null}
        <SubmitButton label="Sign in" pendingLabel="Verifying..." />
        <button
          type="button"
          onClick={() => setCodeSent(false)}
          className="w-full text-center text-sm text-white/50 hover:text-white"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eo-email" className="text-white/80">
          Email
        </Label>
        <Input
          id="eo-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      {!requestState.ok && requestState.message ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{requestState.message}</p>
      ) : null}
      <SubmitButton label="Email me a code" pendingLabel="Sending..." />
    </form>
  );
}
