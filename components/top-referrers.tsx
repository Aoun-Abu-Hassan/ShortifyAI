import type { ReferrerData } from "@/types"

interface TopReferrersProps {
  data: ReferrerData[]
}

export function TopReferrers({ data }: TopReferrersProps) {
  // Calculate the total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      {data.length > 0 ? (
        data.map((referrer) => {
          const percentage = total > 0 ? (referrer.count / total) * 100 : 0

          return (
            <div key={referrer.domain} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{referrer.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{referrer.count} clicks</span>
                  <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No referrer data available</p>
        </div>
      )}
    </div>
  )
}

