"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { startCheckout, verifyCheckoutPayment } from "@/lib/actions/checkout";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export function CheckoutForm({
  batchId,
  courseTitle,
  amount,
}: {
  batchId: string;
  courseTitle: string;
  amount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    const details = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
      couponCode: String(formData.get("couponCode") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await startCheckout(batchId, details);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.free) {
        router.push(`/checkout/success/${result.enrollmentId}`);
        return;
      }

      if (!razorpayReady || typeof window.Razorpay === "undefined") {
        setError("Payment gateway is still loading — please try again in a moment.");
        return;
      }

      const rzp = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: "INR",
        name: "Talent Expert",
        description: courseTitle,
        order_id: result.orderId,
        prefill: { name: result.name, email: result.email, contact: result.phone },
        theme: { color: "#c2540c" },
        handler: (response: RazorpaySuccessResponse) => {
          startTransition(async () => {
            const verify = await verifyCheckoutPayment({
              enrollmentId: result.enrollmentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verify.ok) {
              router.push(`/checkout/success/${result.enrollmentId}`);
            } else {
              setError(verify.message ?? "Payment verification failed.");
            }
          });
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled."),
        },
      });
      rzp.open();
    });
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="co-name">Full name</Label>
          <Input id="co-name" name="name" placeholder="Your name" required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="co-email">Email</Label>
            <Input id="co-email" name="email" type="email" placeholder="you@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-phone">Phone</Label>
            <Input id="co-phone" name="phone" placeholder="10-digit mobile" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="co-whatsapp">WhatsApp number (optional)</Label>
          <Input id="co-whatsapp" name="whatsapp" placeholder="Same as phone if left blank" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="co-coupon">Coupon code (optional)</Label>
          <Input id="co-coupon" name="couponCode" placeholder="e.g. WELCOME10" className="uppercase" />
        </div>
        <p className="text-xs text-muted-foreground">
          We&apos;ll create your student portal account with this email — you&apos;ll get your login details right
          after enrolling.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Processing..." : amount === 0 ? "Confirm free enrolment" : `Pay ${formatINR(amount)} securely`}
        </Button>
      </form>
    </>
  );
}
