import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Training",
  description: "Customised, team-based training programs delivered for your organisation — on your schedule.",
  path: "/corporate",
});

export default function CorporateTrainingPage() {
  return (
    <ModeLandingContent
      mode="CORPORATE"
      title="Corporate Training"
      description="Customised, team-based training programs delivered for your organisation — on your schedule."
    />
  );
}
