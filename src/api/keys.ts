import { client } from './client'
import type { ApiKey, Service, ProjectStats } from '@/types'

export const keysApi = {
  list: async (projectId: string): Promise<ApiKey[]> => {
    const { data } = await client.get<ApiKey[]>(`/projects/${projectId}/keys`)
    return data
  },

  create: async (projectId: string, label: string): Promise<ApiKey> => {
    const { data } = await client.post<ApiKey>(`/projects/${projectId}/keys`, { label })
    return data
  },

  revoke: async (projectId: string, keyId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}/keys/${keyId}`)
  },

  rotate: async (projectId: string, keyId: string): Promise<ApiKey> => {
    const { data } = await client.post<ApiKey>(`/projects/${projectId}/keys/${keyId}/rotate`)
    return data
  },
}

export const servicesApi = {
  list: async (projectId: string): Promise<Service[]> => {
    const { data } = await client.get<Service[]>(`/projects/${projectId}/services`)
    return data
  },

  create: async (projectId: string, name: string): Promise<Service> => {
    const { data } = await client.post<Service>(`/projects/${projectId}/services`, { name })
    return data
  },

  revoke: async (projectId: string, serviceId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}/services/${serviceId}`)
  },

  rotate: async (projectId: string, serviceId: string): Promise<Service> => {
    const { data } = await client.post<Service>(
      `/projects/${projectId}/services/${serviceId}/rotate`
    )
    return data
  },
}

export const statsApi = {
  get: async (projectId: string, range: '1d' | '7d' | '30d' = '7d'): Promise<ProjectStats> => {
    const { data } = await client.get<ProjectStats>(`/projects/${projectId}/stats?range=${range}`)
    return data
  },
}
