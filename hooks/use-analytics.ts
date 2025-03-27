"use client"

import { useCallback, useMemo, useEffect, useState } from "react"

import type { AnalyticsData, DailyClickData, LinkData, ReferrerData } from "@/types"

export function useAnalytics(links: LinkData[]) {
  const [isLoading, setIsLoading] = useState(false)
  const [clickData, setClickData] = useState<DailyClickData[]>([])
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([])

  // Calculate basic analytics
  const analytics: AnalyticsData = useMemo(() => {
    const totalLinks = links.length
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
    const clickRate = totalLinks > 0 ? totalClicks / totalLinks : 0
    const activeLinks = links.filter((link) => link.clicks > 0).length

    return {
      totalLinks,
      totalClicks,
      clickRate,
      activeLinks,
    }
  }, [links])

  // Fetch real click data from Firestore (in a real app)
  useEffect(() => {
    // This would be replaced with actual analytics data fetching
    // For demo purposes, we'll generate the data
    generateDailyClickData()
    generateReferrerData()
  }, [links])

  // Generate daily click data for the last 7 days
  const generateDailyClickData = useCallback(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    // Initialize data structure with zeros
    const clicksByDay: Record<string, number> = {}
    last7Days.forEach((day) => {
      clicksByDay[day] = 0
    })

    // Distribute clicks across days
    links.forEach((link) => {
      const totalClicks = link.clicks
      let remainingClicks = totalClicks

      for (let i = 0; i < last7Days.length && remainingClicks > 0; i++) {
        const day = last7Days[i]
        const dayClicks = Math.floor(Math.random() * Math.min(remainingClicks, totalClicks / 3)) + 1
        clicksByDay[day] += dayClicks
        remainingClicks -= dayClicks
      }

      // Assign any remaining clicks to the most recent day
      if (remainingClicks > 0 && last7Days.length > 0) {
        clicksByDay[last7Days[last7Days.length - 1]] += remainingClicks
      }
    })

    const data = last7Days.map((day) => ({
      date: day,
      clicks: clicksByDay[day],
    }))

    setClickData(data)
  }, [links])

  // Generate top referrers data
  const generateReferrerData = useCallback(() => {
    // In a real app, this would come from actual analytics data
    const referrers: ReferrerData[] = [
      { domain: "google.com", count: Math.floor(analytics.totalClicks * 0.4) },
      { domain: "twitter.com", count: Math.floor(analytics.totalClicks * 0.25) },
      { domain: "facebook.com", count: Math.floor(analytics.totalClicks * 0.15) },
      { domain: "linkedin.com", count: Math.floor(analytics.totalClicks * 0.1) },
      { domain: "github.com", count: Math.floor(analytics.totalClicks * 0.05) },
    ]

    setReferrerData(referrers.filter((r) => r.count > 0).sort((a, b) => b.count - a.count))
  }, [analytics.totalClicks])

  // Get daily click data
  const getDailyClickData = useCallback(() => {
    return clickData
  }, [clickData])

  // Get top referrers
  const getTopReferrers = useCallback(() => {
    return referrerData
  }, [referrerData])

  return {
    analytics,
    isLoading,
    getDailyClickData,
    getTopReferrers,
  }
}

