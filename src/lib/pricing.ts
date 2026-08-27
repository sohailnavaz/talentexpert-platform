import type { Offer } from "@/generated/prisma";

export function getActiveOffer(offers: Offer[], now = new Date()): Offer | null {
  return (
    offers.find((o) => new Date(o.startAt) <= now && new Date(o.endAt) >= now) ?? null
  );
}

export function computeEffectiveFee(fee: number, offer: Offer | null) {
  if (!offer) return { effectiveFee: fee, discountAmount: 0 };
  const value = Number(offer.value);
  const discountAmount = offer.type === "PERCENT" ? Math.round((fee * value) / 100) : value;
  const effectiveFee = Math.max(0, fee - discountAmount);
  return { effectiveFee, discountAmount };
}

export function computeCouponDiscount(
  amount: number,
  coupon: { type: string; value: number } | null
) {
  if (!coupon) return 0;
  const value = Number(coupon.value);
  return coupon.type === "PERCENT" ? Math.round((amount * value) / 100) : Math.min(value, amount);
}
