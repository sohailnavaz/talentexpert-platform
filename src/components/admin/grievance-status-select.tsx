"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateGrievanceStatus } from "@/lib/actions/grievances";

const STATUSES = { OPEN: "Open", IN_PROGRESS: "In progress", RESOLVED: "Resolved", CLOSED: "Closed" };

export function GrievanceStatusSelect({ grievanceId, status }: { grievanceId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      items={STATUSES}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          await updateGrievanceStatus(
            grievanceId,
            (v ?? status) as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
          );
          router.refresh();
        })
      }
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUSES).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
