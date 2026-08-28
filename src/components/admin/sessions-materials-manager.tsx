"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Download, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { saveUploadedFileAction } from "@/lib/actions/uploads";
import { SessionRecordingRow } from "@/components/shared/session-recording-row";
import {
  addMaterial,
  addSession,
  deleteMaterial,
  deleteSession,
  updateSessionDetails,
  updateSessionRecording,
} from "@/lib/actions/admin-batches";
import { sendSessionReminderNow } from "@/lib/actions/reminders";

type SessionItem = {
  id: string;
  topic: string;
  date: string;
  time: string;
  joinUrl: string;
  roomName: string | null;
  recordingUrl: string | null;
  isFreePreview: boolean;
};
type MaterialItem = { id: string; title: string; fileUrl: string };

function SessionDetailsEditor({
  session,
  batchId,
  parentPending,
  onReminder,
  onDelete,
}: {
  session: SessionItem;
  batchId: string;
  parentPending: boolean;
  onReminder: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
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
          <Button variant="ghost" size="icon-sm" disabled={parentPending} title="Email enrolled students a reminder now" onClick={onReminder}>
            <BellRing className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={parentPending} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
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
              await updateSessionDetails(session.id, batchId, { topic, date, time, joinUrl });
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

export function SessionsMaterialsManager({
  batchId,
  sessions,
  materials,
  dailyEnabled,
}: {
  batchId: string;
  sessions: SessionItem[];
  materials: MaterialItem[];
  dailyEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const sessionFormRef = useRef<HTMLFormElement>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  function handleAddSession(formData: FormData) {
    const topic = String(formData.get("topic") ?? "");
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    const joinUrl = String(formData.get("joinUrl") ?? "");
    if (!topic || !date || !time || (!dailyEnabled && !joinUrl)) return;
    startTransition(async () => {
      try {
        await addSession(batchId, { topic, date, time, joinUrl });
        sessionFormRef.current?.reset();
        router.refresh();
      } catch {
        toast.error("Could not add session.");
      }
    });
  }

  function handleAddMaterial() {
    if (!materialTitle.trim() || !materialFile) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("file", materialFile);
        const fileUrl = await saveUploadedFileAction(fd);
        await addMaterial(batchId, materialTitle.trim(), fileUrl);
        setMaterialTitle("");
        setMaterialFile(null);
        router.refresh();
      } catch {
        toast.error("Could not upload material.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h3 className="font-heading text-base font-semibold">Session links</h3>
        <div className="mt-3 space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-lg border border-border px-3 py-2 text-sm">
              <SessionDetailsEditor
                session={s}
                batchId={batchId}
                parentPending={pending}
                onReminder={() =>
                  startTransition(async () => {
                    const count = await sendSessionReminderNow(s.id, batchId);
                    toast.success(`Reminder sent to ${count} student${count === 1 ? "" : "s"}.`);
                  })
                }
                onDelete={() => startTransition(async () => { await deleteSession(s.id, batchId); router.refresh(); })}
              />
              <SessionRecordingRow
                recordingUrl={s.recordingUrl}
                isFreePreview={s.isFreePreview}
                onSave={(data) => updateSessionRecording(s.id, batchId, data)}
              />
            </div>
          ))}
        </div>
        <form ref={sessionFormRef} action={handleAddSession} className="mt-3 space-y-2">
          <Input name="topic" placeholder="Session topic" required />
          <div className="grid grid-cols-2 gap-2">
            <Input name="date" type="date" required />
            <Input name="time" placeholder="7:00 PM IST" required />
          </div>
          {dailyEnabled ? (
            <p className="rounded-md bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              A video room will be created automatically for this session.
            </p>
          ) : (
            <Input name="joinUrl" placeholder="https://meet.google.com/..." required />
          )}
          <Button type="submit" disabled={pending} className="w-full">
            <Plus className="h-4 w-4" /> Add session
          </Button>
        </form>
      </div>

      <div>
        <h3 className="font-heading text-base font-semibold">Study materials</h3>
        <div className="mt-3 space-y-2">
          {materials.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <a href={m.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 truncate hover:text-primary">
                <Download className="h-3.5 w-3.5 shrink-0" /> {m.title}
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => startTransition(async () => { await deleteMaterial(m.id, batchId); router.refresh(); })}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Material title"
            value={materialTitle}
            onChange={(e) => setMaterialTitle(e.target.value)}
          />
          <Input type="file" onChange={(e) => setMaterialFile(e.target.files?.[0] ?? null)} />
          <Button
            type="button"
            disabled={pending || !materialTitle.trim() || !materialFile}
            onClick={handleAddMaterial}
            className="w-full"
          >
            <Plus className="h-4 w-4" /> Upload material
          </Button>
        </div>
      </div>
    </div>
  );
}
