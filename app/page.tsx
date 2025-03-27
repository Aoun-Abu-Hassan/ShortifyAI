import Link from "next/link"
import { ArrowRight, BarChart3, Link2, Sparkles } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { ShortenForm } from "@/components/shorten-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "ShortifyAI - Intelligent URL Shortener with Analytics",
  description:
    "Create memorable, SEO-friendly short links with AI-powered intelligence. Track analytics and manage all your links in one place.",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Shorten URLs with <span className="gradient-text">AI-powered</span> intelligence
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Create memorable, SEO-friendly short links with our AI-powered URL shortener. Track analytics and
                    manage all your links in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="gradient-bg">
                    <Link href="/signup">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-6 shadow-xl transition-all hover:shadow-lg">
                  <ShortenForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Key Features</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to manage and optimize your shortened URLs
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Link2 className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Custom Short Links</h3>
                <p className="text-muted-foreground">Create branded, memorable short URLs that reflect your content.</p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-bold">AI-Powered Suggestions</h3>
                <p className="text-muted-foreground">
                  Get intelligent, SEO-friendly slug suggestions based on your URL content.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Track clicks, referrers, and geographic data for all your shortened links.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Ready to get started?</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Create your free account and start shortening URLs in seconds.
              </p>
              <Button asChild size="lg" className="mt-4 gradient-bg">
                <Link href="/signup">
                  Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

