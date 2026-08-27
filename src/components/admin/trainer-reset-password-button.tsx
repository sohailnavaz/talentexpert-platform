"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetTrainerPassword } from "@/lib/actions/admin-trainers";

export function TrainerResetPasswordButton({ trainerId }: { trainerId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await resetTrainerPassword(trainerId);
          if (result) {
            toast.success(`New temporary password: ${result.tempPassword}`, { duration: 15000 });
          } else {
            toast.error("Could not reset password.");
          }
        })
      }
    >
      Reset password
    </Button>
  );
}
