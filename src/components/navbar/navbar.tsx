"use client";

import { ChefHat, Menu, Shield } from "lucide-react";
import Link from "next/link";
import { CartButton } from "@/components/navbar/cart-button";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavBarProps {
  role?: "admin" | "user" | null;
}

const BASE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/import", label: "Import" },
  { href: "/shopping-list", label: "Shopping List" },
  { href: "/planner", label: "Planner" },
];

const ADMIN_LINKS = [
  { href: "/management", label: "Management" },
  { href: "/admin", label: "Admin" },
];

export function NavBar({ role }: NavBarProps) {
  const links = role
    ? [...BASE_LINKS, ...(role === "admin" ? ADMIN_LINKS : [])]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <ChefHat className="h-5 w-5 text-primary group-hover:rotate-[-8deg] transition-transform duration-300" />
          <span
            className="font-bold text-lg tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Recipes
          </span>
        </Link>

        {links.length > 0 && (
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.href === "/admin" ? (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {link.label}
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {role && <CartButton />}

          {links.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 pt-10">
                <SheetTitle className="flex items-center gap-2 mb-6">
                  <ChefHat className="h-5 w-5" />
                  Recipes
                </SheetTitle>
                <nav
                  className="flex flex-col gap-1"
                  aria-label="Mobile navigation"
                >
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 py-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-md hover:bg-muted transition-colors"
                    >
                      {link.href === "/admin" && (
                        <Shield className="h-3.5 w-3.5" />
                      )}
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
