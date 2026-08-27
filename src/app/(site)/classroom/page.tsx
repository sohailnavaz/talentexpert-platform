import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Classroom Training" };

export default function ClassroomTrainingPage() {
  return (
    <ModeLandingContent
      mode="CLASSROOM"
      title="Classroom Training"
      description="In-person, hands-on sessions at our training center — best for learners who prefer face-to-face mentorship."
    />
  );
}
