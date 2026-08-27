"use client";

import { useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type Message = {
  id: string;
  authorRole: "STUDENT" | "TRAINER" | "ADMIN";
  body: string;
  createdAt: Date;
  student: { name: string } | null;
  trainer: { name: string } | null;
  admin: { name: string } | null;
};

const ROLE_LABEL: Record<Message["authorRole"], string> = {
  STUDENT: "Student",
  TRAINER: "Trainer",
  ADMIN: "Talent Expert Team",
};

function authorName(m: Message) {
  return m.student?.name ?? m.trainer?.name ?? m.admin?.name ?? ROLE_LABEL[m.authorRole];
}

export function BatchMessageThread({
  messages,
  postAction,
  viewerRole,
  emptyLabel = "No messages yet — start the conversation.",
}: {
  messages: Message[];
  postAction: (formData: FormData) => Promise<void>;
  viewerRole: Message["authorRole"];
  emptyLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await postAction(formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-border bg-secondary/30 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          messages.map((m) => {
            const mine = m.authorRole === viewerRole;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end text-right" : "items-start"}`}>
                <span className="text-xs font-medium text-muted-foreground">
                  {authorName(m)} · {ROLE_LABEL[m.authorRole]} · {formatDate(m.createdAt)}
                </span>
                <p
                  className={`mt-1 max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "border border-border bg-card"
                  }`}
                >
                  {m.body}
                </p>
              </div>
            );
          })
        )}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <Textarea name="body" placeholder="Write a message..." rows={2} required className="flex-1" />
        <Button type="submit" size="icon" disabled={pending} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
