import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Corporate Training" };

export default function CorporateTrainingPage() {
  return (
    <ModeLandingContent
      mode="CORPORATE"
      title="Corporate Training"
      description="Customised, team-based training programs delivered for your organisation — on your schedule."
    />
  );
}
