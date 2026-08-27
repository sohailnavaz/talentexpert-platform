import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TrainerForm } from "@/components/admin/trainer-form";
import { BackLink } from "@/components/admin/back-link";
import { updateTrainer } from "@/lib/actions/admin-trainers";

export const metadata: Metadata = { title: "Edit Trainer" };

export default async function EditTrainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trainer = await db.trainer.findUnique({ where: { id } });
  if (!trainer) notFound();

  const updateTrainerWithId = updateTrainer.bind(null, trainer.id);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/trainers" label="Back to trainers" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Trainer</h1>
        <p className="mt-1 text-sm text-muted-foreground">{trainer.name}</p>
      </div>
      <TrainerForm action={updateTrainerWithId} trainer={trainer} />
    </div>
  );
}
