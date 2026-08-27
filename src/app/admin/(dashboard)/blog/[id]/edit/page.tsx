import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { BackLink } from "@/components/admin/back-link";
import { updatePost } from "@/lib/actions/admin-blog";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/blog" label="Back to blog" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Post</h1>
        <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
      </div>
      <BlogPostForm action={updatePostWithId} post={post} />
    </div>
  );
}
