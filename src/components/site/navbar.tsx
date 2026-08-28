"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Phone, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, siteConfig } from "@/lib/site-config";
import { Logo } from "@/components/site/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { SiteSearch } from "@/components/site/site-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutStudent } from "@/lib/actions/auth";

export function Navbar({
  phone,
  phoneHref,
  student,
}: { phone?: string; phoneHref?: string; student?: { name: string } | null } = {}) {
  const displayPhone = phone ?? siteConfig.phone;
  const displayPhoneHref = phoneHref ?? siteConfig.phoneHref;
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/85 backdrop-blur-lg shadow-sm"
          : "border-b border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {mainNav.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[280px] gap-1 p-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <NavigationMenuLink
                              render={<Link href={child.href} />}
                              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                            >
                              {child.label}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={cn(
                      "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === item.href && "text-primary"
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search courses"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Search className="h-4.5 w-4.5" />
          </Button>
          <ThemeToggle />
          <a
            href={displayPhoneHref}
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground xl:flex"
          >
            <Phone className="h-4 w-4" />
            {displayPhone}
          </a>
          {student ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <UserRound className="h-4 w-4" /> {student.name.split(" ")[0]}
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href="/portal" />}>
                  <LayoutDashboard className="h-4 w-4" /> My Portal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => { logoutStudent(); }}>
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Student Login
            </Button>
          )}
          <EnquiryDialog
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
          >
            Enquire Now
          </EnquiryDialog>

          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "lg:hidden")}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px]">
              <SheetHeader>
                <SheetTitle render={<Logo />} />
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {student ? (
                  <div className="mb-2 flex flex-col gap-1 border-b border-border/60 pb-3">
                    <p className="py-1 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{student.name}</span>
                    </p>
                    <SheetClose
                      render={<Link href="/portal" />}
                      nativeButton={false}
                      className="flex items-center gap-2 py-2 font-medium text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" /> My Portal
                    </SheetClose>
                    <SheetClose
                      onClick={() => { logoutStudent(); }}
                      className="flex items-center gap-2 py-2 text-left font-medium text-destructive"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </SheetClose>
                  </div>
                ) : (
                  <SheetClose
                    render={<Link href="/login" />}
                    nativeButton={false}
                    className="mb-2 border-b border-border/60 py-3 font-medium"
                  >
                    Student Login
                  </SheetClose>
                )}
                {mainNav.map((item) => (
                  <div key={item.label} className="border-b border-border/60 py-1">
                    <SheetClose
                      render={<Link href={item.href} />}
                      nativeButton={false}
                      className="block py-2 font-medium text-foreground"
                    >
                      {item.label}
                    </SheetClose>
                    {item.children ? (
                      <div className="mb-2 flex flex-col gap-0.5 pl-3">
                        {item.children.map((child) => (
                          <SheetClose
                            key={child.href}
                            render={<Link href={child.href} />}
                            nativeButton={false}
                            className="py-1.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {child.label}
                          </SheetClose>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-foreground">Theme</span>
                  <ThemeToggle className="border border-border" />
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <Button variant="outline" render={<a href={displayPhoneHref} />} nativeButton={false}>
                    <Phone className="h-4 w-4" /> Call us
                  </Button>
                  <EnquiryDialog className={cn(buttonVariants(), "w-full")}>
                    Enquire Now
                  </EnquiryDialog>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
