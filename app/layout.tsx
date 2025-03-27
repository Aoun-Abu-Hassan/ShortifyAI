import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShortifyAI - Intelligent URL Shortener with Analytics",
  description:
    "Create memorable, SEO-friendly short links with AI-powered intelligence. Track analytics and manage all your links in one place.",
  keywords: "URL shortener, link shortening, AI URL shortener, link analytics, custom short links, URL tracking",
  authors: [{ name: "ShortifyAI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shortifyai.com",
    title: "ShortifyAI - Intelligent URL Shortener with Analytics",
    description:
      "Create memorable, SEO-friendly short links with AI-powered intelligence. Track analytics and manage all your links in one place.",
    siteName: "ShortifyAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShortifyAI - Intelligent URL Shortener",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShortifyAI - Intelligent URL Shortener with Analytics",
    description:
      "Create memorable, SEO-friendly short links with AI-powered intelligence. Track analytics and manage all your links in one place.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://shortifyai.com" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <SiteFooter />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}



import './globals.css'