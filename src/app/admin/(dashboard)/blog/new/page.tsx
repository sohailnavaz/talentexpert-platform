import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { BackLink } from "@/components/admin/back-link";
import { createPost } from "@/lib/actions/admin-blog";

export const metadata: Metadata = { title: "Write Post" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/blog" label="Back to blog" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Write Post</h1>
      </div>
      <BlogPostForm action={createPost} submitLabel="Create post" />
    </div>
  );
}
