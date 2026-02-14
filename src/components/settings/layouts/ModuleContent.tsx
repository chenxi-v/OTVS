import { type SettingModule } from '@/types'

export default function ModuleContent({ module }: { module: SettingModule }) {
  return (
    <div className="h-fit w-full overflow-hidden rounded-2xl bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl dark:bg-gray-900/80">
      <div className="p-4 md:p-6">{module.component}</div>
    </div>
  )
}
