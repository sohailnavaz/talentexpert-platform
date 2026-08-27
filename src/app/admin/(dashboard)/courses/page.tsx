import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/format";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteCourse } from "@/lib/actions/admin-courses";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { batches: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} total</p>
        </div>
        <Button render={<Link href="/admin/courses/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="max-w-xs truncate font-medium">{c.title}</TableCell>
                <TableCell>{c.category?.name ?? "—"}</TableCell>
                <TableCell>{formatINR(c.regularFee)}</TableCell>
                <TableCell>{c._count.batches}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "PUBLISHED" ? "default" : "secondary"}>{c.status}</Badge>
                </TableCell>
                <TableCell>{c.featured ? "★" : ""}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/courses/${c.id}/edit`} />}
                      nativeButton={false}
                    >
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteCourse.bind(null, c.id)}
                      description={`Delete "${c.title}"? This also removes its modules, topics and batches.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No courses yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
