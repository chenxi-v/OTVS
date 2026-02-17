import { useState, useEffect } from 'react'
import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { getProxyUrl } from '@/config/api.config'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { EyeOff, Eye, RefreshCw, Shield, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

interface Category {
  type_id: number
  type_pid: number
  type_name: string
}

export default function CategorySettings() {
  const navigate = useNavigate()
  const { home, proxy, toggleBlockedCategory, clearBlockedCategories } = useSettingStore()
  const { videoAPIs } = useApiStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const blockedCategories = home?.blockedCategories || []

  // 获取代理 URL（优先级：视频源单独配置 > 全局配置 > 本地代理）
  const getProxyUrlWithSettings = (targetUrl: string, apiUrl?: string): string => {
    if (apiUrl) {
      const api = videoAPIs.find(a => a.url === apiUrl || a.detailUrl === apiUrl)
      // 1. 优先使用视频源单独配置的 proxyUrl
      if (api?.proxyUrl) {
        return getProxyUrl(targetUrl, api.proxyUrl)
      }
    }

    // 2. 使用全局代理配置
    if (proxy.enabled && proxy.proxyUrl) {
      return getProxyUrl(targetUrl, proxy.proxyUrl)
    }

    // 3. 使用本地代理
    return getProxyUrl(targetUrl)
  }

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      setLoading(true)

      console.log('当前视频源列表:', videoAPIs)
      console.log('默认数据源ID:', home?.defaultDataSourceId)

      if (videoAPIs.length === 0) {
        toast.error('请先配置视频源')
        setLoading(false)
        return
      }

      let targetApi = null
      if (home?.defaultDataSourceId) {
        targetApi = videoAPIs.find(api => api.id === home.defaultDataSourceId && api.isEnabled)
      }

      if (!targetApi) {
        targetApi = videoAPIs.find(api => api.isEnabled)
      }

      if (!targetApi) {
        toast.error('没有启用的视频源，请先启用至少一个视频源')
        setLoading(false)
        return
      }

      console.log('使用的视频源:', targetApi)

      const isXmlApi = targetApi.url.includes('/xml')

      if (isXmlApi) {
        // XML API 使用预定义分类
        const { XML_CATEGORIES } = await import('@/components/XmlCategorySection')
        setCategories(XML_CATEGORIES)
      } else {
        // JSON API 获取分类
        const categoryUrl = `${targetApi.url}?ac=list`
        const response = await fetch(getProxyUrlWithSettings(categoryUrl, targetApi.url))

        if (response.ok) {
          const data = await response.json()
          console.log('获取到的分类数据:', data)
          if (data.code === 1 && Array.isArray(data.class)) {
            setCategories(data.class)
          } else {
            console.error('分类数据格式不正确:', data)
            toast.error('分类数据格式不正确')
          }
        } else {
          console.error('获取分类失败，状态码:', response.status)
          toast.error(`获取分类失败: ${response.status}`)
        }
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      toast.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoAPIs.length > 0) {
      fetchCategories()
    }
  }, [videoAPIs, home?.defaultDataSourceId])

  // 获取主分类（type_pid === 0）
  const mainCategories = categories.filter(cat => cat.type_pid === 0)

  // 获取子分类
  const getSubCategories = (parentId: number) => {
    return categories.filter(cat => cat.type_pid === parentId)
  }

  // 切换分类屏蔽状态
  const handleToggleCategory = (categoryId: number, categoryName: string) => {
    toggleBlockedCategory(categoryId)
    const isNowBlocked = !blockedCategories.includes(categoryId)
    if (isNowBlocked) {
      toast.success(`已屏蔽分类: ${categoryName}`)
    } else {
      toast.success(`已取消屏蔽: ${categoryName}`)
    }
  }

  // 清除所有屏蔽
  const handleClearAll = () => {
    if (blockedCategories.length === 0) {
      toast.info('没有已屏蔽的分类')
      return
    }
    clearBlockedCategories()
    toast.success('已清除所有屏蔽分类')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 标题区域 */}
      <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg dark:from-red-600 dark:to-red-500">
            <Shield size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">分类屏蔽</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">屏蔽不想看到的分类，首页将自动过滤</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('当前屏蔽的分类ID:', blockedCategories)
                toast.info(`已屏蔽 ${blockedCategories.length} 个分类: ${blockedCategories.join(', ')}`)
              }}
              className="h-9 w-9 rounded-xl p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="查看屏蔽列表"
            >
              <span className="text-xs font-mono">{blockedCategories.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCategories}
              disabled={loading}
              className="h-9 w-9 rounded-xl p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw size={16} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {blockedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-9 gap-1 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Trash2 size={14} />
                <span className="text-xs">清除全部</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      {blockedCategories.length > 0 && (
        <div className="rounded-xl bg-blue-50/80 p-3 dark:bg-blue-900/20">
          <p className="text-center text-sm text-blue-700 dark:text-blue-300">
            已屏蔽 <span className="font-bold">{blockedCategories.length}</span> 个分类
          </p>
        </div>
      )}

      {/* 分类列表 */}
      <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white">分类列表</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">开启开关即可屏蔽该分类</p>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">正在加载分类...</p>
              </div>
            ) : videoAPIs.length === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <Shield size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">暂无视频源</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">请先前往「视频源管理」添加视频源</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/settings', { state: { activeTab: 'video_source' } })}
                  className="mt-2"
                >
                  <ExternalLink size={14} className="mr-1" />
                  前往视频源管理
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">无法获取分类</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">请检查视频源是否可用，或点击刷新按钮重试</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchCategories}
                  className="mt-2"
                >
                  <RefreshCw size={14} className="mr-1" />
                  重新获取
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {mainCategories.map(mainCat => {
              const subCategories = getSubCategories(mainCat.type_id)
              const isMainBlocked = blockedCategories.includes(mainCat.type_id)

              return (
                <div key={mainCat.type_id} className="rounded-xl border border-gray-200/50 bg-gray-50/50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                  {/* 主分类 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isMainBlocked ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {isMainBlocked ? (
                          <EyeOff size={16} className="text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <Label className={`text-sm font-medium ${isMainBlocked ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                          {mainCat.type_name}
                        </Label>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {subCategories.length > 0 ? `${subCategories.length} 个子分类` : '主分类'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={!isMainBlocked}
                      onCheckedChange={() => handleToggleCategory(mainCat.type_id, mainCat.type_name)}
                    />
                  </div>

                  {/* 子分类 */}
                  {subCategories.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-200/50 pt-3 dark:border-gray-700/50 sm:grid-cols-3">
                      {subCategories.map(subCat => {
                        const isSubBlocked = blockedCategories.includes(subCat.type_id)
                        return (
                          <div
                            key={subCat.type_id}
                            className={`flex items-center justify-between gap-2 rounded-lg border p-2 transition-colors ${
                              isSubBlocked
                                ? 'border-gray-200 bg-gray-100/50 dark:border-gray-700 dark:bg-gray-800/50'
                                : 'border-gray-200/50 bg-white/50 hover:bg-gray-50 dark:border-gray-700/50 dark:bg-gray-800/30 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <span className={`truncate text-xs ${isSubBlocked ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                              {subCat.type_name}
                            </span>
                            <button
                              onClick={() => handleToggleCategory(subCat.type_id, subCat.type_name)}
                              className={`flex-shrink-0 rounded p-1 transition-colors ${
                                isSubBlocked
                                  ? 'text-gray-400 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-700'
                                  : 'text-green-500 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                              }`}
                            >
                              {isSubBlocked ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="rounded-xl bg-amber-50/80 p-3 dark:bg-amber-900/20">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <strong>提示：</strong>屏蔽分类后，首页将不再显示该分类的内容。切换视频源后，分类列表会自动更新。
        </p>
      </div>
    </div>
  )
}
