import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getStudentMessageableTrainers } from "@/lib/actions/direct-messages";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function StudentMessagesPage() {
  const session = await verifyStudentSession();
  const trainers = await getStudentMessageableTrainers(session.studentId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Message trainers from your enrolled batches directly.</p>
      </div>

      {trainers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to message a trainer once you&apos;re enrolled in one of their batches.
        </p>
      ) : (
        <div className="space-y-2">
          {trainers.map((t) => (
            <Link key={t.id} href={`/portal/messages/${t.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    {t.photoUrl ? <AvatarImage src={t.photoUrl} alt={t.name} /> : null}
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {t.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Trainer</p>
                  </div>
                  <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
