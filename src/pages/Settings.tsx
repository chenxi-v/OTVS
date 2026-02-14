import SideBar from '@/components/settings/layouts/SideBar'
import ModuleContent from '@/components/settings/layouts/ModuleContent'
import { useState } from 'react'
import { type SettingModuleList } from '@/types'
import { ListVideo, Info, ArrowLeft, Menu, Globe, Search, Play } from 'lucide-react'
import VideoSource from '@/components/settings/VideoSource'
import NetworkSettings from '@/components/settings/NetworkSettings'
import SearchSettings from '@/components/settings/SearchSettings'
import PlaybackSettings from '@/components/settings/PlaybackSettings'
import { cn } from '@/utils'
import AboutProject from '@/components/settings/AboutProject'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  // 路由相关
  const navigate = useNavigate()
  // SideBar 相关
  const SideBarModules: SettingModuleList = [
    {
      id: 'video_source',
      name: '视频源管理',
      icon: <ListVideo size={18} />,
      component: <VideoSource />,
    },
    {
      id: 'network_settings',
      name: '网络设置',
      icon: <Globe size={18} />,
      component: <NetworkSettings />,
    },
    {
      id: 'search_settings',
      name: '搜索设置',
      icon: <Search size={18} />,
      component: <SearchSettings />,
    },
    {
      id: 'playback_settings',
      name: '播放设置',
      icon: <Play size={18} />,
      component: <PlaybackSettings />,
    },
    {
      id: 'about_project',
      name: '关于',
      icon: <Info size={18} />,
      component: <AboutProject />,
    },
  ]
  const [activeId, setActiveId] = useState(SideBarModules[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const currentModule = SideBarModules.find(module => module.id === activeId) || SideBarModules[0]

  return (
    <div className="container mx-auto max-w-6xl min-h-[90vh] p-2 pb-20 sm:p-4 md:pt-6">
      {/* 顶部导航栏 */}
      <div className="mb-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="gap-2 rounded-xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} />
            <span className="font-medium">返回</span>
          </Button>
        </motion.div>
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            className="gap-2 rounded-xl bg-white/40 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="text-sm font-medium text-gray-700">{currentModule.name}</span>
            <Menu size={18} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {/* 侧边栏 */}
        <AnimatePresence>
          <div
            className={cn(
              'transition-all duration-300 ease-in-out md:block md:w-56 lg:w-64',
              isSidebarOpen
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100',
            )}
          >
            <div className="overflow-hidden rounded-2xl bg-white/40 p-3 shadow-xl shadow-black/5 backdrop-blur-xl md:p-4">
              <SideBar
                className="w-full"
                activeId={activeId}
                modules={SideBarModules}
                onSelect={id => {
                  setActiveId(id)
                  setIsSidebarOpen(false)
                }}
              />
            </div>
          </div>
        </AnimatePresence>

        {/* 内容区域 */}
        <div className="flex-1">
          <ModuleContent module={currentModule} />
        </div>
      </div>
    </div>
  )
}
