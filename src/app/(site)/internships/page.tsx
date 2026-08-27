import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";

export const metadata: Metadata = { title: "Internships" };

export default function InternshipsPage() {
  return (
    <ModeLandingContent
      mode="INTERNSHIP"
      title="Internships"
      description="Structured, project-based internships that combine mentorship with real deliverables for your resume."
    />
  );
}
