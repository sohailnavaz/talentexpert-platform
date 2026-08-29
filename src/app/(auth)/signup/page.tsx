import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata: Metadata = {
  title: "Create Account",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Create your free account</CardTitle>
        <CardDescription className="text-white/60">
          Browse courses, save your progress, and enrol whenever you&apos;re ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleSignInButton className="border-white/15 bg-white/5 text-white hover:bg-white/10" />
        <p className="text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
