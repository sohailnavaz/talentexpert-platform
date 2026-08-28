import type { Metadata } from "next";
import { getCurrentTrainer } from "@/lib/auth/dal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainerPhotoUploadButton } from "@/components/trainer/photo-upload-button";
import { TrainerProfileForm } from "@/components/trainer/profile-form";
import { TrainerPasswordForm } from "@/components/trainer/password-form";
import { resolveStorageUrlOrNull } from "@/lib/storage";

export const metadata: Metadata = { title: "My Profile", robots: { index: false, follow: false } };

export default async function TrainerProfilePage() {
  const trainer = await getCurrentTrainer();
  if (!trainer) return null;
  const photoUrl = await resolveStorageUrlOrNull(trainer.photoUrl);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            {photoUrl ? <AvatarImage src={photoUrl} alt={trainer.name} /> : null}
            <AvatarFallback className="bg-primary/15 font-heading text-2xl font-bold text-primary">
              {trainer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <TrainerPhotoUploadButton hasCustomPhoto={!!trainer.photoUrl} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">{trainer.name}</h1>
          <p className="text-sm text-muted-foreground">{trainer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainerProfileForm name={trainer.name} phone={trainer.phone} bio={trainer.bio} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainerPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
