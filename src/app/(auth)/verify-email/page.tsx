import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { consumeVerifyToken } from "@/lib/auth/verify-token";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify your email",
  alternates: { canonical: "/verify-email" },
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const studentId = token ? await consumeVerifyToken(token) : null;

  if (studentId) {
    await db.student.update({ where: { id: studentId }, data: { emailVerified: true } });
  }

  return (
    <Card className="border-white/10 bg-white/[0.04] text-white backdrop-blur">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Verify your email</CardTitle>
        <CardDescription className="text-white/60">
          {studentId ? "Your email address is now verified." : "This verification link is invalid or has expired."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentId ? (
          <Button render={<Link href="/portal" />} nativeButton={false} className="w-full">
            Go to portal
          </Button>
        ) : (
          <Button render={<Link href="/portal" />} nativeButton={false} variant="outline" className="w-full">
            Back to portal
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
