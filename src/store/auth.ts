import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/api/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { accessToken } = await authApi.login(email, password)
        localStorage.setItem('accessToken', accessToken)
        set({ accessToken, isAuthenticated: true })
        const user = await authApi.me()
        set({ user })
      },

      register: async (email, password) => {
        const { accessToken } = await authApi.register(email, password)
        localStorage.setItem('accessToken', accessToken)
        set({ accessToken, isAuthenticated: true })
        const user = await authApi.me()
        set({ user })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // ignore
        }
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        const user = await authApi.me()
        set({ user, isAuthenticated: true })
      },
    }),
    {
      name: 'elyzor-auth',
      partialize: (state) => ({ accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
)
