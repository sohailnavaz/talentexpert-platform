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

type KnownStudent = { name: string; email: string; phone: string; whatsapp: string | null };

export function CheckoutForm({
  batchId,
  courseTitle,
  amount,
  knownStudent,
}: {
  batchId: string;
  courseTitle: string;
  amount: number;
  knownStudent?: KnownStudent | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [editingDetails, setEditingDetails] = useState(!knownStudent || !knownStudent.phone);

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
        {knownStudent && !editingDetails ? (
          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Checking out as</p>
              <button
                type="button"
                onClick={() => setEditingDetails(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Edit details
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="text-foreground">{knownStudent.name}</p>
              <p>{knownStudent.email}</p>
              <p>{knownStudent.phone}</p>
            </div>
            <input type="hidden" name="name" value={knownStudent.name} />
            <input type="hidden" name="email" value={knownStudent.email} />
            <input type="hidden" name="phone" value={knownStudent.phone} />
            {knownStudent.whatsapp ? <input type="hidden" name="whatsapp" value={knownStudent.whatsapp} /> : null}
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Full name</Label>
              <Input
                id="co-name"
                name="name"
                placeholder="Your name"
                defaultValue={knownStudent?.name}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="co-email">Email</Label>
                <Input
                  id="co-email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  defaultValue={knownStudent?.email}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-phone">Phone</Label>
                <Input
                  id="co-phone"
                  name="phone"
                  placeholder="10-digit mobile"
                  defaultValue={knownStudent?.phone}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-whatsapp">WhatsApp number (optional)</Label>
              <Input
                id="co-whatsapp"
                name="whatsapp"
                placeholder="Same as phone if left blank"
                defaultValue={knownStudent?.whatsapp ?? undefined}
              />
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="co-coupon">Coupon code (optional)</Label>
          <Input id="co-coupon" name="couponCode" placeholder="e.g. WELCOME10" className="uppercase" />
        </div>
        {!knownStudent ? (
          <p className="text-xs text-muted-foreground">
            We&apos;ll create your student portal account with this email — you&apos;ll get your login details right
            after enrolling.
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Processing..." : amount === 0 ? "Confirm free enrolment" : `Pay ${formatINR(amount)} securely`}
        </Button>
      </form>
    </>
  );
}
