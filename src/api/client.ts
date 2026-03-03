import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1'

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for refresh token cookie
})

// Inject access token from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize _id → id recursively
function normalizeIds(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(normalizeIds)
  if (data !== null && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if ('_id' in obj && !('id' in obj)) obj.id = obj._id
    for (const key of Object.keys(obj)) obj[key] = normalizeIds(obj[key])
  }
  return data
}

client.interceptors.response.use((res) => {
  res.data = normalizeIds(res.data)
  return res
})

// Auto-refresh on 401
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(client(original))
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken: string = data.accessToken
        localStorage.setItem('accessToken', newToken)
        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return client(original)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
