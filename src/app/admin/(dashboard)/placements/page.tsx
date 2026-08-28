import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { PlacementFormDialog } from "@/components/admin/placement-form-dialog";
import { PlacementRowActions } from "@/components/admin/placement-row-actions";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Placements" };

const STATUS_OPTIONS = { active: "Visible", hidden: "Hidden" };

export default async function AdminPlacementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.PlacementWhereInput = {
    ...(q
      ? {
          OR: [
            { studentName: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { role: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { active: true } : status === "hidden" ? { active: false } : {}),
  };

  const placements = await db.placement.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Placements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the student placement success wall shown on the homepage and placements page.
          </p>
        </div>
        <PlacementFormDialog />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by student, company, or role" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All" />
      </div>

      <div className="flex flex-col gap-3">
        {placements.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{p.studentName}</p>
                <span className="text-xs text-muted-foreground">
                  {p.role} at {p.company}
                </span>
                {!p.active ? <Badge variant="secondary">Hidden</Badge> : null}
              </div>
              {p.batch ? <p className="mt-1 text-xs text-muted-foreground">Batch: {p.batch}</p> : null}
            </div>
            <PlacementRowActions placement={p} />
          </div>
        ))}
        {placements.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No placements yet.</p>
        ) : null}
      </div>
    </div>
  );
}
