import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";

export function generateAvatarDataUri(seed: string) {
  return createAvatar(micah, { seed }).toDataUri();
}
