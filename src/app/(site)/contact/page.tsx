import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Talent Expert — phone, email, or send us a message.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        description="Questions about a course, a batch, or corporate training? We usually reply within a few hours."
      />
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Call us</p>
                <a href={siteConfig.phoneHref} className="font-medium hover:text-primary">
                  {siteConfig.phone}
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email us</p>
                <a href={`mailto:${siteConfig.email}`} className="font-medium hover:text-primary">
                  {siteConfig.email}
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Visit us</p>
                <p className="font-medium">{siteConfig.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold">Send us a message</h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
