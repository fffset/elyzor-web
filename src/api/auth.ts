import { client } from './client'
import type { User, AuthTokens } from '@/types'

export const authApi = {
  register: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await client.post<AuthTokens>('/auth/register', { email, password })
    return data
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await client.post<AuthTokens>('/auth/login', { email, password })
    return data
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout')
  },

  me: async (): Promise<User> => {
    const { data } = await client.get<User>('/auth/me')
    return data
  },
}
