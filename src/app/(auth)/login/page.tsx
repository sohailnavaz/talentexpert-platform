import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
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
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleSignInButton className="border-white/15 bg-white/5 text-white hover:bg-white/10" />
        <div className="flex items-center justify-between text-xs text-white/50">
          <Link href="/forgot-password" className="hover:text-white">
            Forgot password?
          </Link>
          <Link href="/courses" className="hover:text-white">
            Browse courses
          </Link>
        </div>
        <p className="border-t border-white/10 pt-4 text-center text-xs text-white/50">
          New here?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Create a free account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
