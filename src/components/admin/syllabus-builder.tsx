"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addModule, addTopic, deleteModule, deleteTopic } from "@/lib/actions/admin-courses";

type Topic = { id: string; title: string };
type Module = { id: string; title: string; topics: Topic[] };

export function SyllabusBuilder({ courseId, modules }: { courseId: string; modules: Module[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newTopicTitles, setNewTopicTitles] = useState<Record<string, string>>({});

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch {
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {modules.map((m) => (
        <div key={m.id} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{m.title}</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => run(() => deleteModule(m.id, courseId))}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {m.topics.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t.title}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => run(() => deleteTopic(t.id, courseId))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add a topic"
              value={newTopicTitles[m.id] ?? ""}
              onChange={(e) => setNewTopicTitles((prev) => ({ ...prev, [m.id]: e.target.value }))}
              className="h-8"
            />
            <Button
              size="sm"
              disabled={pending || !newTopicTitles[m.id]?.trim()}
              onClick={() => {
                const title = newTopicTitles[m.id]?.trim();
                if (!title) return;
                run(async () => {
                  await addTopic(m.id, courseId, title);
                  setNewTopicTitles((prev) => ({ ...prev, [m.id]: "" }));
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="New module title (e.g. Part I — Fundamentals)"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
        />
        <Button
          disabled={pending || !newModuleTitle.trim()}
          onClick={() => {
            const title = newModuleTitle.trim();
            if (!title) return;
            run(async () => {
              await addModule(courseId, title);
              setNewModuleTitle("");
            });
          }}
        >
          <Plus className="h-4 w-4" /> Add module
        </Button>
      </div>
    </div>
  );
}
