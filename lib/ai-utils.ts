import { generateSlug } from "@/lib/utils"

// Function to extract keywords from a URL
export function extractKeywords(url: string): string[] {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace("www.", "")
    const path = urlObj.pathname.split("/").filter(Boolean)

    // Extract words from domain
    const domainWords = domain
      .split(".")
      .filter((part) => part.length > 2 && !["com", "org", "net", "io", "co"].includes(part))
      .join("-")
      .split("-")

    // Extract words from path
    const pathWords = path
      .join("-")
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .split("-")
      .filter((word) => word.length > 2)

    // Combine and remove duplicates
    const allWords = [...new Set([...domainWords, ...pathWords])]

    return allWords
  } catch (error) {
    return []
  }
}

// Function to generate AI-powered slug suggestions
export async function generateAiSlug(originalUrl: string): Promise<string> {
  try {
    // Extract keywords from URL
    const keywords = extractKeywords(originalUrl)

    if (keywords.length === 0) {
      return generateSlug()
    }

    // Use the most meaningful keywords (up to 2)
    const meaningfulKeywords = keywords.filter((word) => word.length > 3).slice(0, 2)

    if (meaningfulKeywords.length === 0) {
      return generateSlug()
    }

    // Create a slug from the keywords
    const baseSlug = meaningfulKeywords
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    // Add a random suffix to make it unique
    const randomSuffix = Math.floor(Math.random() * 1000)

    return `${baseSlug}-${randomSuffix}`
  } catch (error) {
    // Fallback to random slug
    return generateSlug()
  }
}

// Function to generate multiple AI slug suggestions
export async function generateAiSuggestions(originalUrl: string, count = 3): Promise<string[]> {
  const suggestions: string[] = []

  try {
    // Extract keywords from URL
    const keywords = extractKeywords(originalUrl)

    if (keywords.length === 0) {
      // Fallback to random slugs
      for (let i = 0; i < count; i++) {
        suggestions.push(generateSlug())
      }
      return suggestions
    }

    // Generate different combinations of keywords
    for (let i = 0; i < count; i++) {
      if (i === 0) {
        // First suggestion: use the most meaningful keywords
        const meaningfulKeywords = keywords
          .filter((word) => word.length > 3)
          .slice(0, 2)
          .join("-")
          .toLowerCase()

        if (meaningfulKeywords) {
          suggestions.push(`${meaningfulKeywords}-${Math.floor(Math.random() * 1000)}`)
          continue
        }
      }

      if (i === 1 && keywords.length > 0) {
        // Second suggestion: use the domain name
        const urlObj = new URL(originalUrl)
        const domain = urlObj.hostname.replace("www.", "").split(".")[0]

        if (domain && domain.length > 2) {
          suggestions.push(`${domain}-${Math.floor(Math.random() * 1000)}`)
          continue
        }
      }

      // Additional suggestions: random combinations
      const shuffled = [...keywords].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, Math.min(2, shuffled.length))

      if (selected.length > 0) {
        const slug = selected
          .join("-")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")

        suggestions.push(`${slug}-${Math.floor(Math.random() * 1000)}`)
      } else {
        suggestions.push(generateSlug())
      }
    }

    return suggestions
  } catch (error) {
    // Fallback to random slugs
    for (let i = 0; i < count; i++) {
      suggestions.push(generateSlug())
    }
    return suggestions
  }
}

