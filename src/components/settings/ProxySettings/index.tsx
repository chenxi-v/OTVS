import { useState } from 'react'
import { useSettingStore } from '@/store/settingStore'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cloud, Zap, Globe, ExternalLink, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function ProxySettings() {
  const { proxy, setProxySettings } = useSettingStore()
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<'success' | 'error' | null>(null)

  // 检测代理状态
  const handleCheckProxyStatus = async () => {
    if (!proxy.enabled || !proxy.proxyUrl) {
      toast.error('请先启用代理并配置 Worker 地址')
      return
    }

    setIsChecking(true)
    setCheckResult(null)

    try {
      // 测试 Worker 连通性
      const testUrl = `${proxy.proxyUrl.replace(/\/$/, '')}/https://httpbin.org/get`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setCheckResult('success')
        toast.success('Cloudflare Worker 代理连接正常')
      } else {
        setCheckResult('error')
        toast.error(`代理连接失败: HTTP ${response.status}`)
      }
    } catch (error) {
      setCheckResult('error')
      const message = error instanceof Error ? error.message : '未知错误'
      toast.error(`代理连接失败: ${message}`)
    } finally {
      setIsChecking(false)
    }
  }

  // 保存代理配置
  const handleSaveProxySettings = () => {
    if (proxy.enabled && !proxy.proxyUrl) {
      toast.error('请配置 Worker 地址')
      return
    }

    if (proxy.enabled && proxy.proxyUrl) {
      try {
        new URL(proxy.proxyUrl)
      } catch {
        toast.error('Worker 地址格式不正确')
        return
      }
    }

    setProxySettings({
      enabled: proxy.enabled,
      proxyUrl: proxy.proxyUrl?.trim() || 'https://corsapi.smone.workers.dev',
    })

    toast.success('代理配置已保存')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 标题区域 */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:from-blue-900/10 dark:to-indigo-900/10 dark:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
              <Cloud size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Cloudflare Worker 代理加速</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">为所有视频源启用全局 CDN 加速</p>
            </div>
          </div>
          <Switch
            checked={proxy.enabled}
            onCheckedChange={(checked) => setProxySettings({ enabled: checked })}
          />
        </div>
      </div>

      {/* 代理配置 */}
      {proxy.enabled && (
        <div className="flex flex-col gap-4">
          {/* Worker 地址配置 */}
          <div className="overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
            <div className="border-b border-gray-200/50 p-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white">Worker 配置</h3>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cloudflare Worker 地址
                </Label>
                <Input
                  type="text"
                  value={proxy.proxyUrl}
                  onChange={(e) => setProxySettings({ proxyUrl: e.target.value })}
                  placeholder="https://your-worker.workers.dev"
                  className="bg-white/50 dark:bg-gray-800/50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  默认地址：https://corsapi.smone.workers.dev（支持自定义部署）
                </p>
              </div>

              {/* 检测状态 */}
              {checkResult && (
                <div className={`flex items-center gap-2 rounded-lg p-3 ${
                  checkResult === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {checkResult === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  <span className="text-sm">
                    {checkResult === 'success' ? '代理连接正常' : '代理连接失败'}
                  </span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCheckProxyStatus}
                  disabled={isChecking}
                  className="flex-1"
                >
                  <Globe size={16} className="mr-2" />
                  {isChecking ? '检测中...' : '检测代理状态'}
                </Button>
                <Button
                  onClick={handleSaveProxySettings}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                >
                  <Zap size={16} className="mr-2" />
                  保存配置
                </Button>
              </div>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="overflow-hidden rounded-2xl bg-blue-50/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-blue-900/20">
            <div className="p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                <Info size={16} />
                功能说明
              </h4>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>通过 Cloudflare 全球 CDN 加速视频源 API 访问</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>全局模式：为所有视频源统一使用此 Worker 代理</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>优先级：视频源单独配置 {'>'} 全局配置 {'>'} 本地代理</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>如果某个视频源配置了单独的 Worker 地址，将优先使用该地址</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 自定义部署说明 */}
          <div className="overflow-hidden rounded-2xl bg-amber-50/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-amber-900/20">
            <div className="p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
                <AlertTriangle size={16} />
                自定义部署
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                如需自定义部署 Worker 服务，请参考：
                <a
                  href="https://github.com/SzeMeng76/CORSAPI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1 underline hover:text-amber-600"
                >
                  CORSAPI 项目
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 未启用提示 */}
      {!proxy.enabled && (
        <div className="rounded-2xl bg-gray-50/80 p-8 text-center dark:bg-gray-800/50">
          <Cloud size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">全局代理加速未启用</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">开启后将为所有视频源使用 Cloudflare Worker 加速</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">也可在视频源管理中为单个源配置代理</p>
        </div>
      )}
    </div>
  )
}
