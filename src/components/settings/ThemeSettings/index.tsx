import { useTheme } from '@/hooks'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import type { ThemeMode } from '@/config/settings.config'

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun; description: string }[] = [
  {
    value: 'light',
    label: '浅色',
    icon: Sun,
    description: '始终使用浅色主题',
  },
  {
    value: 'dark',
    label: '深色',
    icon: Moon,
    description: '始终使用深色主题',
  },
  {
    value: 'system',
    label: '跟随系统',
    icon: Monitor,
    description: '自动跟随系统主题设置',
  },
]

export default function ThemeSettings() {
  const { theme, setTheme, effectiveTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg dark:from-red-600 dark:to-red-500">
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">外观设置</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">自定义应用的外观主题</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {themeOptions.map(option => {
          const Icon = option.icon
          const isSelected = theme === option.value

          return (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(option.value)}
              className={`relative flex flex-col items-center gap-3 rounded-2xl p-4 text-center transition-all duration-300 sm:p-6 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg dark:from-red-600 dark:to-red-500'
                  : 'bg-white/40 text-gray-700 shadow-lg shadow-black/5 backdrop-blur-xl hover:bg-white/60 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <div
                className={`rounded-xl p-3 ${
                  isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Icon size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{option.label}</p>
                <p
                  className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="rounded-xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">当前生效主题</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {effectiveTheme === 'dark' ? '深色模式' : '浅色模式'}
            </p>
          </div>
          <div
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              effectiveTheme === 'dark'
                ? 'bg-gray-800 text-white dark:bg-red-600'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
            }`}
          >
            {effectiveTheme === 'dark' ? '🌙 深色' : '☀️ 浅色'}
          </div>
        </div>
      </div>
    </div>
  )
}
