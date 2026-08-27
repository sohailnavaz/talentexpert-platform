"use server";

import "server-only";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { razorpay, RAZORPAY_CONFIGURED } from "@/lib/razorpay";
import { hashPassword, generateTempPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/email";
import { generateEnrollmentCode } from "@/lib/enrollment-code";
import { getActiveOffer, computeEffectiveFee, computeCouponDiscount } from "@/lib/pricing";

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  whatsapp: z.string().trim().optional(),
  couponCode: z.string().trim().optional(),
});

export type CheckoutDetails = z.infer<typeof detailsSchema>;

export type StartCheckoutResult =
  | { ok: true; free: true; enrollmentId: string }
  | {
      ok: true;
      free: false;
      orderId: string;
      amount: number;
      keyId: string;
      enrollmentId: string;
      name: string;
      email: string;
      phone: string;
    }
  | { ok: false; message: string };

async function findOrCreateStudent(details: { name: string; email: string; phone: string; whatsapp?: string }) {
  const existing = await db.student.findUnique({ where: { email: details.email } });
  if (existing) return existing;

  const unusablePasswordHash = await hashPassword(crypto.randomUUID());
  return db.student.create({
    data: {
      name: details.name,
      email: details.email,
      phone: details.phone,
      whatsapp: details.whatsapp || null,
      passwordHash: unusablePasswordHash,
    },
  });
}

async function issuePortalAccessEmail(enrollmentId: string) {
  const enrollment = await db.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: { student: true, batch: { include: { course: true } } },
  });

  const paidCount = await db.enrollment.count({ where: { studentId: enrollment.studentId, status: "PAID" } });
  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`;
  const courseTitle = enrollment.batch.course.title;

  if (paidCount === 1) {
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    await db.student.update({
      where: { id: enrollment.studentId },
      data: { passwordHash, mustChangePassword: true },
    });
    await sendEmail({
      to: enrollment.student.email,
      subject: "Welcome to Talent Expert — your enrolment is confirmed",
      html: `<p>Hi ${enrollment.student.name},</p><p>You're enrolled in <strong>${courseTitle}</strong>. Your enrolment code is <strong>${enrollment.enrollmentCode}</strong>.</p><p>Sign in to your student portal at <a href="${portalUrl}">${portalUrl}</a> with:</p><p>Email: ${enrollment.student.email}<br/>Temporary password: <strong>${tempPassword}</strong></p><p>You'll be asked to set a new password on first login.</p>`,
    });
  } else {
    await sendEmail({
      to: enrollment.student.email,
      subject: `New course unlocked: ${courseTitle}`,
      html: `<p>Hi ${enrollment.student.name},</p><p>You're now enrolled in <strong>${courseTitle}</strong>. Your enrolment code is <strong>${enrollment.enrollmentCode}</strong>.</p><p>It's live on your student portal: <a href="${portalUrl}">${portalUrl}</a></p>`,
    });
  }
}

export async function startCheckout(batchId: string, details: CheckoutDetails): Promise<StartCheckoutResult> {
  const parsed = detailsSchema.safeParse(details);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };

  const batch = await db.batch.findUnique({ where: { id: batchId }, include: { offers: true } });
  if (!batch) return { ok: false, message: "This batch could not be found." };
  if (batch.status === "COMPLETED") return { ok: false, message: "This batch has already been completed." };
  if (batch.seatTotal - batch.seatsFilled <= 0) return { ok: false, message: "This batch is sold out." };

  const offer = getActiveOffer(batch.offers);
  const { effectiveFee } = computeEffectiveFee(Number(batch.fee), offer);

  let coupon: { id: string; type: string; value: unknown } | null = null;
  let couponDiscount = 0;
  if (parsed.data.couponCode) {
    const code = parsed.data.couponCode.toUpperCase();
    const found = await db.coupon.findUnique({ where: { code } });
    const invalid =
      !found ||
      !found.active ||
      (found.expiresAt && found.expiresAt < new Date()) ||
      (found.usageLimit != null && found.usedCount >= found.usageLimit);
    if (invalid) return { ok: false, message: "That coupon code is invalid or has expired." };
    coupon = found;
    couponDiscount = computeCouponDiscount(effectiveFee, { type: found.type, value: Number(found.value) });
  }

  const amountDue = Math.max(0, effectiveFee - couponDiscount);

  if (amountDue > 0 && !RAZORPAY_CONFIGURED) {
    return {
      ok: false,
      message: "Online payments aren't switched on yet — please reach out to us and we'll get you enrolled.",
    };
  }

  const student = await findOrCreateStudent(parsed.data);
  const enrollmentCode = await generateEnrollmentCode();

  if (amountDue === 0) {
    const enrollment = await db.enrollment.create({
      data: {
        enrollmentCode,
        studentId: student.id,
        batchId: batch.id,
        amountDue: 0,
        amountPaid: 0,
        discountAmount: couponDiscount,
        couponId: coupon?.id,
        status: "PAID",
        portalUnlocked: true,
      },
    });
    await db.batch.update({ where: { id: batch.id }, data: { seatsFilled: { increment: 1 } } });
    if (coupon) await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    await issuePortalAccessEmail(enrollment.id);
    return { ok: true, free: true, enrollmentId: enrollment.id };
  }

  const enrollment = await db.enrollment.create({
    data: {
      enrollmentCode,
      studentId: student.id,
      batchId: batch.id,
      amountDue,
      amountPaid: 0,
      discountAmount: couponDiscount,
      couponId: coupon?.id,
      status: "PENDING",
    },
  });

  let order;
  try {
    order = await razorpay.orders.create({
      amount: Math.round(amountDue * 100),
      currency: "INR",
      receipt: enrollment.id,
      notes: { enrollmentId: enrollment.id, batchId: batch.id },
    });
  } catch {
    return { ok: false, message: "We couldn't start the payment. Please try again in a moment." };
  }

  await db.payment.create({
    data: {
      enrollmentId: enrollment.id,
      studentId: student.id,
      gatewayOrderId: order.id,
      amount: amountDue,
      status: "CREATED",
      contactName: parsed.data.name,
      contactEmail: parsed.data.email,
      contactPhone: parsed.data.phone,
    },
  });

  return {
    ok: true,
    free: false,
    orderId: order.id,
    amount: Math.round(amountDue * 100),
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    enrollmentId: enrollment.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
  };
}

export async function verifyCheckoutPayment(input: {
  enrollmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ ok: boolean; message?: string }> {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (expected !== input.razorpaySignature) {
    await db.payment.updateMany({
      where: { gatewayOrderId: input.razorpayOrderId },
      data: { status: "FAILED", failureReason: "Signature mismatch" },
    });
    return { ok: false, message: "Payment verification failed. Please contact support." };
  }

  const payment = await db.payment.findUnique({ where: { gatewayOrderId: input.razorpayOrderId } });
  if (!payment || payment.enrollmentId !== input.enrollmentId) {
    return { ok: false, message: "Payment record not found." };
  }

  const enrollment = await db.enrollment.update({
    where: { id: input.enrollmentId },
    data: { status: "PAID", amountPaid: payment.amount, portalUnlocked: true },
  });

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      gatewayPaymentId: input.razorpayPaymentId,
      gatewaySignature: input.razorpaySignature,
    },
  });

  await db.batch.update({ where: { id: enrollment.batchId }, data: { seatsFilled: { increment: 1 } } });
  if (enrollment.couponId) {
    await db.coupon.update({ where: { id: enrollment.couponId }, data: { usedCount: { increment: 1 } } });
  }

  await issuePortalAccessEmail(enrollment.id);

  return { ok: true };
}

export async function markCheckoutFailed(razorpayOrderId: string, reason: string) {
  await db.payment.updateMany({
    where: { gatewayOrderId: razorpayOrderId },
    data: { status: "FAILED", failureReason: reason },
  });
}
