"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/lib/actions/profile";
import type { AuthFormState } from "@/lib/actions/auth";

const GENDER_OPTIONS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const initialState: AuthFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function ProfileForm({
  name,
  phone,
  whatsapp,
  age,
  gender,
}: {
  name: string;
  phone: string;
  whatsapp: string | null;
  age: number | null;
  gender: string | null;
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={phone} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">WhatsApp number (optional)</Label>
        <Input id="whatsapp" name="whatsapp" defaultValue={whatsapp ?? ""} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age (optional)</Label>
          <Input id="age" name="age" type="number" min={10} max={100} defaultValue={age ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender (optional)</Label>
          <Select name="gender" defaultValue={gender ?? undefined} items={GENDER_OPTIONS}>
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GENDER_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
