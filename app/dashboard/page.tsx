"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Link2, Plus, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { LinkCreateButton } from "@/components/link-create-button"
import { LinkItem } from "@/components/link-item"
import { Overview } from "@/components/overview"
import { RecentLinks } from "@/components/recent-links"
import { TopReferrers } from "@/components/top-referrers"
import { useAuth } from "@/contexts/auth-context"
import { useLinks } from "@/hooks/use-links"
import { useAnalytics } from "@/hooks/use-analytics"

export interface LinkData {
  id: string
  originalUrl: string
  shortUrl: string
  slug: string
  userId: string
  createdAt: string
  clicks: number
  lastClickedAt?: string
  tags?: string[]
  isPublic?: boolean
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { links, loading: linksLoading, error, subscribeToLinks } = useLinks()
  const { analytics, isLoading: analyticsLoading, getDailyClickData, getTopReferrers } = useAnalytics(links)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const router = useRouter()

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const unsubscribe = subscribeToLinks(user.uid)
      return () => unsubscribe()
    }
  }, [authLoading, user, router, subscribeToLinks])

  // Get all unique tags from links
  const allTags = [...new Set(links.flatMap((link) => link.tags || []))]

  // Filter links based on search term and selected tag
  const filteredLinks = links.filter((link) => {
    const matchesSearch = searchTerm
      ? link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.slug.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesTag = selectedTag ? link.tags?.includes(selectedTag) : true

    return matchesSearch && matchesTag
  })

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your shortened URLs and view analytics.">
        <LinkCreateButton />
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalLinks > 0
                ? `+${Math.min(analytics.totalLinks, 1)} from last hour`
                : "No links created yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalClicks > 0 ? `+${Math.min(analytics.totalClicks, 5)} from last hour` : "No clicks yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Avg. clicks per link</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.activeLinks / Math.max(analytics.totalLinks, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Click activity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {analyticsLoading ? (
                  <div className="flex h-[350px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <Overview data={getDailyClickData()} />
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Links</CardTitle>
                <CardDescription>You created {links.length} links in total.</CardDescription>
              </CardHeader>
              <CardContent>
                {linksLoading ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <RecentLinks links={links.slice(0, 5)} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Links</CardTitle>
              <CardDescription>Manage all your shortened URLs.</CardDescription>
            </CardHeader>
            <CardContent>
              {linksLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : links.length > 0 ? (
                <>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Search links..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>

                    {allTags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-2">
                          {selectedTag && (
                            <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedTag(null)}>
                              Clear
                            </Badge>
                          )}
                          {allTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant={selectedTag === tag ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {filteredLinks.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLinks.map((link) => (
                        <LinkItem key={link.id} link={link} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">No links match your search criteria</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Link2 className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No links created yet</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    You haven&apos;t created any shortened URLs yet. Create your first one now.
                  </p>
                  <LinkCreateButton>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Create Link
                    </Button>
                  </LinkCreateButton>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>See where your traffic is coming from.</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <TopReferrers data={getTopReferrers()} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

