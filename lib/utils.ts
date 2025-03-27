import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random slug with configurable length and character set
export function generateSlug(length = 6, useSpecialChars = false) {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  // Add special characters if requested
  if (useSpecialChars) {
    characters += "-_"
  }

  let result = ""
  const charactersLength = characters.length

  // Ensure the first character is a letter (for better readability)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  result += letters.charAt(Math.floor(Math.random() * letters.length))

  // Generate the rest of the slug
  for (let i = 1; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

// Format a date string to a readable format
export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Format a number with commas
export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num)
}

// Truncate a string to a specified length
export function truncateString(str: string, maxLength: number) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

// Validate a URL
export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

// Extract domain from URL
export function extractDomain(url: string) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch (error) {
    return url
  }
}

