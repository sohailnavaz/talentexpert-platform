import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
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
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

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
          {ADMIN_NAV_GROUPS.map((group) => (
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
          <div className="ml-auto">
            <AdminCommandPalette />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
