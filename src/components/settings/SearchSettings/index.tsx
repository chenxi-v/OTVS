import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useSettingStore } from '@/store/settingStore'
import { useSearchStore } from '@/store/searchStore'
import { toast } from 'sonner'
import { Trash2, Search, History, Database, Clock } from 'lucide-react'

export default function SearchSettings() {
  const { search, setSearchSettings } = useSettingStore()
  const { clearSearchResultsCache, searchResultsCache, removeSearchResultsCacheItem } =
    useSearchStore()

  const handleClearCache = () => {
    clearSearchResultsCache()
    toast.success('搜索缓存已清空')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg dark:from-red-600 dark:to-red-500">
            <Search size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">搜索设置</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">管理搜索历史和缓存行为</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-500 dark:text-red-400" />
            <h3 className="font-semibold text-gray-800 dark:text-white">历史记录</h3>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-800 dark:text-white">开启搜索历史</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">记录您的搜索关键词</p>
            </div>
            <Switch
              checked={search.isSearchHistoryEnabled}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-800 dark:text-white">显示搜索历史</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">搜索框获得焦点时显示</p>
            </div>
            <Switch
              checked={search.isSearchHistoryVisible}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryVisible: checked })}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-gray-500 dark:text-red-400" />
            <h3 className="font-semibold text-gray-800 dark:text-white">缓存管理</h3>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-red-900/30">
                <Clock size={18} className="text-purple-600 dark:text-red-400" />
              </div>
              <div>
                <Label htmlFor="expiry" className="text-sm font-medium text-gray-800 dark:text-white">
                  缓存过期时间
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">单位：小时</p>
              </div>
            </div>
            <Input
              type="number"
              id="expiry"
              value={search.searchCacheExpiryHours}
              onChange={e => {
                const val = parseFloat(e.target.value)
                setSearchSettings({ searchCacheExpiryHours: isNaN(val) ? 0 : val })
              }}
              className="w-full rounded-xl bg-white/60 sm:w-24 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-800/50">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-800 dark:text-white">手动清理缓存</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">立即清空所有搜索结果缓存</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearCache}
              className="shrink-0 rounded-xl"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              清空
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-gray-800 dark:text-white">缓存列表</Label>
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl bg-gray-50/50 p-2 dark:bg-gray-800/50">
              {Object.keys(searchResultsCache).length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">暂无缓存</p>
              ) : (
                Object.entries(searchResultsCache).map(([query, cache]) => (
                  <div
                    key={query}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white/60 p-3 shadow-sm dark:bg-gray-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium dark:text-white">{query}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(cache.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      onClick={() => removeSearchResultsCacheItem(query)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
