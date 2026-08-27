import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Free Workshops" };

export default function WorkshopsPage() {
  return (
    <ModeLandingContent
      mode="WORKSHOP"
      title="Free Workshops"
      description="Short, no-cost sessions to try a topic before committing to a full course."
    />
  );
}
