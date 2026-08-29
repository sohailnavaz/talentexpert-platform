import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Classroom Training",
  description:
    "In-person, hands-on sessions at our training center — best for learners who prefer face-to-face mentorship.",
  path: "/classroom",
});

export default function ClassroomTrainingPage() {
  return (
    <ModeLandingContent
      mode="CLASSROOM"
      title="Classroom Training"
      description="In-person, hands-on sessions at our training center — best for learners who prefer face-to-face mentorship."
    />
  );
}
