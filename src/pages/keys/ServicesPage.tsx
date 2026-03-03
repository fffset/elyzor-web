import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Server, Trash2, RotateCcw, Copy, Check } from 'lucide-react'
import { servicesApi } from '@/api/keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Service } from '@/types'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-[--color-muted-foreground] hover:text-white transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function NewServiceDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => servicesApi.create(projectId, name.trim()),
    onSuccess: (svc) => {
      queryClient.invalidateQueries({ queryKey: ['services', projectId] })
      setCreatedKey(svc.key ?? null)
      setName('')
    },
  })

  const handleClose = () => {
    setCreatedKey(null)
    setName('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Service</DialogTitle>
              <DialogDescription>
                Services use <code className="text-xs bg-white/10 px-1 py-0.5 rounded">svc_live_</code> keys for microservice-to-microservice auth.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="svc-name">Service name</Label>
              <Input
                id="svc-name"
                placeholder="e.g. payment-service"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) mutation.mutate()
                }}
              />
            </div>
            {mutation.error && <p className="text-sm text-red-400">Failed to create service</p>}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => mutation.mutate()} disabled={!name.trim() || mutation.isPending}>
                {mutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Service Created</DialogTitle>
              <DialogDescription>
                Copy this key now. You won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-[--color-accent] rounded-md p-3 font-mono text-sm break-all flex items-start gap-2">
              <span className="flex-1">{createdKey}</span>
              <CopyButton value={createdKey} />
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ServiceRow({ service, projectId }: { service: Service; projectId: string }) {
  const [showDelete, setShowDelete] = useState(false)
  const queryClient = useQueryClient()
  const isRevoked = !!service.revokedAt

  const deleteMutation = useMutation({
    mutationFn: () => servicesApi.revoke(projectId, service.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', projectId] })
      setShowDelete(false)
    },
  })

  const rotateMutation = useMutation({
    mutationFn: () => servicesApi.rotate(projectId, service.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services', projectId] }),
  })

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[--color-border] bg-[--color-card] group">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-accent] shrink-0">
          <Server className="h-4 w-4 text-[--color-muted-foreground]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{service.name}</span>
            {isRevoked && <Badge variant="destructive" className="text-xs">Revoked</Badge>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono text-[--color-muted-foreground]">
              svc_live_{service.publicPart.slice(0, 6)}{'•'.repeat(16)}
            </span>
            <CopyButton value={`svc_live_${service.publicPart}`} />
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[--color-muted-foreground] hover:text-white"
            disabled={isRevoked || rotateMutation.isPending}
            onClick={() => rotateMutation.mutate()}
            title="Rotate key"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[--color-muted-foreground] hover:text-red-400"
            disabled={isRevoked}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={(o) => !o && setShowDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Service</DialogTitle>
            <DialogDescription>
              This will immediately revoke{' '}
              <span className="font-semibold text-white">{service.name}</span>. Any service using
              this key will be rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Revoking…' : 'Revoke Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ServicesPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', projectId],
    queryFn: () => servicesApi.list(projectId!),
    enabled: !!projectId,
  })

  const activeServices = services.filter((s) => !s.revokedAt)
  const revokedServices = services.filter((s) => !!s.revokedAt)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-[--color-muted-foreground] mt-1">
            Manage <code className="text-xs bg-white/10 px-1 py-0.5 rounded">svc_live_</code> microservice credentials
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Service
        </Button>
      </div>

      <NewServiceDialog projectId={projectId!} open={createOpen} onClose={() => setCreateOpen(false)} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-[--color-border] bg-[--color-card] animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[--color-border] rounded-xl">
          <Server className="h-10 w-10 text-[--color-muted-foreground] mb-3" />
          <p className="font-medium">No services yet</p>
          <p className="text-sm text-[--color-muted-foreground] mt-1">
            Create a service identity for microservice-to-microservice auth
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeServices.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[--color-muted-foreground] font-medium">
                  Active — {activeServices.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {activeServices.map((svc) => (
                  <ServiceRow key={svc.id} service={svc} projectId={projectId!} />
                ))}
              </CardContent>
            </Card>
          )}
          {revokedServices.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[--color-muted-foreground] font-medium">
                  Revoked — {revokedServices.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {revokedServices.map((svc) => (
                  <ServiceRow key={svc.id} service={svc} projectId={projectId!} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
