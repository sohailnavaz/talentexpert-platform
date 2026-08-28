import {
  BadgeIndianRupee,
  BookOpen,
  CalendarDays,
  CalendarRange,
  FileText,
  Gift,
  History,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  MessageSquareWarning,
  Newspaper,
  Quote,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  Trophy,
  Users,
  Users2,
  Video,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Batches", href: "/admin/batches", icon: CalendarRange },
      { label: "Offers & Coupons", href: "/admin/offers", icon: Gift },
    ],
  },
  {
    label: "People & Money",
    items: [
      { label: "Students", href: "/admin/students", icon: Users },
      { label: "Enrolments", href: "/admin/enrolments", icon: FileText },
      { label: "Payments", href: "/admin/payments", icon: BadgeIndianRupee },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Live Classes", href: "/admin/live-classes", icon: Video },
      { label: "Leads / Enquiries", href: "/admin/leads", icon: MessageSquare },
      { label: "Grievances", href: "/admin/grievances", icon: MessageSquareWarning },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "Placements", href: "/admin/placements", icon: Trophy },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Job Openings", href: "/admin/jobs", icon: Receipt },
      { label: "Trainers", href: "/admin/trainers", icon: Users2 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Users & Roles", href: "/admin/users", icon: ShieldCheck },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
      { label: "Audit Log", href: "/admin/audit-log", icon: History },
    ],
  },
];
