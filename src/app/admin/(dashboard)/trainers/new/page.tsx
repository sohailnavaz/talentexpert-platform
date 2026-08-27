import type { Metadata } from "next";
import { TrainerForm } from "@/components/admin/trainer-form";
import { BackLink } from "@/components/admin/back-link";
import { createTrainer } from "@/lib/actions/admin-trainers";

export const metadata: Metadata = { title: "Add Trainer" };

export default function NewTrainerPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/trainers" label="Back to trainers" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Add Trainer</h1>
      </div>
      <TrainerForm action={createTrainer} submitLabel="Create trainer" />
    </div>
  );
}
