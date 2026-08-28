"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createPlacement, updatePlacement } from "@/lib/actions/admin-placements";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Placement } from "@/generated/prisma";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function PlacementFormDialog({ placement }: { placement?: Placement }) {
  const [open, setOpen] = useState(false);
  const action = placement
    ? (updatePlacement.bind(null, placement.id) as (state: AdminFormState, formData: FormData) => Promise<AdminFormState>)
    : createPlacement;
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        setOpen(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          placement ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit placement" />
          ) : (
            <Button />
          )
        }
      >
        {placement ? <Pencil className="h-4 w-4" /> : (
          <>
            <Plus className="h-4 w-4" /> New placement
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{placement ? "Edit placement" : "New placement"}</DialogTitle>
          <DialogDescription>Shown on the homepage and placements-page success wall.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Student name</Label>
              <Input id="studentName" name="studentName" defaultValue={placement?.studentName} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch">Batch (optional)</Label>
              <Input id="batch" name="batch" placeholder="Jan 2026 Weekend" defaultValue={placement?.batch ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={placement?.company} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Frontend Developer" defaultValue={placement?.role} required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">Student photo URL (optional)</Label>
              <Input id="photoUrl" name="photoUrl" placeholder="https://..." defaultValue={placement?.photoUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyLogoUrl">Company logo URL (optional)</Label>
              <Input
                id="companyLogoUrl"
                name="companyLogoUrl"
                placeholder="https://..."
                defaultValue={placement?.companyLogoUrl ?? ""}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="active" defaultChecked={placement?.active ?? true} />
            Active (visible on the site)
          </label>
          {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
          <SubmitButton label={placement ? "Save changes" : "Add placement"} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
