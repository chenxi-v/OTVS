import type { ViewingHistoryItem, VideoApi } from '@/types'

interface UserSettings {
  network: {
    defaultTimeout: number
    defaultRetry: number
  }
  search: {
    isSearchHistoryEnabled: boolean
    isSearchHistoryVisible: boolean
    searchCacheExpiryHours: number
  }
  playback: {
    isViewingHistoryEnabled: boolean
    isViewingHistoryVisible: boolean
    isAutoPlayEnabled: boolean
    defaultEpisodeOrder: 'asc' | 'desc'
    adFilteringEnabled: boolean
  }
  system: {
    isUpdateLogEnabled: boolean
  }
}

interface UserData {
  settings: UserSettings
  viewingHistory: ViewingHistoryItem[]
  videoApis: VideoApi[]
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  latency: number
  timestamp: string
  error?: string
}

class DbService {
  private baseUrl = '/api/db'

  private getUserId(): string | null {
    const authStorage = sessionStorage.getItem('auth-storage')
    if (!authStorage) {
      return null
    }

    try {
      const parsed = JSON.parse(authStorage)
      const username = parsed?.state?.username
      if (username) {
        return `user:${username}`
      }
    } catch {
      return null
    }

    return null
  }

  isCloudSyncEnabled(): boolean {
    return this.getUserId() !== null
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const userId = this.getUserId()
    if (!userId) {
      throw new Error('Cloud sync not enabled: user not authenticated')
    }

    const response = await fetch(`${this.baseUrl}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  async getUserData(): Promise<UserData> {
    return this.request<UserData>('user-data')
  }

  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('settings')
  }

  async setSettings(settings: Partial<UserSettings>): Promise<void> {
    await this.request('settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async getViewingHistory(): Promise<ViewingHistoryItem[]> {
    return this.request<ViewingHistoryItem[]>('viewing-history')
  }

  async addViewingHistory(item: ViewingHistoryItem): Promise<ViewingHistoryItem[]> {
    return this.request<ViewingHistoryItem[]>('viewing-history', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async removeViewingHistory(item: ViewingHistoryItem): Promise<ViewingHistoryItem[]> {
    return this.request<ViewingHistoryItem[]>('viewing-history', {
      method: 'DELETE',
      body: JSON.stringify(item),
    })
  }

  async clearViewingHistory(): Promise<void> {
    await this.request('viewing-history/clear', {
      method: 'POST',
    })
  }

  async getVideoApis(): Promise<VideoApi[]> {
    return this.request<VideoApi[]>('video-apis')
  }

  async setVideoApis(apis: VideoApi[]): Promise<void> {
    await this.request('video-apis', {
      method: 'PUT',
      body: JSON.stringify(apis),
    })
  }

  async addVideoApi(api: VideoApi): Promise<VideoApi[]> {
    return this.request<VideoApi[]>('video-apis/add', {
      method: 'POST',
      body: JSON.stringify(api),
    })
  }

  async removeVideoApi(apiId: string): Promise<VideoApi[]> {
    return this.request<VideoApi[]>('video-apis/remove', {
      method: 'POST',
      body: JSON.stringify({ apiId }),
    })
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      return await this.request<HealthStatus>('health')
    } catch {
      return {
        status: 'unhealthy',
        latency: 0,
        timestamp: new Date().toISOString(),
        error: 'Failed to connect to database API',
      }
    }
  }
}

export const dbService = new DbService()
export type { UserSettings, UserData, HealthStatus }
