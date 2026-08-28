import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BatchForm } from "@/components/admin/batch-form";
import { OffersManager } from "@/components/admin/offers-manager";
import { SessionsMaterialsManager } from "@/components/admin/sessions-materials-manager";
import { BackLink } from "@/components/admin/back-link";
import { updateBatch } from "@/lib/actions/admin-batches";
import { resolveStorageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Manage Batch" };

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [batch, courses, trainers] = await Promise.all([
    db.batch.findUnique({
      where: { id },
      include: {
        course: true,
        offers: { orderBy: { startAt: "desc" } },
        sessions: { orderBy: { date: "asc" } },
        materials: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.trainer.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!batch) notFound();

  const materials = await Promise.all(
    batch.materials.map(async (m) => ({ ...m, fileUrl: await resolveStorageUrl(m.fileUrl) }))
  );
  const updateBatchWithId = updateBatch.bind(null, batch.id);
  const { course: _course, offers: _offers, sessions: _sessions, materials: _materials, ...batchScalars } = batch;

  return (
    <div className="space-y-10">
      <BackLink href="/admin/batches" label="Back to batches" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Manage Batch</h1>
        <p className="mt-1 text-sm text-muted-foreground">{batch.course.title}</p>
      </div>

      <BatchForm
        action={updateBatchWithId}
        courses={courses}
        trainers={trainers}
        batch={{ ...batchScalars, fee: Number(batch.fee) }}
      />

      <div className="max-w-2xl border-t border-border pt-8">
        <h2 className="font-heading text-lg font-semibold">Early-bird offers</h2>
        <div className="mt-3">
          <OffersManager
            batchId={batch.id}
            offers={batch.offers.map((o) => ({
              ...o,
              value: Number(o.value),
              startAt: o.startAt.toISOString(),
              endAt: o.endAt.toISOString(),
            }))}
          />
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="font-heading text-lg font-semibold">Sessions &amp; materials</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These appear instantly in enrolled students&apos; portals.
        </p>
        <div className="mt-4">
          <SessionsMaterialsManager
            batchId={batch.id}
            sessions={batch.sessions.map((s) => ({ ...s, date: s.date.toISOString() }))}
            materials={materials}
            dailyEnabled={Boolean(process.env.DAILY_API_KEY)}
          />
        </div>
      </div>
    </div>
  );
}
