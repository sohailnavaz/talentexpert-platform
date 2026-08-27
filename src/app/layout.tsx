import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Talent Expert";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.talentexpertedu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Career-Focused IT Training & Placements`,
    template: `%s | ${siteName}`,
  },
  description:
    "Talent Expert is a career-focused training institute offering live online and classroom courses, hands-on batches, placement assistance and industry-recognised certifications.",
  keywords: [
    "Talent Expert",
    "IT training institute",
    "online training",
    "software courses",
    "placement training",
    "certification courses",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/brand/icon-mark-180.png",
  },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Career-Focused IT Training & Placements`,
    description:
      "Live courses, hands-on batches and placement assistance — learn, get certified, get hired.",
    url: siteUrl,
    images: ["/brand/logo-full.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Career-Focused IT Training & Placements`,
    description:
      "Live courses, hands-on batches and placement assistance — learn, get certified, get hired.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a1a35",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
