"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { Link2 } from "lucide-react"

import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

export default function RedirectPage({ params }: { params: { slug: string } }) {
  const { slug } = useParams(params)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      try {
        // Find the link with the given slug
        const q = query(collection(db, "links"), where("slug", "==", slug))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError("Link not found")
          setLoading(false)
          return
        }

        const linkDoc = querySnapshot.docs[0]
        const linkData = linkDoc.data()
        console.log(linkData.originalUrl)
        setOriginalUrl(linkData.originalUrl)

        // Collect analytics data
        const referrer = document.referrer || "direct"
        const userAgent = navigator.userAgent
        const language = navigator.language
        const screenSize = `${window.screen.width}x${window.screen.height}`
        const timestamp = new Date().toISOString()

        // Update click count
        await updateDoc(doc(db, "links", linkDoc.id), {
          clicks: increment(1),
          lastClickedAt: timestamp,
        })

        // Store detailed analytics
        await addDoc(collection(db, "analytics"), {
          linkId: linkDoc.id,
          slug: slug,
          timestamp: serverTimestamp(),
          referrer: referrer,
          userAgent: userAgent,
          language: language,
          screenSize: screenSize,
          // In a real app, you would also collect:
          // country: detected from IP,
          // city: detected from IP,
          // device: parsed from user agent,
          // browser: parsed from user agent,
          // os: parsed from user agent
        })

        // Redirect to the original URL
        window.location.href = linkData.originalUrl
      } catch (error) {
        console.error("Error redirecting:", error)
        setError("An error occurred while redirecting")
        setLoading(false)
      }
    }

    redirectToOriginalUrl()
  }, [slug])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Link Not Found</h1>
          <p className="text-muted-foreground">
            The shortened URL you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <a href="/">Go to Homepage</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 className="text-xl font-semibold">Redirecting...</h1>
        <p className="text-muted-foreground">
          You are being redirected to{" "}
          {originalUrl ? (
            <span className="font-medium truncate block max-w-xs">{originalUrl}</span>
          ) : (
            "the original URL"
          )}
        </p>
      </div>
    </div>
  )
}

