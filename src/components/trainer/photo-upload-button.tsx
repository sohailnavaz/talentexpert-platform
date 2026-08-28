"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { uploadTrainerPhoto, clearTrainerPhoto } from "@/lib/actions/trainer-profile";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

export function TrainerPhotoUploadButton({ hasCustomPhoto }: { hasCustomPhoto: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(uploadTrainerPhoto, initialState);
  const [removing, startRemoving] = useTransition();

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="absolute -right-1 -bottom-1 flex items-center gap-1">
      <form ref={formRef} action={formAction}>
        <label
          htmlFor="trainer-photo-upload-input"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          aria-label="Change photo"
        >
          <Camera className="h-3.5 w-3.5" />
        </label>
        <input
          id="trainer-photo-upload-input"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />
      </form>
      {hasCustomPhoto ? (
        <button
          type="button"
          onClick={() => startRemoving(async () => {
            await clearTrainerPhoto();
            toast.success("Photo removed.");
          })}
          disabled={removing}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          aria-label="Remove photo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
