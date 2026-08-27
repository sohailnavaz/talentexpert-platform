import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { buildCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  const csv = buildCsv(
    [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "courseInterest", label: "Course interest" },
      { key: "message", label: "Message" },
      { key: "sourcePage", label: "Source page" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Date" },
    ],
    leads.map((l) => ({ ...l, createdAt: formatDate(l.createdAt) }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
