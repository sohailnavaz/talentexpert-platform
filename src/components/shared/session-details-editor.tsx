"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type SessionItem = {
  id: string;
  topic: string;
  date: string;
  time: string;
  joinUrl: string;
  roomName: string | null;
};

export function SessionDetailsEditor({
  session,
  onSave,
  onDelete,
  onReminder,
  parentPending,
}: {
  session: SessionItem;
  onSave: (data: { topic: string; date: string; time: string; joinUrl?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onReminder?: () => void;
  parentPending?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [topic, setTopic] = useState(session.topic);
  const [date, setDate] = useState(session.date.slice(0, 10));
  const [time, setTime] = useState(session.time);
  const [joinUrl, setJoinUrl] = useState(session.joinUrl);
  const hasRoom = Boolean(session.roomName);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">
          {session.topic} — {formatDate(session.date)} {session.time}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} title="Edit session">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {onReminder ? (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={parentPending}
              title="Email enrolled students a reminder now"
              onClick={onReminder}
            >
              <BellRing className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={parentPending || deletePending}
              onClick={() =>
                startDeleteTransition(async () => {
                  await onDelete();
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} className="h-8 text-xs" />
      <div className="grid grid-cols-2 gap-1.5">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" />
        <Input value={time} onChange={(e) => setTime(e.target.value)} className="h-8 text-xs" />
      </div>
      {hasRoom ? (
        <p className="rounded-md bg-secondary/40 px-2 py-1.5 text-[0.7rem] text-muted-foreground">
          This session has an auto-created video room — its link can&apos;t be edited here.
        </p>
      ) : (
        <Input
          value={joinUrl}
          onChange={(e) => setJoinUrl(e.target.value)}
          placeholder="https://meet.google.com/..."
          className="h-8 text-xs"
        />
      )}
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="xs"
          disabled={pending || !topic || !date || !time}
          onClick={() =>
            startTransition(async () => {
              await onSave({ topic, date, time, joinUrl });
              toast.success("Session updated.");
              setEditing(false);
              router.refresh();
            })
          }
        >
          Save
        </Button>
        <Button type="button" size="xs" variant="ghost" disabled={pending} onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
