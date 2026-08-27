"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminUser } from "@/lib/actions/admin-users";

const ROLES = {
  SUPER_ADMIN: "Super admin",
  COUNSELLOR: "Counsellor",
  COORDINATOR: "Coordinator",
  EDITOR: "Editor",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create admin"}
    </Button>
  );
}

export function NewAdminDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [state, formAction] = useActionState(createAdminUser, { ok: true });

  useEffect(() => {
    if (state.ok && state.message) {
      setJustCreated(true);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setJustCreated(false);
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" /> New admin
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">New admin user</DialogTitle>
          <DialogDescription>A temporary password will be generated — share it securely.</DialogDescription>
        </DialogHeader>
        {justCreated && state.ok && state.message ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm">{state.message}</p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-admin-name">Name</Label>
              <Input id="new-admin-name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-admin-email">Email</Label>
              <Input id="new-admin-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-admin-role">Role</Label>
              <Select name="role" defaultValue="COORDINATOR" items={ROLES}>
                <SelectTrigger id="new-admin-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
            <SubmitButton />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
