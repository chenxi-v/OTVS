import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@heroui/react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { VideoApi, VideoItem } from '@/types'

interface XmlCategorySectionProps {
  category: {
    type_id: number
    type_pid: number
    type_name: string
  }
  api: VideoApi
}

export const XML_CATEGORIES = [
  { type_id: 1, type_pid: 0, type_name: '电影片' },
  { type_id: 2, type_pid: 0, type_name: '连续剧' },
  { type_id: 3, type_pid: 0, type_name: '综艺片' },
  { type_id: 4, type_pid: 0, type_name: '动漫片' },
  { type_id: 6, type_pid: 1, type_name: '动作片' },
  { type_id: 7, type_pid: 1, type_name: '喜剧片' },
  { type_id: 8, type_pid: 1, type_name: '爱情片' },
  { type_id: 9, type_pid: 1, type_name: '科幻片' },
  { type_id: 10, type_pid: 1, type_name: '恐怖片' },
  { type_id: 11, type_pid: 1, type_name: '剧情片' },
  { type_id: 12, type_pid: 1, type_name: '战争片' },
  { type_id: 13, type_pid: 2, type_name: '国产剧' },
  { type_id: 14, type_pid: 2, type_name: '香港剧' },
  { type_id: 15, type_pid: 2, type_name: '韩国剧' },
  { type_id: 16, type_pid: 2, type_name: '欧美剧' },
  { type_id: 21, type_pid: 2, type_name: '台湾剧' },
  { type_id: 22, type_pid: 2, type_name: '日本剧' },
  { type_id: 23, type_pid: 2, type_name: '海外剧' },
  { type_id: 24, type_pid: 2, type_name: '泰国剧' },
  { type_id: 25, type_pid: 3, type_name: '大陆综艺' },
  { type_id: 26, type_pid: 3, type_name: '港台综艺' },
  { type_id: 27, type_pid: 3, type_name: '日韩综艺' },
  { type_id: 28, type_pid: 3, type_name: '欧美综艺' },
  { type_id: 29, type_pid: 4, type_name: '国产动漫' },
  { type_id: 30, type_pid: 4, type_name: '日韩动漫' },
  { type_id: 31, type_pid: 4, type_name: '欧美动漫' },
  { type_id: 32, type_pid: 4, type_name: '港台动漫' },
  { type_id: 33, type_pid: 4, type_name: '海外动漫' },
  { type_id: 20, type_pid: 1, type_name: '记录片' },
  { type_id: 34, type_pid: 1, type_name: '伦理片' },
  { type_id: 36, type_pid: 2, type_name: '短剧' },
  { type_id: 37, type_pid: 1, type_name: '动画片' },
]

export default function XmlCategorySection({ category, api }: XmlCategorySectionProps) {
  const navigate = useNavigate()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`xml_${api.id}_${category.type_id}_page`)
    return savedPage ? parseInt(savedPage) : 1
  })
  const [pageCount, setPageCount] = useState(1)

  const handleVideoClick = (video: VideoItem) => {
    navigate(`/detail/${video.source_code}/${video.vod_id}`)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      sessionStorage.setItem(`xml_${api.id}_${category.type_id}_page`, newPage.toString())
    }
  }

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      sessionStorage.setItem(`xml_${api.id}_${category.type_id}_page`, newPage.toString())
    }
  }

  useEffect(() => {
    const fetchXmlVideos = async () => {
      try {
        setLoading(true)

        const apiUrl = `${api.url}?ac=videolist&t=${category.type_id}&pg=${currentPage}&pagesize=24`
        const response = await fetch(`/proxy?url=${encodeURIComponent(apiUrl)}`)

        if (!response.ok) {
          setVideos([])
          return
        }

        const text = await response.text()
        const data = await parseXmlResponse(text)

        if (data && Array.isArray(data.list)) {
          const videosWithSource = data.list.map((item: any) => ({
            ...item,
            source_name: api.name,
            source_code: api.id,
            api_url: api.url,
          })) as VideoItem[]

          setVideos(videosWithSource)
          setPageCount(data.pagecount || 1)
        } else {
          setVideos([])
        }
      } catch (error) {
        console.error('获取XML分类视频失败:', error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchXmlVideos()
  }, [category, api, currentPage])

  const parseXmlResponse = async (xmlText: string): Promise<any> => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    const videoElements = xmlDoc.getElementsByTagName('video')
    const videos: any[] = []

    for (let i = 0; i < videoElements.length; i++) {
      const video = videoElements[i]
      const videoData: any = {}

      const fields = [
        { tag: 'id', field: 'vod_id' },
        { tag: 'name', field: 'vod_name' },
        { tag: 'pic', field: 'vod_pic' },
        { tag: 'type', field: 'type_name' },
        { tag: 'year', field: 'vod_year' },
        { tag: 'area', field: 'vod_area' },
        { tag: 'director', field: 'vod_director' },
        { tag: 'actor', field: 'vod_actor' },
        { tag: 'note', field: 'vod_remarks' },
        { tag: 'des', field: 'vod_content' },
      ]

      fields.forEach(({ tag, field }) => {
        const element = video.getElementsByTagName(tag)[0]
        if (element) {
          videoData[field] = element.textContent
        }
      })

      const dlElements = video.getElementsByTagName('dl')
      const playUrls: string[] = []
      const playFroms: string[] = []

      for (let j = 0; j < dlElements.length; j++) {
        const ddElements = dlElements[j].getElementsByTagName('dd')
        for (let k = 0; k < ddElements.length; k++) {
          const dd = ddElements[k]
          const flag = dd.getAttribute('flag') || 'default'
          const urls = dd.textContent || ''

          if (urls) {
            playUrls.push(urls)
            playFroms.push(flag)
          }
        }
      }

      videoData.vod_play_url = playUrls.join('$$$')
      videoData.vod_play_from = playFroms.join('$$$')

      videos.push(videoData)
    }

    const listElement = xmlDoc.getElementsByTagName('list')[0]
    let page = 1
    let pagecount = 1

    if (listElement) {
      page = parseInt(listElement.getAttribute('page') || '1')
      pagecount = parseInt(listElement.getAttribute('pagecount') || '1')
    }

    return {
      code: 1,
      list: videos,
      page,
      pagecount,
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/20 backdrop-blur-xl" />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-2xl bg-white/40 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
          <p className="text-gray-500">暂无视频数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {videos.map((video, index) => (
          <motion.div
            key={`${video.source_code}_${video.vod_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
            onClick={() => handleVideoClick(video)}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={video.vod_pic || 'https://via.placeholder.com/300x400?text=暂无封面'}
                alt={video.vod_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={e => {
                  ;(e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/300x400?text=暂无封面'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {video.vod_remarks && (
                <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-xs font-medium text-white shadow-lg">
                  {video.vod_remarks}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-lg">
                  {video.vod_name}
                </h4>
                <div className="mt-1.5 flex items-center gap-2">
                  {video.vod_year && (
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-white/90 backdrop-blur-sm">
                      {video.vod_year}
                    </span>
                  )}
                  {video.type_name && (
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-white/90 backdrop-blur-sm">
                      {video.type_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {pageCount > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 pt-4"
        >
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            isDisabled={currentPage <= 1}
            onPress={handlePrevPage}
            className="rounded-xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
          >
            <ChevronLeft size={18} />
          </Button>
          <div className="flex items-center gap-2 rounded-xl bg-white/40 px-4 py-2 shadow-lg shadow-black/5 backdrop-blur-xl">
            <span className="text-sm font-medium text-gray-700">
              {currentPage} / {pageCount}
            </span>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            isDisabled={currentPage >= pageCount}
            onPress={handleNextPage}
            className="rounded-xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
          >
            <ChevronRight size={18} />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
