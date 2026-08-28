"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/generated/prisma";

const AUTO_ADVANCE_MS = 4500;

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 320) + 32;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onPointerDown={() => setPaused(true)}
        className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((t) => (
          <figure
            key={t.id}
            data-card
            tabIndex={0}
            className="flex w-80 shrink-0 snap-center flex-col rounded-2xl border border-border bg-card p-5 shadow-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 sm:w-96"
          >
            <div className="flex gap-0.5 text-[var(--brand-2)]">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold">
              {t.studentName}
              {t.courseName ? (
                <span className="block text-xs font-normal text-muted-foreground">{t.courseName}</span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous testimonial"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground",
            "transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next testimonial"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground",
            "transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
