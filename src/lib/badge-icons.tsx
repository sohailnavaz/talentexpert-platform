import { Award, Clock, Flame, Rocket, Sparkles, Trophy, type LucideIcon } from "lucide-react";

export const badgeIconMap: Record<string, LucideIcon> = {
  Rocket,
  Award,
  Trophy,
  Clock,
  Flame,
  Sparkles,
};

export function getBadgeIcon(key: string): LucideIcon {
  return badgeIconMap[key] ?? Award;
}
