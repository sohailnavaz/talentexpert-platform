import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import type { Options as MicahOptions } from "@dicebear/micah";

type AvatarGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null | undefined;

const GENDER_OPTIONS: Record<"MALE" | "FEMALE", MicahOptions> = {
  MALE: {
    hair: ["fonze", "mrT", "mrClean", "dougFunny", "dannyPhantom"],
    facialHairProbability: 40,
    earringsProbability: 0,
  },
  FEMALE: {
    hair: ["full", "pixie", "turban"],
    facialHairProbability: 0,
    earringsProbability: 40,
  },
};

export function generateAvatarDataUri(seed: string, gender?: AvatarGender) {
  const options = gender === "MALE" || gender === "FEMALE" ? GENDER_OPTIONS[gender] : {};
  return createAvatar(micah, { seed, ...options }).toDataUri();
}
