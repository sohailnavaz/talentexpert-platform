"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { saveUploadedFileAction } from "@/lib/actions/uploads";
import {
  addMaterial,
  addSession,
  deleteMaterial,
  deleteSession,
} from "@/lib/actions/admin-batches";

type SessionItem = { id: string; topic: string; date: string; time: string; joinUrl: string };
type MaterialItem = { id: string; title: string; fileUrl: string };

export function SessionsMaterialsManager({
  batchId,
  sessions,
  materials,
}: {
  batchId: string;
  sessions: SessionItem[];
  materials: MaterialItem[];
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
    if (!topic || !date || !time || !joinUrl) return;
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
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="truncate">
                {s.topic} — {formatDate(s.date)} {s.time}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => startTransition(async () => { await deleteSession(s.id, batchId); router.refresh(); })}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <form ref={sessionFormRef} action={handleAddSession} className="mt-3 space-y-2">
          <Input name="topic" placeholder="Session topic" required />
          <div className="grid grid-cols-2 gap-2">
            <Input name="date" type="date" required />
            <Input name="time" placeholder="7:00 PM IST" required />
          </div>
          <Input name="joinUrl" placeholder="https://meet.google.com/..." required />
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
