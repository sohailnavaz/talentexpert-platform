import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { verifyTrainerSession } from "@/lib/auth/dal";
import { getTrainerMessageableStudents } from "@/lib/actions/direct-messages";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { generateAvatarDataUri } from "@/lib/avatar";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function TrainerMessagesPage() {
  const session = await verifyTrainerSession();
  const students = await getTrainerMessageableStudents(session.trainerId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Message students from your batches directly.</p>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enrolled students to message yet.</p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <Link key={s.id} href={`/trainer/messages/${s.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={s.avatarUrl ?? generateAvatarDataUri(s.id)} alt={s.name} />
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {s.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.email}</p>
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
