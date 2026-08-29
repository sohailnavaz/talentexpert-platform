import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Workshops",
  description: "Short, no-cost sessions to try a topic before committing to a full course.",
  path: "/workshops",
});

export default function WorkshopsPage() {
  return (
    <ModeLandingContent
      mode="WORKSHOP"
      title="Free Workshops"
      description="Short, no-cost sessions to try a topic before committing to a full course."
    />
  );
}
