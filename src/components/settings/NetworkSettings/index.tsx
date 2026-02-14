import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingStore'
import { Globe, Clock, RefreshCw } from 'lucide-react'

export default function NetworkSettings() {
  const { network, setNetworkSettings } = useSettingStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg dark:from-red-600 dark:to-red-500">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">网络设置</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">配置全局的网络请求默认参数</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-red-900/30">
              <Clock size={18} className="text-orange-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <Label htmlFor="timeout" className="text-sm font-medium text-gray-800 dark:text-white">
                默认超时时间
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">单位：毫秒</p>
            </div>
            <Input
              type="number"
              id="timeout"
              value={network.defaultTimeout}
              onChange={e => setNetworkSettings({ defaultTimeout: parseInt(e.target.value) || 0 })}
              className="w-24 rounded-xl bg-white/60 text-center dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-red-900/30">
              <RefreshCw size={18} className="text-green-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <Label htmlFor="retry" className="text-sm font-medium text-gray-800 dark:text-white">
                默认重试次数
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">请求失败时自动重试</p>
            </div>
            <Input
              type="number"
              id="retry"
              value={network.defaultRetry}
              onChange={e => setNetworkSettings({ defaultRetry: parseInt(e.target.value) || 0 })}
              className="w-24 rounded-xl bg-white/60 text-center dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
