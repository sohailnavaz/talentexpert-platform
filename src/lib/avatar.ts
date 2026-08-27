import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

export function generateAvatarDataUri(seed: string) {
  return createAvatar(avataaars, { seed }).toDataUri();
}
