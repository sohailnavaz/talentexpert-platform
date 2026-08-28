import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getActiveTrainers } from "@/lib/data/content";
import { PageHero } from "@/components/site/page-hero";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import { resolveStorageUrlOrNull } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Trainers",
  description: "Meet the working professionals who teach every Talent Expert batch.",
};

export default async function TrainersPage() {
  const trainersRaw = await getActiveTrainers();
  const trainers = await Promise.all(
    trainersRaw.map(async (t) => ({ ...t, photoUrl: await resolveStorageUrlOrNull(t.photoUrl) }))
  );

  return (
    <>
      <PageHero
        eyebrow="Our trainers"
        title="Learn from people who've done the job"
        description="Every trainer at Talent Expert is a working (or recently working) professional, not a full-time presenter."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t) => (
            <RevealItem key={t.id}>
              <Link
                href={`/trainers/${t.slug}`}
                className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                  {t.photoUrl ? (
                    <Image src={t.photoUrl} alt={t.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 font-heading text-2xl font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-4 font-heading text-base font-semibold">{t.name}</p>
                {t.experienceYears ? (
                  <p className="text-xs text-muted-foreground">{t.experienceYears}+ years experience</p>
                ) : null}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {t.expertise.slice(0, 3).map((e) => (
                    <span key={e} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
                      {e}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{t._count.courses} course{t._count.courses === 1 ? "" : "s"}</p>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>
    </>
  );
}
