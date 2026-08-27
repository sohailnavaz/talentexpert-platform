"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { manualEnrolStudent } from "@/lib/actions/admin-students";

export function ManualEnrolForm({
  studentId,
  batches,
}: {
  studentId: string;
  batches: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await manualEnrolStudent(formData);
        toast.success("Student enrolled.");
        formRef.current?.reset();
        router.refresh();
      } catch {
        toast.error("Could not enrol student.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="studentId" value={studentId} />
      <Select name="batchId" items={Object.fromEntries(batches.map((b) => [b.id, b.label]))}>
        <SelectTrigger className="w-full sm:w-80">
          <SelectValue placeholder="Select a batch" />
        </SelectTrigger>
        <SelectContent>
          {batches.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={pending}>
        {pending ? "Enrolling..." : "Enrol manually"}
      </Button>
    </form>
  );
}
