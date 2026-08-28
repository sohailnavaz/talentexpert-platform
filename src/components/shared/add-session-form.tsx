"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AddSessionForm({
  onAdd,
  dailyEnabled,
}: {
  onAdd: (data: { topic: string; date: string; time: string; joinUrl: string }) => Promise<void>;
  dailyEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAddSession(formData: FormData) {
    const topic = String(formData.get("topic") ?? "");
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    const joinUrl = String(formData.get("joinUrl") ?? "");
    if (!topic || !date || !time || (!dailyEnabled && !joinUrl)) return;
    startTransition(async () => {
      try {
        await onAdd({ topic, date, time, joinUrl });
        toast.success("Session added.");
        formRef.current?.reset();
        router.refresh();
      } catch {
        toast.error("Could not add session.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleAddSession} className="space-y-2">
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
        <Input name="joinUrl" placeholder="Zoom / Google Meet / Teams link" required />
      )}
      <Button type="submit" disabled={pending} className="w-full">
        <Plus className="h-4 w-4" /> Add session
      </Button>
    </form>
  );
}
