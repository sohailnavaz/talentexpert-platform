import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { loginAdmin } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AuthShell>
      <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Admin Control Panel</CardTitle>
          <CardDescription className="text-white/60">
            Sign in with your staff credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CredentialsForm action={loginAdmin} submitLabel="Sign in to admin" />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
