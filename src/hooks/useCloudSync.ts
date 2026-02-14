import { useCallback, useEffect, useRef } from 'react'
import { dbService } from '@/services/db.service'
import { useViewingHistoryStore } from '@/store/viewingHistoryStore'
import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useCloudSync() {
  const { username } = useAuthStore()
  const isSyncEnabled = dbService.isCloudSyncEnabled()

  const { viewingHistory, setViewingHistory } = useViewingHistoryStore()
  const { network, search, playback, system, setAllSettings } = useSettingStore()
  const { videoAPIs, setApis } = useApiStore()

  const isInitialized = useRef(false)
  const isSyncing = useRef(false)

  const pullFromCloud = useCallback(async () => {
    if (!isSyncEnabled || isSyncing.current) return

    isSyncing.current = true
    try {
      const cloudData = await dbService.getUserData()

      if (cloudData.viewingHistory && cloudData.viewingHistory.length > 0) {
        setViewingHistory(cloudData.viewingHistory)
      }

      if (cloudData.settings) {
        setAllSettings(cloudData.settings)
      }

      if (cloudData.videoApis && cloudData.videoApis.length > 0) {
        setApis(cloudData.videoApis)
      }

      toast.success('数据同步成功')
    } catch (error) {
      console.error('Failed to pull data from cloud:', error)
    } finally {
      isSyncing.current = false
    }
  }, [isSyncEnabled, setViewingHistory, setAllSettings, setApis])

  const pushToCloud = useCallback(async () => {
    if (!isSyncEnabled || isSyncing.current) return

    isSyncing.current = true
    try {
      await dbService.setVideoApis(videoAPIs)

      await dbService.setSettings({ network, search, playback, system })

      if (viewingHistory.length > 0) {
        const latest = viewingHistory[0]
        await dbService.addViewingHistory(latest)
      }
    } catch (error) {
      console.error('Failed to push data to cloud:', error)
    } finally {
      isSyncing.current = false
    }
  }, [isSyncEnabled, videoAPIs, network, search, playback, system, viewingHistory])

  useEffect(() => {
    if (isSyncEnabled && username && !isInitialized.current) {
      isInitialized.current = true
      pullFromCloud()
    }
  }, [isSyncEnabled, username, pullFromCloud])

  useEffect(() => {
    if (!isSyncEnabled || !isInitialized.current) return

    const timeoutId = setTimeout(() => {
      pushToCloud()
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [viewingHistory, network, search, playback, system, videoAPIs, isSyncEnabled, pushToCloud])

  return {
    isSyncEnabled,
    pullFromCloud,
    pushToCloud,
  }
}
