import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Weekend Batches" };

export default function WeekendBatchesPage() {
  return (
    <ModeLandingContent
      mode="WEEKEND"
      title="Weekend Batches"
      description="For working professionals — full courses delivered across Saturday and Sunday sessions."
    />
  );
}
