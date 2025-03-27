"use client"

import { useCallback, useState } from "react"
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, onSnapshot } from "firebase/firestore"

import type { LinkData } from "@/types"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"

export function useLinks() {
  const [links, setLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to format Firestore data
  const formatLinkData = useCallback((doc: any): LinkData => {
    const data = doc.data()
    return {
      id: doc.id,
      originalUrl: data.originalUrl,
      shortUrl: data.shortUrl,
      slug: data.slug,
      userId: data.userId,
      createdAt: data.createdAt,
      clicks: data.clicks || 0,
      lastClickedAt: data.lastClickedAt || null,
      tags: data.tags || [],
      isPublic: data.isPublic ?? true,
    }
  }, [])

  const fetchLinks = useCallback(
    async (userId: string) => {
      setLoading(true)
      setError(null)

      try {
        const q = query(collection(db, "links"), where("userId", "==", userId))

        const querySnapshot = await getDocs(q)

        const linksData: LinkData[] = []
        querySnapshot.forEach((doc) => {
          linksData.push(formatLinkData(doc))
        })

        // Sort by creation date (newest first)
        linksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setLinks(linksData)
        return linksData
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch links"
        setError(errorMessage)
        toast({
          title: "Error fetching links",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      } finally {
        setLoading(false)
      }
    },
    [formatLinkData, toast],
  )

  const subscribeToLinks = useCallback(
    (userId: string) => {
      setLoading(true)

      const q = query(collection(db, "links"), where("userId", "==", userId))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const linksData: LinkData[] = []
          snapshot.forEach((doc) => {
            linksData.push(formatLinkData(doc))
          })

          // Sort by creation date (newest first)
          linksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

          setLinks(linksData)
          setLoading(false)
        },
        (error) => {
          setError(error.message)
          toast({
            title: "Error loading links",
            description: error.message,
            variant: "destructive",
          })
          setLoading(false)
        },
      )

      // Return unsubscribe function
      return unsubscribe
    },
    [formatLinkData, toast],
  )

  const createLink = useCallback(
    async (userId: string, originalUrl: string, customSlug?: string, tags?: string[]) => {
      setLoading(true)
      setError(null)

      try {
        // Validate URL
        try {
          new URL(originalUrl)
        } catch (error) {
          throw new Error("Please enter a valid URL including http:// or https://")
        }

        // Check if custom slug is already in use
        if (customSlug) {
          const slugQuery = query(collection(db, "links"), where("slug", "==", customSlug))
          const slugSnapshot = await getDocs(slugQuery)

          if (!slugSnapshot.empty) {
            throw new Error("This custom slug is already in use. Please choose another one.")
          }
        }

        // Generate a slug if custom slug is not provided
        const slug = customSlug || generateSlug()
        const shortUrl = `${window.location.origin}/s/${slug}`

        const newLink = {
          originalUrl,
          shortUrl,
          slug,
          userId,
          createdAt: new Date().toISOString(),
          clicks: 0,
          tags: tags || [],
          isPublic: true,
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`
        const optimisticLink = { id: tempId, ...newLink } as LinkData
        setLinks((prev) => [optimisticLink, ...prev])

        const docRef = await addDoc(collection(db, "links"), newLink)

        toast({
          title: "Link created",
          description: "Your shortened URL has been created successfully.",
        })

        // Update the optimistic link with the real ID
        setLinks((prev) => prev.map((link) => (link.id === tempId ? { ...link, id: docRef.id } : link)))

        return { id: docRef.id, ...newLink } as LinkData
      } catch (error: any) {
        const errorMessage = error.message || "Failed to create link"
        setError(errorMessage)

        // Remove the optimistic link if there was an error
        setLinks((prev) => prev.filter((link) => !link.id.startsWith("temp-")))

        toast({
          title: "Error creating link",
          description: errorMessage,
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateLink = useCallback(
    async (linkId: string, updates: Partial<LinkData>) => {
      setLoading(true)
      setError(null)

      try {
        // If slug is being updated, check if it's already in use
        if (updates.slug) {
          const slugQuery = query(collection(db, "links"), where("slug", "==", updates.slug))
          const slugSnapshot = await getDocs(slugQuery)

          if (!slugSnapshot.empty) {
            const existingDoc = slugSnapshot.docs[0]
            if (existingDoc.id !== linkId) {
              throw new Error("This custom slug is already in use. Please choose another one.")
            }
          }

          // Update the shortUrl as well
          updates.shortUrl = `${window.location.origin}/s/${updates.slug}`
        }

        // Optimistic update
        setLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, ...updates } : link)))

        await updateDoc(doc(db, "links", linkId), updates)

        toast({
          title: "Link updated",
          description: "Your shortened URL has been updated successfully.",
        })

        return true
      } catch (error: any) {
        const errorMessage = error.message || "Failed to update link"
        setError(errorMessage)

        // Revert optimistic update
        fetchLinks(links[0]?.userId)

        toast({
          title: "Error updating link",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchLinks, links, toast],
  )

  const deleteLink = useCallback(
    async (linkId: string) => {
      setLoading(true)
      setError(null)

      try {
        // Optimistic delete
        const deletedLink = links.find((link) => link.id === linkId)
        setLinks((prev) => prev.filter((link) => link.id !== linkId))

        await deleteDoc(doc(db, "links", linkId))

        toast({
          title: "Link deleted",
          description: "Your shortened URL has been deleted successfully.",
        })

        return true
      } catch (error: any) {
        const errorMessage = error.message || "Failed to delete link"
        setError(errorMessage)

        // Revert optimistic delete
        fetchLinks(links[0]?.userId)

        toast({
          title: "Error deleting link",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchLinks, links, toast],
  )

  return {
    links,
    loading,
    error,
    fetchLinks,
    subscribeToLinks,
    createLink,
    updateLink,
    deleteLink,
  }
}

