import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { loginTrainer } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Trainer Login", robots: { index: false, follow: false } };

export default function TrainerLoginPage() {
  return (
    <AuthShell>
      <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Trainer Portal</CardTitle>
          <CardDescription className="text-white/60">
            Sign in to manage your batches, attendance and student messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsForm action={loginTrainer} submitLabel="Sign in to trainer portal" />
          <p className="text-center text-sm text-white/50">
            First time here?{" "}
            <Link href="/trainer/verify" className="text-primary underline underline-offset-4">
              Verify your email
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
