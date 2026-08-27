"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { toggleCouponActive, deleteCoupon } from "@/lib/actions/admin-coupons";

export function CouponRowActions({ id, active }: { id: string; active: boolean }) {
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
            await toggleCouponActive(id);
            toast.success(active ? "Coupon deactivated." : "Coupon activated.");
            router.refresh();
          })
        }
      >
        {active ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDeleteButton action={deleteCoupon.bind(null, id)} description="Delete this coupon permanently?" />
    </div>
  );
}
