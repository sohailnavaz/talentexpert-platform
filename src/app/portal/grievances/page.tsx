import type { Metadata } from "next";
import { MessageSquareWarning } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getStudentGrievances } from "@/lib/actions/grievances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrievanceForm } from "@/components/portal/grievance-form";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Support" };

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
const STATUS_VARIANT: Record<string, "default" | "secondary"> = {
  OPEN: "secondary",
  IN_PROGRESS: "default",
  RESOLVED: "default",
  CLOSED: "secondary",
};

export default async function GrievancesPage() {
  const session = await verifyStudentSession();
  const grievances = await getStudentGrievances(session.studentId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Raise a concern or complaint and our team will get back to you here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Raise a new concern</CardTitle>
        </CardHeader>
        <CardContent>
          <GrievanceForm />
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading text-lg font-semibold">Your submissions</h2>
        {grievances.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <MessageSquareWarning className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-3">
            {grievances.map((g) => (
              <Card key={g.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{g.subject}</p>
                    <Badge variant={STATUS_VARIANT[g.status]}>{STATUS_LABELS[g.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{g.body}</p>
                  <p className="text-xs text-muted-foreground">Submitted {formatDate(g.createdAt)}</p>
                  {g.adminReply ? (
                    <div className="mt-2 rounded-lg border-l-2 border-primary bg-secondary/40 p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground">Talent Expert team</p>
                      <p className="mt-1">{g.adminReply}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
