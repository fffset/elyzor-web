import { client } from './client'
import type { Project } from '@/types'

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await client.get<Project[]>('/projects')
    return data
  },

  create: async (name: string): Promise<Project> => {
    const { data } = await client.post<Project>('/projects', { name })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/projects/${id}`)
  },
}
