import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR, modeLabels } from "@/lib/format";
import type { Category, Course, Trainer } from "@/generated/prisma";

type CourseCardProps = {
  course: Course & { category?: Category | null; trainer?: Trainer | null };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-brand-2/10">
            <Layers className="h-10 w-10 text-primary/50" />
          </div>
        )}
        {course.category ? (
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground shadow-sm">
            {course.category.name}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          {course.modes.slice(0, 2).map((m) => (
            <Badge key={m} variant="secondary" className="text-[11px]">
              {modeLabels[m] ?? m}
            </Badge>
          ))}
        </div>
        <h3 className="mt-2.5 line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {course.shortDescription}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {course.durationText ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.durationText}
            </span>
          ) : null}
          {course.trainer ? <span>By {course.trainer.name}</span> : null}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-heading text-lg font-bold text-foreground">
            {formatINR(course.regularFee)}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            View syllabus
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
