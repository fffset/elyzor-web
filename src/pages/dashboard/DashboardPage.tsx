import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, CheckCircle2, Gauge, Clock, Activity } from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { statsApi } from '@/api/keys'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Range = '1d' | '7d' | '30d'

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-[--color-muted-foreground]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-[--color-muted-foreground] mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [range, setRange] = useState<Range>('7d')

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const firstProject = projects?.[0]

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['stats', firstProject?.id, range],
    queryFn: () => statsApi.get(firstProject!.id, range),
    enabled: !!firstProject,
  })

  const ranges: Range[] = ['1d', '7d', '30d']
  const rangeLabel: Record<Range, string> = { '1d': 'Last 24h', '7d': 'Last 7 days', '30d': 'Last 30 days' }

  if (loadingProjects) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-60 rounded bg-white/5 animate-pulse" />
      </div>
    )
  }

  if (!firstProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity className="h-12 w-12 text-[--color-muted-foreground] mb-4" />
        <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
        <p className="text-[--color-muted-foreground] text-sm">
          Create your first project to start managing API keys.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[--color-muted-foreground] mt-1">
            {firstProject.name} — usage overview
          </p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 border border-[--color-border] rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-white text-black'
                  : 'text-[--color-muted-foreground] hover:text-white'
              }`}
            >
              {rangeLabel[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Requests"
            value={stats.totalRequests.toLocaleString()}
            icon={TrendingUp}
          />
          <StatCard
            label="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
            icon={CheckCircle2}
            sub={`${stats.rateLimitHits} rate limit hits`}
          />
          <StatCard
            label="Rate Limit Hits"
            value={stats.rateLimitHits.toLocaleString()}
            icon={Gauge}
          />
          <StatCard
            label="Avg Latency"
            value={`${stats.avgLatencyMs.toFixed(1)}ms`}
            icon={Clock}
          />
        </div>
      ) : null}

      {/* Daily activity */}
      {stats && stats.daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.daily.map((day) => {
                const total = day.success + day.error
                const successPct = total > 0 ? (day.success / total) * 100 : 0
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-[--color-muted-foreground] w-20 shrink-0">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-2 bg-[--color-accent] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${successPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[--color-muted-foreground] w-16 text-right">
                      {total.toLocaleString()} req
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Keys + Services */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.topKeys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.topKeys.map((k) => (
                  <div key={k.keyId} className="flex items-center justify-between">
                    <span className="text-sm font-mono text-[--color-muted-foreground] truncate max-w-[200px]">
                      {k.label}
                    </span>
                    <Badge variant="secondary">{k.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {stats.topServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.topServices.map((s) => (
                  <div key={s.serviceId} className="flex items-center justify-between">
                    <span className="text-sm text-[--color-muted-foreground] truncate max-w-[200px]">
                      {s.name}
                    </span>
                    <Badge variant="secondary">{s.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
