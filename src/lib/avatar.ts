import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import type { Options as AdventurerOptions } from "@dicebear/adventurer";

type AvatarGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null | undefined;

const SHORT_HAIR = Array.from(
  { length: 19 },
  (_, i) => `short${String(i + 1).padStart(2, "0")}`
) as NonNullable<AdventurerOptions["hair"]>;
const LONG_HAIR = Array.from(
  { length: 26 },
  (_, i) => `long${String(i + 1).padStart(2, "0")}`
) as NonNullable<AdventurerOptions["hair"]>;

const GENDER_OPTIONS: Record<"MALE" | "FEMALE", AdventurerOptions> = {
  MALE: { hair: SHORT_HAIR, features: ["mustache"], featuresProbability: 30, earringsProbability: 0 },
  FEMALE: { hair: LONG_HAIR, features: ["blush"], featuresProbability: 30, earringsProbability: 40 },
};

export function generateAvatarDataUri(seed: string, gender?: AvatarGender) {
  const options = gender === "MALE" || gender === "FEMALE" ? GENDER_OPTIONS[gender] : {};
  return createAvatar(adventurer, { seed, ...options }).toDataUri();
}
