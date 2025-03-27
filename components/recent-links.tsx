import { ExternalLink } from "lucide-react"

import type { LinkData } from "@/app/dashboard/page"

interface RecentLinksProps {
  links: LinkData[]
}

export function RecentLinks({ links }: RecentLinksProps) {
  return (
    <div className="space-y-8">
      {links.length > 0 ? (
        links.map((link) => (
          <div key={link.id} className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{link.slug}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{link.originalUrl}</p>
            </div>
            <div className="ml-auto font-medium">{link.clicks} clicks</div>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rounded-md p-2 hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open link</span>
            </a>
          </div>
        ))
      ) : (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No links created yet</p>
        </div>
      )}
    </div>
  )
}

