"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modeLabels } from "@/lib/format";
import type { Category } from "@/generated/prisma";

const MODES = Object.keys(modeLabels);

export function CourseFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/courses?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v)}
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

      <Select value={searchParams.get("mode") ?? "all"} onValueChange={(v) => updateParam("mode", v)}>
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
