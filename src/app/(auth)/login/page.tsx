import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { loginStudent } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Student Login" };

export default function StudentLoginPage() {
  return (
    <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Student Login</CardTitle>
        <CardDescription className="text-white/60">
          Sign in to see your courses, session links and materials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CredentialsForm action={loginStudent} />
        <div className="flex items-center justify-between text-xs text-white/50">
          <Link href="/forgot-password" className="hover:text-white">
            Forgot password?
          </Link>
          <Link href="/courses" className="hover:text-white">
            Browse courses
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
