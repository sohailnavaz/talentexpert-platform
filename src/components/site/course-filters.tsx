"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modeLabels } from "@/lib/format";
import type { Category } from "@/generated/prisma";

const MODES = Object.keys(modeLabels);
const SEARCH_DEBOUNCE_MS = 350;

export function CourseFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/courses?${params.toString()}`);
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => updateParam("q", search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-8 sm:w-[220px]"
        />
      </div>
      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v ?? "all")}
        items={{ all: "All categories", ...Object.fromEntries(categories.map((c) => [c.slug, c.name])) }}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("mode") ?? "all"}
        onValueChange={(v) => updateParam("mode", v ?? "all")}
        items={{ all: "All modes", ...Object.fromEntries(MODES.map((m) => [m, modeLabels[m]])) }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All modes</SelectItem>
          {MODES.map((m) => (
            <SelectItem key={m} value={m}>
              {modeLabels[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
