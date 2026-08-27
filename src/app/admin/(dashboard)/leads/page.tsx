import type { Metadata } from "next";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";

export const metadata: Metadata = { title: "Leads / Enquiries" };

export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leads / Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads.length} shown (most recent 300)</p>
        </div>
        <Button variant="outline" render={<a href="/api/admin/leads/export" />} nativeButton={false}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Course interest</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {l.email}
                  <br />
                  {l.phone}
                </TableCell>
                <TableCell>{l.courseInterest ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.sourcePage ?? "—"}</TableCell>
                <TableCell>{formatDate(l.createdAt)}</TableCell>
                <TableCell>
                  <LeadStatusSelect leadId={l.id} status={l.status} />
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No enquiries yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
