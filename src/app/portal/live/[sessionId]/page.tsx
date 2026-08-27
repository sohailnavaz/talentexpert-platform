import type { Metadata } from "next";
import Link from "next/link";
import { verifyStudentSession } from "@/lib/auth/dal";
import { joinClassSession } from "@/lib/actions/live-session";
import { DailyCallRoom } from "@/components/portal/daily-call-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Live class" };

const REASON_MESSAGE: Record<string, string> = {
  "not-authenticated": "Your session has expired. Please sign in again.",
  "not-authorized": "You don't have access to this class session.",
  "not-found": "This class session no longer exists.",
  "not-configured": "This session doesn't have a live room set up yet.",
};

export default async function StudentLiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  await verifyStudentSession();
  const result = await joinClassSession(sessionId);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {result.ok ? (
        <DailyCallRoom roomUrl={result.roomUrl} token={result.token} />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">{REASON_MESSAGE[result.reason]}</p>
            <Button render={<Link href="/portal/courses" />} nativeButton={false} variant="outline">
              Back to courses
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
