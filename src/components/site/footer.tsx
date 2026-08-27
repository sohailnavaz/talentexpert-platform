import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/icons/brand-icons";
import { siteConfig, footerLinks } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 pb-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-heading text-lg font-bold">
                Talent<span className="text-primary">Expert</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 shrink-0" /> {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 shrink-0" /> {siteConfig.email}
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {siteConfig.address}
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              {[
                { href: siteConfig.socials.instagram, icon: InstagramIcon, label: "Instagram" },
                { href: siteConfig.socials.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
                { href: siteConfig.socials.youtube, icon: YoutubeIcon, label: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Courses" links={footerLinks.courses} />
          <FooterCol title="Company" links={footerLinks.company} />
          <FooterCol title="Account" links={footerLinks.account} />
          <FooterCol title="Legal" links={footerLinks.legal} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
          <p>Built for career outcomes, not just certificates.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
