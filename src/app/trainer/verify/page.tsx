import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";
import { TrainerVerifyForm } from "@/components/auth/trainer-verify-form";

export const metadata: Metadata = { title: "Verify Trainer Email", robots: { index: false, follow: false } };

export default function TrainerVerifyPage() {
  return (
    <AuthShell>
      <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Verify your email</CardTitle>
          <CardDescription className="text-white/60">
            Enter the code we emailed you, then set your trainer portal password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrainerVerifyForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
