import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Online Training",
  description:
    "Live, instructor-led sessions you can join from anywhere — with the same doubt-clearing and project reviews as classroom batches.",
  path: "/online",
});

export default function OnlineTrainingPage() {
  return (
    <ModeLandingContent
      mode="ONLINE"
      title="Online Training"
      description="Live, instructor-led sessions you can join from anywhere — with the same doubt-clearing and project reviews as classroom batches."
    />
  );
}
