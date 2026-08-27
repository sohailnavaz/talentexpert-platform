"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { BlogPost } from "@/generated/prisma";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function BlogPostForm({
  action,
  post,
  submitLabel = "Save post",
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  post?: BlogPost;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={post?.title} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" rows={10} defaultValue={post?.content} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={post?.category ?? ""} placeholder="career-advice" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={post?.status ?? "DRAFT"} items={{ DRAFT: "Draft", PUBLISHED: "Published" }}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coverFile">Cover image</Label>
        <Input id="coverFile" name="coverFile" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">Or paste an image URL below instead.</p>
        <Input name="coverImageUrl" placeholder="https://..." defaultValue={post?.coverImageUrl ?? ""} />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
