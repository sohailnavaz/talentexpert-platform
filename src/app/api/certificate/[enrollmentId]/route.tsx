import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getStudentSession } from "@/lib/auth/session";
import { getEnrollmentForStudent } from "@/lib/data/portal";
import { CertificateDocument } from "@/lib/certificate";
import { formatDate } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { enrollmentId } = await params;
  const enrollment = await getEnrollmentForStudent(session.studentId, enrollmentId);
  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!enrollment.completedAt) {
    return NextResponse.json({ error: "Certificate not available yet" }, { status: 403 });
  }

  const buffer = await renderToBuffer(
    <CertificateDocument
      studentName={session.name}
      courseTitle={enrollment.batch.course.title}
      completedDate={formatDate(enrollment.completedAt)}
      certificateId={enrollment.enrollmentCode ?? enrollment.id}
      trainerName={enrollment.batch.trainer?.name ?? null}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${enrollment.batch.course.slug}-certificate.pdf"`,
    },
  });
}
