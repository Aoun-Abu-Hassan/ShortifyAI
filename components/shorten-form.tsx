"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Sparkles } from "lucide-react"
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

// Rate limit constants
const RATE_LIMIT_KEY = "shortify_anonymous_rate_limit"
const MAX_ANONYMOUS_LINKS_PER_HOUR = 5
const RATE_LIMIT_DURATION_MS = 60 * 60 * 1000 // 1 hour

export function ShortenForm() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if the anonymous user has reached their rate limit
  const checkRateLimit = (): boolean => {
    if (user) return false // No rate limit for authenticated users

    const rateLimit = localStorage.getItem(RATE_LIMIT_KEY)
    if (!rateLimit) return false

    const { count, timestamp } = JSON.parse(rateLimit)
    const now = Date.now()

    // Reset rate limit if it's been more than the duration
    if (now - timestamp > RATE_LIMIT_DURATION_MS) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 0, timestamp: now }))
      return false
    }

    return count >= MAX_ANONYMOUS_LINKS_PER_HOUR
  }

  // Update the rate limit counter for anonymous users
  const updateRateLimit = () => {
    if (user) return // No rate limit for authenticated users

    const now = Date.now()
    const rateLimit = localStorage.getItem(RATE_LIMIT_KEY)

    if (!rateLimit) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }))
      return
    }

    const { count, timestamp } = JSON.parse(rateLimit)

    // Reset if it's been more than the duration
    if (now - timestamp > RATE_LIMIT_DURATION_MS) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: now }))
      return
    }

    // Increment the counter
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: count + 1, timestamp }))
  }

  // Check if a slug already exists in Firestore
  const checkSlugExists = async (slug: string): Promise<boolean> => {
    const q = query(collection(db, "links"), where("slug", "==", slug))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  }

  // Generate a unique slug that doesn't exist in Firestore
  const generateUniqueSlug = async (): Promise<string> => {
    let slug = generateSlug()
    let exists = await checkSlugExists(slug)

    // Keep generating until we find a unique slug
    // Add a limit to prevent infinite loops in extreme cases
    let attempts = 0
    while (exists && attempts < 5) {
      slug = generateSlug()
      exists = await checkSlugExists(slug)
      attempts++
    }

    if (exists) {
      throw new Error("Unable to generate a unique slug. Please try again.")
    }

    return slug
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      })
      return
    }

    // Check rate limit for anonymous users
    if (checkRateLimit()) {
      toast({
        title: "Rate limit exceeded",
        description: `You can only create ${MAX_ANONYMOUS_LINKS_PER_HOUR} links per hour. Please sign in to create more or try again later.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Generate a unique slug
      const slug = await generateUniqueSlug()
      const newShortUrl = `${window.location.origin}/s/${slug}`

      // Create the link document in Firestore
      const linkData = {
        originalUrl: url,
        shortUrl: newShortUrl,
        slug,
        userId: user ? user.uid : "anonymous",
        createdAt: new Date().toISOString(),
        clicks: 0,
        isAnonymous: !user,
        ipAddress: "", // In a real app, you'd get this from the server
        userAgent: navigator.userAgent,
      }

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "links"), linkData)

      // Update rate limit for anonymous users
      if (!user) {
        updateRateLimit()
      }

      setShortUrl(newShortUrl)

      toast({
        title: "URL shortened!",
        description: "Your shortened URL has been created.",
      })
    } catch (error) {
      console.error("Error shortening URL:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to shorten URL. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    toast({
      title: "Copied!",
      description: "The shortened URL has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Shorten a URL</h3>
        <p className="text-sm text-muted-foreground">
          {user ? "Create a shortened URL" : "Try it now without signing up"}
          {!user && <span className="block text-xs mt-1">Sign in to access analytics and manage your links.</span>}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Enter your long URL</Label>
          <div className="relative">
            <Input
              id="url"
              placeholder="https://example.com/very-long-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-10"
            />
            <Sparkles className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <Button type="submit" className="w-full gradient-bg" disabled={loading}>
          {loading ? "Shortening..." : "Shorten URL"}
        </Button>
      </form>

      {shortUrl && (
        <div className="animate-in rounded-md border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium">Your shortened URL:</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate block"
              >
                {shortUrl}
              </a>
              {!user && <p className="text-xs text-muted-foreground mt-1">Sign in to save and track this link.</p>}
            </div>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

