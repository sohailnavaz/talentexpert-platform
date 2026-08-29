import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Weekend Batches",
  description: "For working professionals — full courses delivered across Saturday and Sunday sessions.",
  path: "/weekend",
});

export default function WeekendBatchesPage() {
  return (
    <ModeLandingContent
      mode="WEEKEND"
      title="Weekend Batches"
      description="For working professionals — full courses delivered across Saturday and Sunday sessions."
    />
  );
}
