import type { Metadata } from "next";
import { db } from "@/lib/db";
import { verifyStudentSession } from "@/lib/auth/dal";
import { evaluateAndAwardBadges, getStudentBadgeBoard, getLevelProgress } from "@/lib/gamification";
import { formatMemberId } from "@/lib/format";
import { generateAvatarDataUri } from "@/lib/avatar";
import { AuroraBackground } from "@/components/ui-fx/aurora-background";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileStats } from "@/components/portal/profile-stats";
import { BadgesGridLazy } from "@/components/portal/badges-grid-lazy";
import { RewardMeter } from "@/components/portal/reward-meter";
import { InlineBioEditor } from "@/components/portal/inline-bio-editor";
import { AvatarUploadButton } from "@/components/portal/avatar-upload-button";
import { ProfileForm } from "@/components/portal/profile-form";
import { PasswordForm } from "@/components/portal/password-form";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await verifyStudentSession();
  const student = await db.student.findUniqueOrThrow({ where: { id: session.studentId } });
  const { stats } = await evaluateAndAwardBadges(session.studentId);
  const badges = await getStudentBadgeBoard(session.studentId, stats);
  const earnedCount = badges.filter((b) => b.earned).length;
  const totalPoints = badges.filter((b) => b.earned).reduce((sum, b) => sum + b.points, 0);
  const { level, nextLevel, pointsToNext } = getLevelProgress(totalPoints);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <AuroraBackground />
        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage
                src={student.avatarUrl ?? generateAvatarDataUri(student.id, student.gender)}
                alt={student.name}
              />
              <AvatarFallback className="bg-primary/15 font-heading text-2xl font-bold text-primary">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <AvatarUploadButton hasCustomAvatar={!!student.avatarUrl} />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-heading text-2xl font-bold">{student.name}</h1>
              <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {formatMemberId(student.studentNumber)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <InlineBioEditor bio={student.bio} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold">Your learning stats</h2>
        <div className="mt-3">
          <ProfileStats stats={stats} />
        </div>
      </div>

      <RewardMeter totalPoints={totalPoints} level={level} nextLevel={nextLevel} pointsToNext={pointsToNext} />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Badges</h2>
          <span className="text-sm text-muted-foreground">
            {earnedCount} / {badges.length} earned
          </span>
        </div>
        <div className="mt-3">
          <BadgesGridLazy
            badges={badges.map((b) => ({
              ...b,
              earnedAt: b.earnedAt ? b.earnedAt.toISOString() : null,
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={student.name}
              phone={student.phone}
              whatsapp={student.whatsapp}
              age={student.age}
              gender={student.gender}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
