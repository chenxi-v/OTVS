import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS, type ThemeMode } from '@/config/settings.config'

interface NetworkSettings {
  defaultTimeout: number
  defaultRetry: number
}

interface SearchSettings {
  isSearchHistoryEnabled: boolean
  isSearchHistoryVisible: boolean
  searchCacheExpiryHours: number
}

interface PlaybackSettings {
  isViewingHistoryEnabled: boolean
  isViewingHistoryVisible: boolean
  isAutoPlayEnabled: boolean
  defaultEpisodeOrder: 'asc' | 'desc'
  adFilteringEnabled: boolean
}

interface SystemSettings {
  isUpdateLogEnabled: boolean
}

interface HomeSettings {
  defaultDataSourceId: string
}

interface ThemeSettings {
  mode: ThemeMode
}

interface SettingState {
  network: NetworkSettings
  search: SearchSettings
  playback: PlaybackSettings
  system: SystemSettings
  home: HomeSettings
  theme: ThemeSettings
}

interface SettingActions {
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void
  setSearchSettings: (settings: Partial<SearchSettings>) => void
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void
  setSystemSettings: (settings: Partial<SystemSettings>) => void
  setHomeSettings: (settings: Partial<HomeSettings>) => void
  setThemeSettings: (settings: Partial<ThemeSettings>) => void
  resetSettings: () => void
  setAllSettings: (settings: {
    network?: NetworkSettings
    search?: SearchSettings
    playback?: PlaybackSettings
    system?: SystemSettings
    home?: HomeSettings
    theme?: ThemeSettings
  }) => void
}

type SettingStore = SettingState & SettingActions

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      immer<SettingStore>(set => ({
        network: DEFAULT_SETTINGS.network,
        search: DEFAULT_SETTINGS.search,
        playback: DEFAULT_SETTINGS.playback,
        system: DEFAULT_SETTINGS.system,
        home: DEFAULT_SETTINGS.home,
        theme: DEFAULT_SETTINGS.theme,

        setNetworkSettings: settings => {
          set(state => {
            state.network = { ...state.network, ...settings }
          })
        },

        setSearchSettings: settings => {
          set(state => {
            state.search = { ...state.search, ...settings }
          })
        },

        setPlaybackSettings: settings => {
          set(state => {
            state.playback = { ...state.playback, ...settings }
          })
        },

        setSystemSettings: settings => {
          set(state => {
            state.system = { ...state.system, ...settings }
          })
        },

        setHomeSettings: settings => {
          set(state => {
            state.home = { ...state.home, ...settings }
          })
        },

        setThemeSettings: settings => {
          set(state => {
            state.theme = { ...state.theme, ...settings }
          })
        },

        resetSettings: () => {
          set(state => {
            state.network = DEFAULT_SETTINGS.network
            state.search = DEFAULT_SETTINGS.search
            state.playback = DEFAULT_SETTINGS.playback
            state.system = DEFAULT_SETTINGS.system
            state.home = DEFAULT_SETTINGS.home
            state.theme = DEFAULT_SETTINGS.theme
          })
        },

        setAllSettings: settings => {
          set(state => {
            if (settings.network) state.network = settings.network
            if (settings.search) state.search = settings.search
            if (settings.playback) state.playback = settings.playback
            if (settings.system) state.system = settings.system
            if (settings.home) state.home = settings.home
            if (settings.theme) state.theme = settings.theme
          })
        },
      })),
      {
        name: 'ouonnki-tv-setting-store',
        version: 3,
        migrate: (persistedState: unknown, version: number) => {
          const state = persistedState as Partial<SettingState>
          if (version < 2) {
            state.home = DEFAULT_SETTINGS.home
          }
          if (version < 3) {
            state.theme = DEFAULT_SETTINGS.theme
          }
          return state
        },
      },
    ),
    {
      name: 'SettingStore',
    },
  ),
)
