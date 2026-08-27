import Link from "next/link";
import { CalendarDays, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR, modeLabels } from "@/lib/format";
import { computeEffectiveFee, getActiveOffer } from "@/lib/pricing";
import type { Batch, Course, Offer, Trainer } from "@/generated/prisma";

type BatchCardProps = {
  batch: Batch & { course: Course; trainer?: Trainer | null; offers: Offer[] };
};

export function BatchCard({ batch }: BatchCardProps) {
  const offer = getActiveOffer(batch.offers);
  const { effectiveFee } = computeEffectiveFee(Number(batch.fee), offer);
  const seatsLeft = Math.max(0, batch.seatTotal - batch.seatsFilled);
  const fillingFast = seatsLeft > 0 && seatsLeft <= Math.ceil(batch.seatTotal * 0.2);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
          {batch.status === "ONGOING" && <Badge className="bg-emerald-600">Ongoing</Badge>}
          {seatsLeft === 0 ? (
            <Badge variant="destructive">Sold out</Badge>
          ) : fillingFast ? (
            <Badge className="bg-amber-500 text-amber-950">Filling fast</Badge>
          ) : null}
          {offer ? <Badge className="bg-primary">Early-bird</Badge> : null}
        </div>
        <Link href={`/courses/${batch.course.slug}`} className="mt-2 block truncate font-heading text-base font-semibold hover:text-primary">
          {batch.course.title}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {formatDate(batch.startDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" /> {batch.startTime}
          </span>
          {batch.trainer ? (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {batch.trainer.name}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
        <div className="text-right">
          {offer ? (
            <span className="mr-2 text-sm text-muted-foreground line-through">
              {formatINR(batch.fee)}
            </span>
          ) : null}
          <span className="font-heading text-xl font-bold text-foreground">
            {formatINR(effectiveFee)}
          </span>
        </div>
        {seatsLeft === 0 ? (
          <Button disabled>Sold out</Button>
        ) : (
          <Button render={<Link href={`/checkout/${batch.id}`} />} nativeButton={false}>
            Enrol now
          </Button>
        )}
      </div>
    </div>
  );
}
