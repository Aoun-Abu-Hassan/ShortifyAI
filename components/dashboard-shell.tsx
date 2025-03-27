"use client"

import type React from "react"

import { Link2 } from "lucide-react"
import Link from "next/link"

import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { SiteFooter } from "@/components/site-footer"

interface DashboardShellProps {
  children?: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden md:inline-block">ShortifyAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="text-muted-foreground transition-colors hover:text-primary">
                Analytics
              </Link>
              <Link href="/dashboard/settings" className="text-muted-foreground transition-colors hover:text-primary">
                Settings
              </Link>
            </nav>
            <ThemeToggle />
            <UserNav />
            <MobileNav />
          </div>
        </div>
      </header>
      <main className="container grid flex-1 gap-12 py-6">{children}</main>
    </div>
  )
}

