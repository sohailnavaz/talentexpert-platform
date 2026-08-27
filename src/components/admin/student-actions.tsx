"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetStudentPassword, toggleStudentActive } from "@/lib/actions/admin-students";

export function StudentActions({ studentId, active }: { studentId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const tempPassword = await resetStudentPassword(studentId);
            toast.success(`Password reset. Temporary password: ${tempPassword}`);
          })
        }
      >
        Reset password
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleStudentActive(studentId, !active);
            toast.success(active ? "Account deactivated." : "Account activated.");
            router.refresh();
          })
        }
      >
        {active ? "Deactivate account" : "Activate account"}
      </Button>
    </div>
  );
}
