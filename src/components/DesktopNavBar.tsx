import { Sun, Moon, Monitor, Settings } from 'lucide-react'
import { Button } from '@heroui/react'
import { useSettingStore } from '@/store/settingStore'
import { useNavigate } from 'react-router'
import { type ThemeMode } from '@/config/settings.config'
import RecentHistory from '@/components/RecentHistory'

interface DesktopNavBarProps {
  showHistory?: boolean
  showSettings?: boolean
  showTheme?: boolean
}

export default function DesktopNavBar({ 
  showHistory = true, 
  showSettings = true, 
  showTheme = true 
}: DesktopNavBarProps) {
  const { theme, setThemeSettings } = useSettingStore()
  const navigate = useNavigate()

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeSettings({ mode: modes[nextIndex] })
  }

  return (
    <div className="fixed top-5 right-5 z-50 hidden items-center gap-2 sm:flex">
      {showTheme && (
        <Button
          onPress={cycleTheme}
          isIconOnly
          size="sm"
          className="bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/20"
        >
          {theme.mode === 'light' ? (
            <Sun size={18} className="text-gray-700 dark:text-gray-200" />
          ) : theme.mode === 'dark' ? (
            <Moon size={18} className="text-gray-700 dark:text-gray-200" />
          ) : (
            <Monitor size={18} className="text-gray-700 dark:text-gray-200" />
          )}
        </Button>
      )}
      {showHistory && (
        <Button
          isIconOnly
          size="sm"
          className="bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <RecentHistory />
        </Button>
      )}
      {showSettings && (
        <Button
          onPress={() => navigate('/settings')}
          isIconOnly
          size="sm"
          className="bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <Settings size={18} className="text-gray-700 dark:text-gray-200" />
        </Button>
      )}
    </div>
  )
}
