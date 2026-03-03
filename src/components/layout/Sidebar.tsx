import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[--color-border] bg-[--color-card] px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-1 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Elyzor</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              location.pathname.startsWith(to)
                ? 'bg-[--color-accent] text-white'
                : 'text-[--color-muted-foreground] hover:bg-[--color-accent] hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="my-4" />

      {/* User + Logout */}
      <div className="space-y-1">
        <div className="px-3 py-1">
          <p className="text-xs text-[--color-muted-foreground]">Signed in as</p>
          <p className="text-sm font-medium text-[--color-foreground] truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-[--color-muted-foreground] hover:text-white"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
