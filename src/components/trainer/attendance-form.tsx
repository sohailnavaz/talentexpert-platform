"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function AttendanceForm({
  action,
  students,
}: {
  action: (formData: FormData) => Promise<void>;
  students: { enrollmentId: string; name: string; present: boolean }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
      toast.success("Attendance saved.");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        {students.map((s) => (
          <label key={s.enrollmentId} className="flex items-center gap-2 text-sm">
            <Checkbox name={`present_${s.enrollmentId}`} defaultChecked={s.present} />
            {s.name}
          </label>
        ))}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save attendance"}
      </Button>
    </form>
  );
}
