"use client"

import { useState } from "react"
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash } from "lucide-react"

import type { LinkData } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLinks } from "@/hooks/use-links"

interface LinkItemProps {
  link: LinkData
}

export function LinkItem({ link }: LinkItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customSlug, setCustomSlug] = useState(link.slug)
  const { updateLink, deleteLink } = useLinks()
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link.shortUrl)
    toast({
      title: "Copied to clipboard",
      description: "The shortened URL has been copied to your clipboard.",
    })
  }

  const handleUpdateLink = async () => {
    if (!customSlug) {
      toast({
        title: "Slug required",
        description: "Please enter a custom slug",
        variant: "destructive",
      })
      return
    }

    const success = await updateLink(link.id, { slug: customSlug })
    if (success) {
      setEditDialogOpen(false)
    }
  }

  const handleDeleteLink = async () => {
    const success = await deleteLink(link.id)
    if (success) {
      setDeleteDialogOpen(false)
    }
  }

  // Format the date to be more readable
  const formattedDate = new Date(link.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4">
        <div className="grid gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{link.slug}</h3>
            <Badge variant="secondary" className="text-xs">
              {link.clicks} clicks
            </Badge>
            {link.tags && link.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {link.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-1 max-w-[300px] hover:underline"
            >
              {link.originalUrl}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {link.shortUrl}
            </a>
            <span className="text-xs text-muted-foreground">Created on {formattedDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="ghost" size="icon" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open</span>
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Update your shortened URL.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="original-url">Original URL</Label>
              <Input id="original-url" value={link.originalUrl} readOnly disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Custom slug</Label>
              <Input id="edit-slug" value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLink} className="gradient-bg">
              Update Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shortened URL? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLink}>
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

