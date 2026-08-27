import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { loginTrainer } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Trainer Login" };

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
        <CardContent>
          <CredentialsForm action={loginTrainer} submitLabel="Sign in to trainer portal" />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
