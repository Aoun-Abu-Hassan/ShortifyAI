"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setError(error.error)
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-destructive">Something went wrong</h2>
          <p className="mb-4 text-muted-foreground">We apologize for the inconvenience. An error has occurred.</p>
          {error && (
            <div className="mb-4 rounded-md bg-muted p-4">
              <p className="font-mono text-sm">{error.message}</p>
            </div>
          )}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
            >
              Try again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go to homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

