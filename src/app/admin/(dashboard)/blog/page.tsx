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
import { formatDate } from "@/lib/format";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deletePost } from "@/lib/actions/admin-blog";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { PostStatus, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Blog" };

const STATUS_OPTIONS = { DRAFT: "Draft", PUBLISHED: "Published" };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;
  const categoryRows = await db.blogPost.findMany({
    where: { category: { not: null } },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categories = categoryRows.map((r) => r.category!).filter(Boolean);

  const where: Prisma.BlogPostWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status && status in STATUS_OPTIONS ? { status: status as PostStatus } : {}),
    ...(category ? { category } : {}),
  };

  const posts = await db.blogPost.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} total</p>
        </div>
        <Button render={<Link href="/admin/blog/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Write Post
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by title" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
        {categories.length > 0 ? (
          <ParamSelect
            paramKey="category"
            options={Object.fromEntries(categories.map((c) => [c, c]))}
            allLabel="All categories"
          />
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-sm truncate font-medium">{p.title}</TableCell>
                <TableCell>{p.category ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(p.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/blog/${p.id}/edit`} />} nativeButton={false}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton action={deletePost.bind(null, p.id)} description={`Delete "${p.title}"?`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No posts yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
