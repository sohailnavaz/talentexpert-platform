"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getVideoUploadUrl } from "@/lib/actions/uploads";

const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/quicktime,video/x-matroska";
const MAX_VIDEO_BYTES = 3 * 1024 * 1024 * 1024; // 3GB — a single PUT beyond this risks failing on a flaky connection.

function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(file);
  });
}

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("That file is over 3GB — please upload a shorter or more compressed recording.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadProgress(0);
    (async () => {
      try {
        const { uploadUrl, publicUrl } = await getVideoUploadUrl(file.name, file.type);
        await uploadWithProgress(uploadUrl, file, setUploadProgress);
        setRecordingUrl(publicUrl);
        toast.success("Video uploaded — click Save to publish it.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    })();
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-secondary/40 p-2">
      <Input
        value={recordingUrl}
        onChange={(e) => setRecordingUrl(e.target.value)}
        placeholder="Recording URL (YouTube, Vimeo, or direct video link)"
        className="h-8 text-xs"
      />
      <div className="flex items-center gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={uploadProgress !== null}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3 w-3" />
          {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : "Or upload a video file"}
        </Button>
        {uploadProgress !== null ? (
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        ) : null}
      </div>
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
