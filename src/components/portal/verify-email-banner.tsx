"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Sending..." : "Resend email"}
    </Button>
  );
}

export function VerifyEmailBanner() {
  const [state, formAction] = useActionState(resendVerificationEmail, initialState);

  useEffect(() => {
    if (!state.message) return;
    state.ok ? toast.success(state.message) : toast.error(state.message);
  }, [state]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <MailWarning className="h-4 w-4 shrink-0" />
        <span>Please verify your email address to secure your account.</span>
      </div>
      <form action={formAction}>
        <ResendButton />
      </form>
    </div>
  );
}
