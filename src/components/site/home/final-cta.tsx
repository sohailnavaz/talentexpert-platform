import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui-fx/reveal";
import { BrandWatermark } from "@/components/site/brand-watermark";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-14 sm:py-20 text-white">
      <BrandWatermark />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance font-heading text-3xl font-bold sm:text-4xl">
          Ready to start your next chapter?
        </h2>
        <p className="mt-4 max-w-xl text-balance text-white/70">
          Talk to a counsellor about the right course and batch for you — or jump straight into
          the catalogue and enrol in minutes.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            render={<Link href="/courses" />}
            nativeButton={false}
            size="lg"
            className="w-full bg-white text-brand-navy hover:bg-white/90 sm:w-auto"
          >
            Browse courses <ArrowRight className="h-4 w-4" />
          </Button>
          <EnquiryDialog
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "w-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            )}
          >
            Talk to a counsellor
          </EnquiryDialog>
        </div>
      </Reveal>
    </section>
  );
}
