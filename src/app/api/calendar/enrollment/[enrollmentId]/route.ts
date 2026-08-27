import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/session";
import { getEnrollmentForStudent } from "@/lib/data/portal";
import { buildIcsCalendar } from "@/lib/calendar";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { enrollmentId } = await params;
  const enrollment = await getEnrollmentForStudent(session.studentId, enrollmentId);
  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ics = buildIcsCalendar(
    enrollment.batch.sessions.map((s) => ({
      uid: s.id,
      title: `${enrollment.batch.course.title}: ${s.topic}`,
      description: `${s.time} — Join: ${s.joinUrl}`,
      date: s.date,
    }))
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${enrollment.batch.course.slug}-schedule.ics"`,
    },
  });
}
