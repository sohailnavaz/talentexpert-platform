"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS: Record<string, string> = {
  desc: "Newest first",
  asc: "Oldest first",
};

export function AuditLogFilters({
  entityTypes,
  admins,
}: {
  entityTypes: string[];
  admins: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/admin/audit-log?${params.toString()}`);
  }

  const hasFilters = ["entityType", "adminId", "from", "to"].some((k) => searchParams.get(k));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        value={searchParams.get("entityType") ?? "all"}
        onValueChange={(v) => updateParam("entityType", v ?? "all")}
        items={{ all: "All entities", ...Object.fromEntries(entityTypes.map((t) => [t, t])) }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Entity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entities</SelectItem>
          {entityTypes.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("adminId") ?? "all"}
        onValueChange={(v) => updateParam("adminId", v ?? "all")}
        items={{ all: "All admins", ...Object.fromEntries(admins.map((a) => [a.id, a.name])) }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Admin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All admins</SelectItem>
          {admins.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => updateParam("from", e.target.value)}
        className="w-full sm:w-[160px]"
        aria-label="From date"
      />
      <Input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => updateParam("to", e.target.value)}
        className="w-full sm:w-[160px]"
        aria-label="To date"
      />

      <Select
        value={searchParams.get("sort") ?? "desc"}
        onValueChange={(v) => updateParam("sort", v ?? "desc")}
        items={SORT_OPTIONS}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/audit-log")}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
