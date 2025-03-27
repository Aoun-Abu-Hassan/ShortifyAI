"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export function AuthNav() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during initial load to prevent flash of incorrect UI
  if (!mounted || loading) {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-16 h-9 bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />

      {user ? (
        <Button asChild className="transition-all duration-200 ease-in-out">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      ) : (
        <>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  )
}

