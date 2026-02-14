import { type SettingModuleList } from '@/types'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

export default function SideBar({
  activeId,
  modules,
  onSelect,
  className,
}: {
  activeId: string
  modules: SettingModuleList
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn(`relative flex h-full w-full flex-col gap-2`, className)}>
      {modules.map(module => (
        <motion.button
          key={module.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 transition-all duration-300 ${
            activeId === module.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${module.id === 'about_project' ? 'md:mt-auto' : ''}`}
          onClick={() => onSelect(module.id)}
        >
          <span className="relative z-10">{module.icon}</span>
          <h2 className="relative z-10 text-sm font-medium">{module.name}</h2>
        </motion.button>
      ))}
    </div>
  )
}
