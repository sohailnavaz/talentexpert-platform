"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { createCoupon } from "@/lib/actions/admin-coupons";

const TYPES = { PERCENT: "Percentage off", FLAT: "Flat amount off" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create coupon"}
    </Button>
  );
}

export function NewCouponDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createCoupon, { ok: true });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" /> New coupon
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">New coupon</DialogTitle>
          <DialogDescription>Coupons apply site-wide at checkout when a student enters the code.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-code">Code</Label>
            <Input id="coupon-code" name="code" placeholder="WELCOME10" required className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-type">Type</Label>
              <Select name="type" defaultValue="PERCENT" items={TYPES}>
                <SelectTrigger id="coupon-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-value">Value</Label>
              <Input id="coupon-value" name="value" type="number" min="1" step="0.01" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-expiresAt">Expires (optional)</Label>
              <Input id="coupon-expiresAt" name="expiresAt" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-usageLimit">Usage limit (optional)</Label>
              <Input id="coupon-usageLimit" name="usageLimit" type="number" min="1" placeholder="Unlimited" />
            </div>
          </div>
          {!state.ok && state.message ? <p className="text-xs text-destructive">{state.message}</p> : null}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
