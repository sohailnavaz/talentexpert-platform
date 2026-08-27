import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Online Training" };

export default function OnlineTrainingPage() {
  return (
    <ModeLandingContent
      mode="ONLINE"
      title="Online Training"
      description="Live, instructor-led sessions you can join from anywhere — with the same doubt-clearing and project reviews as classroom batches."
    />
  );
}
