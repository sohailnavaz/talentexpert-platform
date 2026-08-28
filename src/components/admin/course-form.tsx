"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modeLabels } from "@/lib/format";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Category, Course, Trainer } from "@/generated/prisma";

type CourseFormValues = Omit<Course, "regularFee"> & { regularFee: number };

const MODES = Object.keys(modeLabels);

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function CourseForm({
  action,
  categories,
  trainers,
  course,
  submitLabel = "Save course",
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: Category[];
  trainers: Trainer[];
  course?: CourseFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Course title</Label>
        <Input id="title" name="title" defaultValue={course?.title} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={course?.shortDescription}
          rows={2}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Full description</Label>
        <Textarea id="description" name="description" defaultValue={course?.description} rows={6} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            name="categoryId"
            defaultValue={course?.categoryId ?? undefined}
            items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
          >
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trainerId">Trainer</Label>
          <Select
            name="trainerId"
            defaultValue={course?.trainerId ?? undefined}
            items={Object.fromEntries(trainers.map((t) => [t.id, t.name]))}
          >
            <SelectTrigger id="trainerId" className="w-full">
              <SelectValue placeholder="Select a trainer" />
            </SelectTrigger>
            <SelectContent>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <Input id="level" name="level" defaultValue={course?.level ?? ""} placeholder="Beginner to Advanced" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationText">Duration</Label>
          <Input id="durationText" name="durationText" defaultValue={course?.durationText ?? ""} placeholder="12 weeks" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="regularFee">Fee (₹)</Label>
          <Input
            id="regularFee"
            name="regularFee"
            type="number"
            min={0}
            defaultValue={course?.regularFee}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Delivery modes</Label>
        <div className="flex flex-wrap gap-4">
          {MODES.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <Checkbox name="modes" value={m} defaultChecked={course?.modes.includes(m as never)} />
              {modeLabels[m]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thumbnailFile">Course image</Label>
        <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">Or paste an image URL below instead.</p>
        <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://..." defaultValue={course?.thumbnailUrl ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="highlights">Highlights (one per line)</Label>
        <Textarea
          id="highlights"
          name="highlights"
          rows={3}
          defaultValue={course?.highlights.join("\n")}
          placeholder={"Live doubt-clearing sessions\nPortfolio project"}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={course?.status ?? "DRAFT"}
            items={{ DRAFT: "Draft", PUBLISHED: "Published" }}
          >
            <SelectTrigger id="status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <Checkbox name="featured" defaultChecked={course?.featured} />
          Feature on homepage
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="featuredOrder">Featured order</Label>
          <Input
            id="featuredOrder"
            name="featuredOrder"
            type="number"
            min={0}
            defaultValue={course?.featuredOrder ?? 0}
          />
          <p className="text-xs text-muted-foreground">Lower numbers show first among featured courses.</p>
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <Checkbox name="trialEnabled" defaultChecked={course?.trialEnabled} />
          Offer a 2-day free trial
        </label>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
