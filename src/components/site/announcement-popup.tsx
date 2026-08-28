"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PopupAnnouncement = { id: string; title: string; body: string };
const STORAGE_KEY = "ann-popup-seen";
const OPEN_DELAY_MS = 5000;

export function AnnouncementPopup({ announcements }: { announcements: PopupAnnouncement[] }) {
  const [queue, setQueue] = useState<PopupAnnouncement[]>([]);

  useEffect(() => {
    if (announcements.length === 0) return;
    const timer = setTimeout(() => {
      let seen: Record<string, boolean> = {};
      try {
        seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      } catch {
        seen = {};
      }
      setQueue(announcements.filter((a) => !seen[a.id]));
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [announcements]);

  function dismissCurrent() {
    setQueue((prev) => {
      const [current, ...rest] = prev;
      if (current) {
        try {
          const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
          seen[current.id] = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
        } catch {
          // ignore storage failures — worst case the popup reappears next visit
        }
      }
      return rest;
    });
  }

  const current = queue[0];

  return (
    <Dialog open={!!current} onOpenChange={(next) => { if (!next) dismissCurrent(); }}>
      <DialogContent className="sm:max-w-md">
        {current ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary">
                <Megaphone className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Announcement</span>
              </div>
              <DialogTitle className="font-heading text-lg">{current.title}</DialogTitle>
              <DialogDescription className="text-foreground/80">{current.body}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={dismissCurrent} className="w-full sm:w-auto">
                {queue.length > 1 ? `Got it — ${queue.length - 1} more` : "Got it"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
