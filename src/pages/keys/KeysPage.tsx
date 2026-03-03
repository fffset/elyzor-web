import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, KeyRound, Trash2, RotateCcw, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { keysApi } from '@/api/keys'
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
import type { ApiKey } from '@/types'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-[--color-muted-foreground] hover:text-white transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function NewKeyDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string
  open: boolean
  onClose: () => void
}) {
  const [label, setLabel] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => keysApi.create(projectId, label.trim()),
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ['keys', projectId] })
      setCreatedKey(key.key ?? null)
      setLabel('')
    },
  })

  const handleClose = () => {
    setCreatedKey(null)
    setLabel('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your key a descriptive label to identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="key-label">Label</Label>
              <Input
                id="key-label"
                placeholder="e.g. production-server"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && label.trim()) mutation.mutate()
                }}
              />
            </div>
            {mutation.error && (
              <p className="text-sm text-red-400">Failed to create key</p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => mutation.mutate()} disabled={!label.trim() || mutation.isPending}>
                {mutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
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

function KeyRow({ apiKey, projectId }: { apiKey: ApiKey; projectId: string }) {
  const [showDelete, setShowDelete] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => keysApi.revoke(projectId, apiKey.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys', projectId] })
      setShowDelete(false)
    },
  })

  const rotateMutation = useMutation({
    mutationFn: () => keysApi.rotate(projectId, apiKey.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keys', projectId] }),
  })

  const displayKey = showKey ? `sk_live_${apiKey.publicPart}...` : `sk_live_${apiKey.publicPart.slice(0, 6)}${'•'.repeat(16)}`

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[--color-border] bg-[--color-card] group">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-accent] shrink-0">
          <KeyRound className="h-4 w-4 text-[--color-muted-foreground]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{apiKey.label}</span>
            {apiKey.revoked && <Badge variant="destructive" className="text-xs">Revoked</Badge>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono text-[--color-muted-foreground]">{displayKey}</span>
            <button
              className="text-[--color-muted-foreground] hover:text-white transition-colors"
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
            <CopyButton value={`sk_live_${apiKey.publicPart}`} />
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[--color-muted-foreground] hover:text-white"
            disabled={apiKey.revoked || rotateMutation.isPending}
            onClick={() => rotateMutation.mutate()}
            title="Rotate key"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[--color-muted-foreground] hover:text-red-400"
            disabled={apiKey.revoked}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={(o) => !o && setShowDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              This will immediately revoke{' '}
              <span className="font-semibold text-white">{apiKey.label}</span>. Any requests using
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
              {deleteMutation.isPending ? 'Revoking…' : 'Revoke Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function KeysPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['keys', projectId],
    queryFn: () => keysApi.list(projectId!),
    enabled: !!projectId,
  })

  const activeKeys = keys.filter((k) => !k.revoked)
  const revokedKeys = keys.filter((k) => k.revoked)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-[--color-muted-foreground] mt-1">
            Manage <code className="text-xs bg-white/10 px-1 py-0.5 rounded">sk_live_</code> credentials
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Key
        </Button>
      </div>

      <NewKeyDialog projectId={projectId!} open={createOpen} onClose={() => setCreateOpen(false)} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-[--color-border] bg-[--color-card] animate-pulse" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[--color-border] rounded-xl">
          <KeyRound className="h-10 w-10 text-[--color-muted-foreground] mb-3" />
          <p className="font-medium">No API keys yet</p>
          <p className="text-sm text-[--color-muted-foreground] mt-1">
            Create your first key to authenticate requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeKeys.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[--color-muted-foreground] font-medium">
                  Active — {activeKeys.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {activeKeys.map((key) => (
                  <KeyRow key={key.id} apiKey={key} projectId={projectId!} />
                ))}
              </CardContent>
            </Card>
          )}
          {revokedKeys.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[--color-muted-foreground] font-medium">
                  Revoked — {revokedKeys.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {revokedKeys.map((key) => (
                  <KeyRow key={key.id} apiKey={key} projectId={projectId!} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
