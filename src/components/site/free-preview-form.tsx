"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { startFreePreview } from "@/lib/actions/free-preview";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Unlocking..." : "Watch free intro class"}
    </Button>
  );
}

export function FreePreviewForm({ batchId }: { batchId: string }) {
  const router = useRouter();
  const action = startFreePreview.bind(null, batchId);
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="preview-name">Full name</Label>
        <Input id="preview-name" name="name" placeholder="Your name" inputSize="lg" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="preview-email">Email</Label>
        <Input id="preview-email" name="email" type="email" placeholder="you@email.com" inputSize="lg" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="preview-phone">Phone</Label>
        <Input id="preview-phone" name="phone" placeholder="10-digit mobile" inputSize="lg" required />
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-destructive">
          {state.message}
          {state.message.includes("Please sign in") ? (
            <>
              {" "}
              <Link href="/login" className="underline underline-offset-2">
                Sign in
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        No payment required. We&apos;ll create your free student account to save your progress.
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton />
    </form>
  );
}
