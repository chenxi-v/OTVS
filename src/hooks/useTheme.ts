import { useEffect, useCallback } from 'react'
import { useSettingStore } from '@/store/settingStore'
import type { ThemeMode } from '@/config/settings.config'

export function useTheme() {
  const { theme, setThemeSettings } = useSettingStore()

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }, [])

  const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
    if (theme.mode === 'system') {
      return getSystemTheme()
    }
    return theme.mode
  }, [theme.mode, getSystemTheme])

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeSettings({ mode })
    },
    [setThemeSettings],
  )

  const toggleTheme = useCallback(() => {
    const effectiveTheme = getEffectiveTheme()
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  }, [getEffectiveTheme, setTheme])

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme()

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [getEffectiveTheme])

  useEffect(() => {
    if (theme.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const effectiveTheme = getSystemTheme()
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme.mode, getSystemTheme])

  return {
    theme: theme.mode,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    toggleTheme,
  }
}
