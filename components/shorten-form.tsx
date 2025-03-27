"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"

export function ShortenForm() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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

    setLoading(true)

    try {
      // For demo purposes, we'll just generate a random slug
      // In a real app, this would call your API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const slug = generateSlug()
      const newShortUrl = `${window.location.origin}/s/${slug}`

      setShortUrl(newShortUrl)

      toast({
        title: "URL shortened!",
        description: "Your shortened URL has been created.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
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
        <p className="text-sm text-muted-foreground">Try it now without signing up</p>
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

