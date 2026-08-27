import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, Receipt, UserRound } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentStudent } from "@/lib/auth/dal";
import { logoutStudent } from "@/lib/actions/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const NAV = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "My Courses", href: "/portal/courses", icon: BookOpen },
  { label: "Payments", href: "/portal/payments", icon: Receipt },
  { label: "My Profile", href: "/portal/profile", icon: UserRound },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const student = await getCurrentStudent();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 px-2 py-1.5">
            <LogoMark size={32} />
            <span className="font-heading text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
              Talent<span className="text-primary">Expert</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
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
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {student?.name?.charAt(0) ?? "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{student?.name ?? "Student"}</p>
                  <p className="truncate text-xs text-muted-foreground">{student?.email}</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <form action={logoutStudent}>
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
          <span className="font-heading text-sm font-semibold">Student Portal</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
