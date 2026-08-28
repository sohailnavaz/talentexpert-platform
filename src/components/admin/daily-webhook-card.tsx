"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { registerDailyWebhookAction } from "@/lib/actions/admin-settings";

export function DailyWebhookCard() {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Live class analytics</CardTitle>
        <CardDescription>
          Registers a webhook with Daily.co so join/leave events populate viewer analytics on the Live
          Classes page. Needs a real Daily account with <code>DAILY_API_KEY</code> and{" "}
          <code>DAILY_WEBHOOK_SECRET</code> configured first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await registerDailyWebhookAction();
              if (result.ok) toast.success(result.message);
              else toast.error(result.message);
            })
          }
        >
          {pending ? "Registering..." : "Register Daily webhook"}
        </Button>
      </CardContent>
    </Card>
  );
}
