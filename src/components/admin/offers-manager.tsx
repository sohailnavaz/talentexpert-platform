"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { addOffer, deleteOffer } from "@/lib/actions/admin-batches";

type Offer = { id: string; label: string; type: string; value: number; startAt: string; endAt: string };

export function OffersManager({ batchId, offers }: { batchId: string; offers: Offer[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      try {
        await addOffer(batchId, formData);
        formRef.current?.reset();
        router.refresh();
      } catch {
        toast.error("Could not add offer.");
      }
    });
  }

  function handleDelete(offerId: string) {
    startTransition(async () => {
      try {
        await deleteOffer(offerId, batchId);
        router.refresh();
      } catch {
        toast.error("Could not delete offer.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {offers.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
          <span>
            {o.label}: {o.type === "PERCENT" ? `${o.value}%` : `₹${o.value}`} off ({formatDate(o.startAt)} – {formatDate(o.endAt)})
          </span>
          <Button variant="ghost" size="icon-sm" disabled={pending} onClick={() => handleDelete(o.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ))}

      <form ref={formRef} action={handleAdd} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Input name="label" placeholder="Early-bird" className="col-span-2 sm:col-span-1" required />
        <Select name="type" defaultValue="PERCENT" items={{ PERCENT: "% off", FLAT: "₹ off" }}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENT">% off</SelectItem>
            <SelectItem value="FLAT">₹ off</SelectItem>
          </SelectContent>
        </Select>
        <Input name="value" type="number" min={0} placeholder="15" required />
        <Input name="startAt" type="date" required />
        <Input name="endAt" type="date" required />
        <Button type="submit" disabled={pending} className="col-span-2 sm:col-span-5">
          <Plus className="h-4 w-4" /> Add offer
        </Button>
      </form>
    </div>
  );
}
