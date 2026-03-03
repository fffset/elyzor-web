# CLAUDE.md — elyzor-web

Bu dosya, Claude Code'un bu projede çalışırken bilmesi gereken kuralları ve mimari kararları içerir.

---

## Proje

Elyzor web dashboard. `elyzor` backend'inin React arayüzü.

**Backend repo:** `../elyzor` (Node.js + Express + MongoDB + Redis)

---

## Stack

- **Vite 7** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — `@tailwindcss/vite` plugin, `@theme` blokları `index.css` içinde
- **Radix UI** primitives — shadcn/ui tarzı, hand-written komponentler `src/components/ui/`
- **React Router v7** — `BrowserRouter`, nested routes
- **TanStack Query v5** — sunucu state yönetimi
- **Axios** — HTTP, interceptor'lar `src/api/client.ts` içinde
- **Zustand** — auth state, localStorage'a persist edilir
- `@` alias → `src/`

---

## Klasör Yapısı

```
src/
├── api/            HTTP katmanı (client + endpoint modülleri)
├── components/
│   ├── layout/     AppLayout, Sidebar, ProtectedRoute, ProjectDetailLayout
│   └── ui/         Temel UI komponentleri (Button, Input, Card, Dialog...)
├── pages/          Ekranlar (auth, dashboard, projects, keys)
├── store/          Zustand store'ları
└── types/          Tüm TypeScript tipleri (index.ts)
```

---

## Kritik Kurallar

### Backend'in döndürdüğü alan isimleri
- Backend Mongoose document döndürür → `_id` olarak gelir
- `src/api/client.ts`'deki `normalizeIds()` interceptor'ı tüm response'larda `_id`'yi `id`'ye dönüştürür
- **Yeni tip eklerken `id: string` kullan, `_id` yazma**

### Backend Stats response yapısı
Backend `GET /v1/projects/:id/stats` şu yapıyı döndürür:
```ts
{
  totalRequests: number
  successRate: number
  rateLimitHits: number
  avgLatencyMs: number
  requestsByDay: Array<{ date: string; count: number; errors: number }>
  topKeys: Array<{ keyId: string; keyType: 'api' | 'service'; requests: number }>
}
```
`daily`, `topServices` gibi alanlar **yoktur**.

### Kimlik Doğrulama
- Access token → `localStorage` key: `accessToken`
- Refresh token → HTTP-only cookie (backend set eder)
- 401 interceptor → token yenile → isteği tekrarla → başarısızsa `/login`
- Zustand auth store → `src/store/auth.ts` → `isAuthenticated` ile `ProtectedRoute` kontrol eder

### CORS
- Vite proxy `/v1` → `http://localhost:3000` (`vite.config.ts`)
- `VITE_API_URL=/v1` (`.env`)
- `withCredentials: true` (cookie için gerekli)

### Revoked key/servis satırları
- Revoked kayıtlarda aksiyon butonları (rotate, delete) **render edilmez** — `disabled` değil, tamamen kaldırılır

---

## Komponentler

### Yeni UI komponenti eklerken
- `src/components/ui/` altına ekle
- Radix UI primitive + Tailwind + `cn()` utility
- CSS custom property'lerini kullan: `text-[--color-muted-foreground]`, `bg-[--color-card]` vb.
- `src/lib/utils.ts`'deki `cn()` fonksiyonu: `clsx` + `tailwind-merge`

### Renk paleti (dark theme)
`src/index.css` içindeki `@theme` bloğunda tanımlı:
- `--color-background` — sayfa arka planı
- `--color-card` — kart arka planı
- `--color-border` — kenarlıklar
- `--color-muted-foreground` — ikincil metin
- `--color-accent` — hover/seçili arka plan

---

## Veri Fetching Kalıpları

### Sorgular
```ts
const { data, isLoading } = useQuery({
  queryKey: ['keys', projectId],
  queryFn: () => keysApi.list(projectId!),
  enabled: !!projectId,
})
```

### Mutation'lar
```ts
const mutation = useMutation({
  mutationFn: () => keysApi.create(projectId, label),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['keys', projectId] })
  },
})
```

### Query key convention
| Veri | Query key |
|---|---|
| Projeler | `['projects']` |
| API key'leri | `['keys', projectId]` |
| Servisler | `['services', projectId]` |
| İstatistikler | `['stats', projectId, range]` |

---

## Routing

```
/login                          → LoginPage (public)
/register                       → RegisterPage (public)
/dashboard                      → DashboardPage (protected)
/projects                       → ProjectsPage (protected)
/projects/:projectId            → ProjectDetailLayout
/projects/:projectId/keys       → KeysPage
/projects/:projectId/services   → ServicesPage
```

`ProtectedRoute` → `isAuthenticated` false ise `/login`'e redirect.

---

## API Endpoint'leri

Tüm istekler `/v1` prefix'i ile gider (Vite proxy üzerinden `localhost:3000`'e).

| Modül | Dosya |
|---|---|
| Auth | `src/api/auth.ts` |
| Projects | `src/api/projects.ts` |
| API Keys + Services + Stats | `src/api/keys.ts` |

---

## Geliştirme

```bash
npm run dev      # Vite dev server (localhost:5174)
npm run build    # TypeScript check + production build
npm run preview  # Build önizleme
```

TypeScript strict modda çalışır. `npm run build` hatasız geçmeli.
