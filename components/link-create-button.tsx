"use client"

import type React from "react"

import { useState, type ReactNode, useEffect } from "react"
import { Plus, Sparkles, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useLinks } from "@/hooks/use-links"
import { generateAiSuggestions } from "@/lib/ai-utils"

interface LinkCreateButtonProps {
  children?: ReactNode
}

export function LinkCreateButton({ children }: LinkCreateButtonProps) {
  const [open, setOpen] = useState(false)
  const [originalUrl, setOriginalUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()
  const { createLink } = useLinks()
  const { toast } = useToast()

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setOriginalUrl("")
      setCustomSlug("")
      setAiSuggestions([])
      setSelectedTags([])
      setNewTag("")
    }
  }, [open])

  const handleGenerateAiSlugs = async () => {
    if (!originalUrl) {
      toast({
        title: "URL required",
        description: "Please enter a URL to generate suggestions",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(originalUrl)
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Generate multiple AI suggestions
      const suggestions = await generateAiSuggestions(originalUrl, 3)
      setAiSuggestions(suggestions)

      // Set the first suggestion as the default
      if (suggestions.length > 0) {
        setCustomSlug(suggestions[0])
      }
    } catch (error) {
      toast({
        title: "Error generating suggestions",
        description: "Could not generate AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateLink = async () => {
    if (!originalUrl) {
      toast({
        title: "URL required",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create links",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      await createLink(user.uid, originalUrl, customSlug, selectedTags)
      setOpen(false)

      // Form will be reset when dialog closes (via useEffect)
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setCustomSlug(suggestion)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      if (!selectedTags.includes(newTag.trim())) {
        setSelectedTags([...selectedTags, newTag.trim()])
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gradient-bg">
            <Plus className="mr-2 h-4 w-4" /> Create Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Shortened URL</DialogTitle>
          <DialogDescription>Enter a URL to shorten and customize your link.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL to shorten</Label>
            <Input
              id="url"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Custom slug</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAiSlugs}
                disabled={isGenerating || !originalUrl}
                className="gap-1"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {isGenerating ? "Generating..." : "Generate AI Suggestions"}
              </Button>
            </div>
            <Input
              id="slug"
              placeholder="custom-slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
            />

            {aiSuggestions.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label>AI Suggestions</Label>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant={customSlug === suggestion ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                      {customSlug === suggestion && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="Add tags (press Enter to add)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <p className="text-xs text-muted-foreground">Tags help you organize and filter your links</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateLink} className="gradient-bg" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

