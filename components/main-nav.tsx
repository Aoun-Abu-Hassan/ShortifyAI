"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-6">
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/features"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/features" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Features
        </Link>
        <Link
          href="/pricing"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/pricing" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Pricing
        </Link>
        <Link
          href="/blog"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/blog" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Blog
        </Link>
        <Link
          href="/docs"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/docs" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Documentation
        </Link>
      </nav>
    </div>
  )
}

