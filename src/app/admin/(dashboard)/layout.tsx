import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeIndianRupee,
  BookOpen,
  CalendarRange,
  FileText,
  Gift,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Newspaper,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Users2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoMark } from "@/components/site/logo";
import { verifyAdminSession } from "@/lib/auth/dal";
import { logoutAdmin } from "@/lib/actions/auth";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
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
      { label: "Leads / Enquiries", href: "/admin/leads", icon: MessageSquare },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
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

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await verifyAdminSession();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
            <LogoMark size={32} />
            <span className="font-heading text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
              Admin Panel
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {session.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{session.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{session.role.replace("_", " ")}</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <form action={logoutAdmin}>
                <SidebarMenuButton type="submit" tooltip="Log out">
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <span className="font-heading text-sm font-semibold">Talent Expert Admin</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
