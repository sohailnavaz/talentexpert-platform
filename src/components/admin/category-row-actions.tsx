"use client";

import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteCategory } from "@/lib/actions/admin-categories";
import type { Category } from "@/generated/prisma";

export function CategoryRowActions({ category }: { category: Category }) {
  return (
    <div className="flex justify-end gap-2">
      <CategoryFormDialog category={category} />
      <ConfirmDeleteButton
        action={deleteCategory.bind(null, category.id)}
        description={`Permanently delete "${category.name}"? Courses using it must be moved first.`}
      />
    </div>
  );
}
