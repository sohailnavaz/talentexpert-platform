"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BookOpen, CalendarDays, Newspaper } from "lucide-react";

type SearchResult = {
  courses: { id: string; title: string; slug: string }[];
  batches: { id: string; courseTitle: string; courseSlug: string; startDate: string }[];
  posts: { id: string; title: string; slug: string }[];
};

const empty: SearchResult = { courses: [], batches: [], posts: [] };

export function SiteSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>(empty);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults(empty);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : empty))
        .then(setResults)
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search courses, batches and articles">
      <CommandInput
        placeholder="Search courses, batches, articles..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {query.trim().length < 2 ? "Type at least 2 characters..." : "No results found."}
        </CommandEmpty>
        {results.courses.length > 0 && (
          <CommandGroup heading="Courses">
            {results.courses.map((c) => (
              <CommandItem key={c.id} onSelect={() => go(`/courses/${c.slug}`)}>
                <BookOpen className="h-4 w-4" /> {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.batches.length > 0 && (
          <CommandGroup heading="Upcoming batches">
            {results.batches.map((b) => (
              <CommandItem key={b.id} onSelect={() => go(`/courses/${b.courseSlug}`)}>
                <CalendarDays className="h-4 w-4" />
                {b.courseTitle} — {new Date(b.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.posts.length > 0 && (
          <CommandGroup heading="Articles">
            {results.posts.map((p) => (
              <CommandItem key={p.id} onSelect={() => go(`/blog/${p.slug}`)}>
                <Newspaper className="h-4 w-4" /> {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
