"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function SessionRecordingRow({
  recordingUrl: initialRecordingUrl,
  isFreePreview: initialIsFreePreview,
  onSave,
}: {
  recordingUrl: string | null;
  isFreePreview: boolean;
  onSave: (data: { recordingUrl: string; isFreePreview: boolean }) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [recordingUrl, setRecordingUrl] = useState(initialRecordingUrl ?? "");
  const [isFreePreview, setIsFreePreview] = useState(initialIsFreePreview);

  return (
    <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-secondary/40 p-2">
      <Input
        value={recordingUrl}
        onChange={(e) => setRecordingUrl(e.target.value)}
        placeholder="Recording URL (YouTube, Vimeo, or direct video link)"
        className="h-8 text-xs"
      />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Checkbox checked={isFreePreview} onCheckedChange={(v) => setIsFreePreview(v === true)} />
          <PlayCircle className="h-3 w-3" /> Free intro preview
        </label>
        <Button
          type="button"
          size="xs"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await onSave({ recordingUrl, isFreePreview });
              toast.success("Session updated.");
              router.refresh();
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
