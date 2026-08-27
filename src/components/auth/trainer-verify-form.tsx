"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verifyTrainerOtp, setTrainerPassword, type AuthFormState } from "@/lib/actions/auth";

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

export function TrainerVerifyForm() {
  const [otpState, verifyOtpAction] = useActionState(verifyTrainerOtp, initialState);
  const [passwordState, setPasswordAction] = useActionState(setTrainerPassword, initialState);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (otpState.ok && otpState.message) setVerified(true);
  }, [otpState]);

  if (verified) {
    return (
      <form action={setPasswordAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Email verified.</p>
        <div className="space-y-1.5">
          <Label htmlFor="tv-password" className="text-white/80">
            New password
          </Label>
          <Input
            id="tv-password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={fieldClass}
          />
        </div>
        {!passwordState.ok && passwordState.message ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{passwordState.message}</p>
        ) : null}
        <SubmitButton label="Set password and sign in" pendingLabel="Saving..." />
      </form>
    );
  }

  return (
    <form action={verifyOtpAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tv-email" className="text-white/80">
          Email
        </Label>
        <Input
          id="tv-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tv-otp" className="text-white/80">
          6-digit code
        </Label>
        <Input
          id="tv-otp"
          name="otp"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className={fieldClass}
        />
        <p className="text-xs text-white/40">Check the email sent when your trainer portal access was created.</p>
      </div>
      {!otpState.ok && otpState.message ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{otpState.message}</p>
      ) : null}
      <SubmitButton label="Verify code" pendingLabel="Verifying..." />
      <p className="text-center text-sm text-white/50">
        Already set your password?{" "}
        <Link href="/trainer/login" className="text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
