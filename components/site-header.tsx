"use client"

import Link from "next/link"
import { Link2 } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { AuthNav } from "@/components/auth-nav"
import { MobileNav } from "@/components/mobile-nav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="ShortifyAI Home">
            <div className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">ShortifyAI</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <MainNav />
          <AuthNav />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

