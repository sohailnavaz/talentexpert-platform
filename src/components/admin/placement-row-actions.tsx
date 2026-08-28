"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { PlacementFormDialog } from "@/components/admin/placement-form-dialog";
import { togglePlacementActive, deletePlacement } from "@/lib/actions/admin-placements";
import type { Placement } from "@/generated/prisma";

export function PlacementRowActions({ placement }: { placement: Placement }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await togglePlacementActive(placement.id);
            toast.success(placement.active ? "Placement hidden." : "Placement shown.");
            router.refresh();
          })
        }
      >
        {placement.active ? "Hide" : "Show"}
      </Button>
      <PlacementFormDialog placement={placement} />
      <ConfirmDeleteButton
        action={deletePlacement.bind(null, placement.id)}
        description="Permanently delete this placement record?"
      />
    </div>
  );
}
