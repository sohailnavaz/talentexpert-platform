import type { Metadata } from "next";
import { Briefcase, MapPin } from "lucide-react";
import { getActiveJobOpenings } from "@/lib/data/content";
import { PageHero } from "@/components/site/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { JobApplicationDialog } from "@/components/site/job-application-dialog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Careers & Job Openings",
  description: "Job openings shared with Talent Expert learners and alumni.",
};

export default async function CareersPage() {
  const jobs = await getActiveJobOpenings();

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Job Openings"
        description="Openings shared by our hiring partners and our own team — open to learners and alumni."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        {jobs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No openings listed right now — check back soon.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-heading text-lg font-semibold">{job.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" /> {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span>{job.experience} experience</span>
                    </div>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">{job.description}</p>
                  </div>
                  <JobApplicationDialog
                    jobOpeningId={job.id}
                    jobTitle={job.title}
                    className={cn(buttonVariants(), "shrink-0")}
                  >
                    Apply now
                  </JobApplicationDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
