import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, KeyRound, Server } from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ProjectDetailLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const project = projects?.find((p) => p.id === projectId)

  const tabs = [
    { to: `/projects/${projectId}/keys`, label: 'API Keys', icon: KeyRound },
    { to: `/projects/${projectId}/services`, label: 'Services', icon: Server },
  ]

  return (
    <div className="space-y-6">
      {/* Back + project name */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{project?.name ?? 'Project'}</h1>
          <p className="text-xs text-[--color-muted-foreground] font-mono mt-0.5">{projectId}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-[--color-border]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-[--color-muted-foreground] hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
