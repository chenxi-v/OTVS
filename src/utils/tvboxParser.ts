import type { VideoApi } from '@/types'

// TVBox 站点配置接口
interface TVBoxSite {
  key: string
  name: string
  type: number
  api: string
  searchable?: number
  quickSearch?: number
  filterable?: number
  categories?: string[]
  // 其他可能的字段
  jar?: string
  ext?: string | object
  playerType?: number
}

// TVBox 完整配置接口
interface TVBoxConfig {
  sites?: TVBoxSite[]
  // 其他 TVBox 配置项
  spider?: string
  wallpaper?: string
  logo?: string
  ads?: string[]
  rules?: unknown[]
  parses?: unknown[]
  flags?: string[]
  headers?: Record<string, string>
}

/**
 * 检测数据是否为 TVBox 格式
 */
export function isTVBoxFormat(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const config = data as TVBoxConfig

  // 检查是否有 sites 数组
  if (Array.isArray(config.sites) && config.sites.length > 0) {
    // 检查第一个站点是否有 TVBox 特有的字段
    const firstSite = config.sites[0]
    return (
      typeof firstSite === 'object' &&
      firstSite !== null &&
      'key' in firstSite &&
      'name' in firstSite &&
      'type' in firstSite &&
      'api' in firstSite
    )
  }

  return false
}

/**
 * 将 TVBox 站点转换为 VideoApi
 */
function convertTVBoxSiteToVideoApi(site: TVBoxSite): VideoApi | null {
  // 只处理类型 0 (XML), 1 (JSON API)
  // type 2 是 WebView, type 3 是爬虫源，都不支持
  if (![0, 1].includes(site.type)) {
    console.warn(`跳过不支持的站点类型: ${site.name}, type: ${site.type}`)
    return null
  }

  // 清理名称（移除表情符号等）
  const cleanName = site.name
    .replace(/[🍃🌍🥗🐉🎬📺]/g, '') // 移除常见表情
    .trim()

  // 生成唯一 ID
  const id = `tvbox_${site.key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    name: cleanName || site.key,
    url: site.api,
    detailUrl: site.api, // TVBox 通常使用相同的 API 地址
    timeout: 10000,
    retry: 3,
    isEnabled: true,
    updatedAt: new Date(),
  }
}

/**
 * 解析 TVBox 配置
 */
export function parseTVBoxConfig(data: unknown): VideoApi[] {
  if (!isTVBoxFormat(data)) {
    throw new Error('无效的 TVBox 格式')
  }

  const config = data as TVBoxConfig
  const sites = config.sites || []

  const videoApis: VideoApi[] = []

  for (const site of sites) {
    try {
      const api = convertTVBoxSiteToVideoApi(site)
      if (api) {
        videoApis.push(api)
      }
    } catch (error) {
      console.warn(`转换站点失败: ${site.name}`, error)
    }
  }

  return videoApis
}

/**
 * 尝试解析多种格式的视频源配置
 * 支持：
 * 1. TVBox 格式（{ sites: [...] }）
 * 2. 标准数组格式（[...]）
 */
export function parseVideoSourceConfig(data: unknown): VideoApi[] {
  // 先尝试 TVBox 格式
  if (isTVBoxFormat(data)) {
    console.log('检测到 TVBox 格式')
    return parseTVBoxConfig(data)
  }

  // 尝试标准数组格式
  if (Array.isArray(data)) {
    console.log('检测到标准数组格式')
    // 验证数组项是否符合 VideoApi 格式
    const validApis = data.filter((item): item is VideoApi => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        'url' in item
      )
    })

    if (validApis.length > 0) {
      return validApis.map(api => ({
        ...api,
        id: api.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date(),
      }))
    }
  }

  throw new Error('无法识别的视频源格式')
}
