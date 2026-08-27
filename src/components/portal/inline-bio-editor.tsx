"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateBio } from "@/lib/actions/profile";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

export function InlineBioEditor({ bio }: { bio: string | null }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateBio, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      setEditing(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="mt-1.5 max-w-md space-y-2">
        <Textarea
          name="bio"
          defaultValue={bio ?? ""}
          rows={2}
          maxLength={280}
          autoFocus
          placeholder="A short line about your goals"
          className="text-sm"
        />
        <div className="flex items-center gap-2">
          <SaveButton />
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-1.5 flex max-w-md items-start justify-center gap-1.5 sm:justify-start">
      <p className="text-sm text-foreground/80">
        {bio ?? "No bio yet — tell us a bit about your learning goals."}
      </p>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
        aria-label="Edit bio"
      >
        <PenLine className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
