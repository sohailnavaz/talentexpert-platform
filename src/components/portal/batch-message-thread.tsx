"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Paperclip, Send, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useBatchMessages } from "@/hooks/use-batch-messages";
import type { BatchMessageEvent } from "@/lib/actions/batch-messages";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function MessageAttachment({ url, name }: { url: string; name: string | null }) {
  const isImage = IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-1.5 block max-w-[220px]">
        <Image
          src={url}
          alt={name ?? "Attachment"}
          width={220}
          height={220}
          className="rounded-lg border border-border object-cover"
        />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-1.5 flex max-w-[220px] items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-2 text-xs hover:bg-accent"
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{name ?? "Attachment"}</span>
    </a>
  );
}

const ROLE_LABEL: Record<BatchMessageEvent["authorRole"], string> = {
  STUDENT: "Student",
  TRAINER: "Trainer",
  ADMIN: "Talent Expert Team",
};

export function BatchMessageThread({
  batchId,
  initialMessages,
  postAction,
  viewerRole,
  emptyLabel = "No messages yet — start the conversation.",
}: {
  batchId: string;
  initialMessages: BatchMessageEvent[];
  postAction: (formData: FormData) => Promise<void>;
  viewerRole: BatchMessageEvent["authorRole"];
  emptyLabel?: string;
}) {
  const { messages, refresh } = useBatchMessages(batchId, initialMessages);
  const [pending, startTransition] = useTransition();
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await postAction(formData);
      formRef.current?.reset();
      setAttachmentName(null);
      await refresh();
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
                  {m.authorName} · {ROLE_LABEL[m.authorRole]} · {formatDate(m.createdAt)}
                </span>
                <div
                  className={`mt-1 max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "border border-border bg-card"
                  }`}
                >
                  {m.body ? <p>{m.body}</p> : null}
                  {m.attachmentUrl ? <MessageAttachment url={m.attachmentUrl} name={m.attachmentName} /> : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {attachmentName ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" /> {attachmentName}
          </span>
        ) : null}
        <form ref={formRef} action={handleSubmit} className="flex items-end gap-2">
          <Textarea name="body" placeholder="Write a message..." rows={2} className="flex-1" />
          <label
            htmlFor="batch-message-attachment"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </label>
          <input
            id="batch-message-attachment"
            name="attachment"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)}
          />
          <Button type="submit" size="icon" disabled={pending} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
