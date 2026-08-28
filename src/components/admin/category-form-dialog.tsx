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
import { createCategory, updateCategory } from "@/lib/actions/admin-categories";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Category } from "@/generated/prisma";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function CategoryFormDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false);
  const action = category
    ? (updateCategory.bind(null, category.id) as (state: AdminFormState, formData: FormData) => Promise<AdminFormState>)
    : createCategory;
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
          category ? (
            <Button variant="ghost" size="icon-sm" aria-label="Rename category" />
          ) : (
            <Button />
          )
        }
      >
        {category ? <Pencil className="h-4 w-4" /> : (
          <>
            <Plus className="h-4 w-4" /> New category
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">{category ? "Rename category" : "New category"}</DialogTitle>
          <DialogDescription>Used to group and filter courses on the site.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={category?.name} placeholder="Data Science" required />
          </div>
          {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
          <SubmitButton label={category ? "Save changes" : "Add category"} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
