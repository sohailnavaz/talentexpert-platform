import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { NewCouponDialog } from "@/components/admin/new-coupon-dialog";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";

export const metadata: Metadata = { title: "Offers & Coupons" };

export default async function AdminOffersPage() {
  const [coupons, offers] = await Promise.all([
    db.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    db.offer.findMany({
      where: { endAt: { gte: new Date() } },
      orderBy: { endAt: "asc" },
      include: { batch: { select: { id: true, course: { select: { title: true } } } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Offers & Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">Site-wide coupon codes and live batch offers</p>
        </div>
        <NewCouponDialog />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.code}</TableCell>
                <TableCell>{c.type === "PERCENT" ? `${Number(c.value)}%` : `₹${Number(c.value)}`}</TableCell>
                <TableCell>
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </TableCell>
                <TableCell>{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Disabled"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <CouponRowActions id={c.id} active={c.active} />
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Live batch offers</h2>
          <p className="text-sm text-muted-foreground">
            Per-batch discounts, managed from each batch&apos;s edit page.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.batch.course.title}</TableCell>
                  <TableCell>{o.label}</TableCell>
                  <TableCell>{o.type === "PERCENT" ? `${Number(o.value)}%` : `₹${Number(o.value)}`}</TableCell>
                  <TableCell>{formatDate(o.endAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/batches/${o.batch.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                      Edit batch
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No live batch offers right now.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
