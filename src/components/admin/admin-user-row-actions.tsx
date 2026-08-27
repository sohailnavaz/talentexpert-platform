"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { setAdminRole, toggleAdminActive, deleteAdminUser, resetAdminPassword } from "@/lib/actions/admin-users";

const ROLES = {
  SUPER_ADMIN: "Super admin",
  COUNSELLOR: "Counsellor",
  COORDINATOR: "Coordinator",
  EDITOR: "Editor",
};

export function AdminUserRowActions({
  id,
  role,
  active,
  isSelf,
}: {
  id: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">This is you</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Select
        value={role}
        items={ROLES}
        disabled={pending}
        onValueChange={(v) =>
          startTransition(async () => {
            await setAdminRole(id, v as never);
            router.refresh();
          })
        }
      >
        <SelectTrigger size="sm" className="w-40">
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
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleAdminActive(id);
            router.refresh();
          })
        }
      >
        {active ? "Deactivate" : "Activate"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const { tempPassword } = await resetAdminPassword(id);
            toast.success(`New temporary password: ${tempPassword}`, { duration: 15000 });
          })
        }
      >
        Reset password
      </Button>
      <ConfirmDeleteButton action={deleteAdminUser.bind(null, id)} description="Remove this admin's access permanently?" />
    </div>
  );
}
