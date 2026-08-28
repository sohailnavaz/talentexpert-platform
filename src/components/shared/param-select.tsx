"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ParamSelect({
  paramKey,
  options,
  allLabel,
  placeholder,
  className,
}: {
  paramKey: string;
  options: Record<string, string>;
  allLabel: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      value={searchParams.get(paramKey) ?? "all"}
      onValueChange={(v) => updateParam(v ?? "all")}
      items={{ all: allLabel, ...options }}
    >
      <SelectTrigger className={cn("w-full sm:w-[170px]", className)}>
        <SelectValue placeholder={placeholder ?? allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {Object.entries(options).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
