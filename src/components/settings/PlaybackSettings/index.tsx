import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Eye, SkipForward, Filter, SortAsc } from 'lucide-react'

export default function PlaybackSettings() {
  const { playback, setPlaybackSettings } = useSettingStore()
  const { adFilteringEnabled, setAdFilteringEnabled } = useApiStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg dark:from-red-600 dark:to-red-500">
            <Play size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">播放设置</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">自定义播放体验和观看习惯</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white">通用设置</h3>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-red-900/30">
                <Eye size={18} className="text-blue-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-800 dark:text-white">开启观看记录</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">自动记录您的观看进度</p>
              </div>
            </div>
            <Switch
              checked={playback.isViewingHistoryEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isViewingHistoryEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-red-900/30">
                <SkipForward size={18} className="text-green-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-800 dark:text-white">自动续播</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">播放完自动播放下一集</p>
              </div>
            </div>
            <Switch
              checked={playback.isAutoPlayEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isAutoPlayEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-red-900/30">
                <Filter size={18} className="text-orange-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-800 dark:text-white">跳过切片广告</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">检测并跳过广告片段</p>
              </div>
            </div>
            <Switch
              checked={adFilteringEnabled}
              onCheckedChange={checked => setAdFilteringEnabled(checked)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white">显示设置</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-red-900/30">
                <SortAsc size={18} className="text-purple-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-800 dark:text-white">剧集默认显示顺序</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">详情页剧集列表的默认排列顺序</p>
              </div>
            </div>
            <Select
              value={playback.defaultEpisodeOrder}
              onValueChange={(value: 'asc' | 'desc') =>
                setPlaybackSettings({ defaultEpisodeOrder: value })
              }
            >
              <SelectTrigger className="w-full rounded-xl bg-white/60 sm:w-36 dark:bg-gray-800 dark:text-gray-100">
                <SelectValue placeholder="选择顺序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">正序 (1, 2, 3...)</SelectItem>
                <SelectItem value="desc">倒序 (..., 3, 2, 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
