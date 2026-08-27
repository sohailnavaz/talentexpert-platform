import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTrainerBySlug } from "@/lib/data/content";
import { CourseCard } from "@/components/site/course-card";
import { SectionHeading } from "@/components/site/section-heading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) return {};
  return { title: trainer.name, description: trainer.bio ?? undefined };
}

export default async function TrainerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer || !trainer.active) notFound();

  return (
    <>
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white/10 bg-white/10">
            {trainer.photoUrl ? (
              <Image src={trainer.photoUrl} alt={trainer.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-bold">
                {trainer.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold">{trainer.name}</h1>
          {trainer.experienceYears ? (
            <p className="text-white/70">{trainer.experienceYears}+ years of industry experience</p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2">
            {trainer.expertise.map((e) => (
              <span key={e} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">
                {e}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-semibold">About</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {trainer.bio ?? "No bio available yet."}
        </p>
      </section>

      {trainer.courses.length > 0 ? (
        <section className="bg-secondary/40 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading align="left" title={`Courses taught by ${trainer.name.split(" ")[0]}`} className="mx-0 max-w-none text-left" />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trainer.courses.map((c) => (
                <CourseCard key={c.id} course={{ ...c, trainer, category: null }} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
