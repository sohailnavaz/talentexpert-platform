"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, PlayCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { saveUploadedFileAction } from "@/lib/actions/uploads";
import { SessionRecordingRow } from "@/components/shared/session-recording-row";
import { SessionDetailsEditor } from "@/components/shared/session-details-editor";
import { AddSessionForm } from "@/components/shared/add-session-form";
import {
  addMaterial,
  addSession,
  deleteMaterial,
  deleteSession,
  toggleMaterialFreePreview,
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
type MaterialItem = { id: string; title: string; fileUrl: string; isFreePreview: boolean };

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
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialFreePreview, setMaterialFreePreview] = useState(false);

  function handleAddMaterial() {
    if (!materialTitle.trim() || !materialFile) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("file", materialFile);
        const fileUrl = await saveUploadedFileAction(fd);
        await addMaterial(batchId, materialTitle.trim(), fileUrl, materialFreePreview);
        setMaterialTitle("");
        setMaterialFile(null);
        setMaterialFreePreview(false);
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
                parentPending={pending}
                onSave={(data) => updateSessionDetails(s.id, batchId, data)}
                onReminder={() =>
                  startTransition(async () => {
                    const count = await sendSessionReminderNow(s.id, batchId);
                    toast.success(`Reminder sent to ${count} student${count === 1 ? "" : "s"}.`);
                  })
                }
                onDelete={() => deleteSession(s.id, batchId)}
              />
              <SessionRecordingRow
                recordingUrl={s.recordingUrl}
                isFreePreview={s.isFreePreview}
                onSave={(data) => updateSessionRecording(s.id, batchId, data)}
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <AddSessionForm onAdd={(data) => addSession(batchId, data)} dailyEnabled={dailyEnabled} />
        </div>
      </div>

      <div>
        <h3 className="font-heading text-base font-semibold">Study materials</h3>
        <div className="mt-3 space-y-2">
          {materials.map((m) => (
            <div key={m.id} className="rounded-lg border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
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
              <label className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Checkbox
                  checked={m.isFreePreview}
                  disabled={pending}
                  onCheckedChange={(v) =>
                    startTransition(async () => {
                      await toggleMaterialFreePreview(m.id, batchId, v === true);
                      router.refresh();
                    })
                  }
                />
                <PlayCircle className="h-3 w-3" /> Free preview
              </label>
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
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Checkbox checked={materialFreePreview} onCheckedChange={(v) => setMaterialFreePreview(v === true)} />
            <PlayCircle className="h-3 w-3" /> Free preview
          </label>
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
