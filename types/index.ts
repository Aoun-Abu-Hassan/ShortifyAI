export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

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

export interface AnalyticsData {
  totalClicks: number
  totalLinks: number
  clickRate: number
  activeLinks: number
}

export interface ReferrerData {
  domain: string
  count: number
}

export interface DailyClickData {
  date: string
  clicks: number
}

export type ThemeMode = "light" | "dark"

