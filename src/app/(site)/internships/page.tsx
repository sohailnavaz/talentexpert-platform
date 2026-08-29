import type { Metadata } from "next";
import { ModeLandingContent } from "@/components/site/mode-landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Internships",
  description: "Structured, project-based internships that combine mentorship with real deliverables for your resume.",
  path: "/internships",
});

export default function InternshipsPage() {
  return (
    <ModeLandingContent
      mode="INTERNSHIP"
      title="Internships"
      description="Structured, project-based internships that combine mentorship with real deliverables for your resume."
    />
  );
}
