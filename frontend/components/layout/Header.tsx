"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Menu, X } from "lucide-react";

import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="
          rounded-md px-2 py-2
          text-sm font-medium
          hover:bg-muted hover:text-primary
          transition
        "
      >
        {children}
      </Link>
    </SheetClose>
  );
}

export default function Header() {
  const router = useRouter();
  const { user, token, logout, hydrated } = useAuthStore();

  // 🚨 Prevent hydration mismatch
  if (!hydrated) return null;

  const isAuthenticated = !!token;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-2xl font-bold text-primary">Staayzy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">Home</Link>

          {isAuthenticated && user?.role === "tenant" && (
            <>
              <Link href="/tenant">Find Rooms</Link>
              <Link href="/tenant/dashboard">Dashboard</Link>
            </>
          )}

          {isAuthenticated && user?.role === "owner" && (
            <>
              <Link href="/owner">My Properties</Link>
              <Link href="/owner/dashboard">Dashboard</Link>
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link href="/admin/dashboard">Admin Dashboard</Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open navigation menu</span>
      </Button>
    </SheetTrigger>

              <SheetContent
                className={
                  "fixed inset-y-0 left-0 z-50 h-full w-[84%] max-w-xs sm:w-72 p-0 " +
                  "bg-white shadow-lg rounded-tr-lg rounded-br-lg transform transition-transform duration-200 ease-out will-change-transform " +
                  "[data-state=open]:translate-x-0 [data-state=closed]:-translate-x-full"
                }
              >
                {/* ✅ Required for Radix accessibility (visually hidden) */}
                <VisuallyHidden>
                  <SheetTitle>Navigation menu</SheetTitle>
                </VisuallyHidden>
                <VisuallyHidden>
                  <SheetDescription>Mobile navigation menu</SheetDescription>
                </VisuallyHidden>

                <div className="h-full flex flex-col justify-between">
                  {/* Top: brand + close */}
                  <div className="px-4 pt-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        S
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        Staayzy
                      </span>
                    </div>

                    {/* <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="p-2">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose> */}
                  </div>

                  {/* Middle: nav links */}
                  <nav className="px-4 pb-4 overflow-y-auto flex-1 space-y-2">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                      >
                        Home
                      </Link>
                    </SheetClose>

                    {isAuthenticated && user?.role === "owner" && (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/owner/dashboard"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Dashboard
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/owner/properties/new"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Add Property
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/owner/dashboard?tab=bookings"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Bookings
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/owner/dashboard?tab=earnings"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Earnings
                          </Link>
                        </SheetClose>
                      </>
                    )}

                    {isAuthenticated && user?.role === "tenant" && (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/tenant"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Find Rooms
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/tenant/dashboard"
                            className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                          >
                            Dashboard
                          </Link>
                        </SheetClose>
                      </>
                    )}

                    {isAuthenticated && user?.role === "admin" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin/dashboard"
                          className="block w-full text-left px-3 py-3 rounded-md text-base text-gray-700 hover:bg-primary/10 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      </SheetClose>
                    )}
                  </nav>

                  {/* Bottom: auth actions */}
                  <div className="px-4 pb-6 pt-4 border-t">
                    {isAuthenticated ? (
                      <SheetClose asChild>
                        <button
                          onClick={() => {
                            logout();
                            router.push("/");
                          }}
                          className="w-full text-left px-3 py-3 rounded-md text-base text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </SheetClose>
                    ) : (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <button
                            onClick={() => router.push("/auth/login")}
                            className="w-full text-left px-3 py-3 rounded-md text-base hover:bg-primary/10 transition-colors"
                          >
                            Login
                          </button>
                        </SheetClose>

                        <SheetClose asChild>
                          <button
                            onClick={() => router.push("/auth/register")}
                            className="w-full text-left px-3 py-3 rounded-md text-base hover:bg-primary/10 transition-colors"
                          >
                            Sign Up
                          </button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
  </Sheet>
</div>


        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{user?.name}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => router.push("/auth/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/auth/register")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
