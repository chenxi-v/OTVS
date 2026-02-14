import { OkiLogo, SearchIcon, SettingIcon, CloseIcon } from '@/components/icons'
import { Button, Input } from '@heroui/react'
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchHistory, useSearch, useCloudSync } from '@/hooks'

import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import RecentHistory from '@/components/RecentHistory'
import CategorySection from '@/components/CategorySection'
import XmlCategorySection, { XML_CATEGORIES } from '@/components/XmlCategorySection'
import { useNavigate } from 'react-router'

import { useVersionStore } from '@/store/versionStore'
import { ChevronDown, ChevronUp } from 'lucide-react'
const UpdateModal = React.lazy(() => import('@/components/UpdateModal'))

interface Category {
  type_id: number
  type_pid: number
  type_name: string
}

function App() {
  useCloudSync()

  const navigate = useNavigate()
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const { searchHistory, clearSearchHistory } = useSearchHistory()
  const { search, setSearch, searchMovie } = useSearch()

  const { hasNewVersion, setShowUpdateModal } = useVersionStore()
  const { system, home } = useSettingStore()
  const { videoAPIs, initializeEnvSources } = useApiStore()

  const containerRef = useRef<HTMLDivElement>(null)

  const [buttonTransitionStatus, setButtonTransitionStatus] = useState({
    opacity: 0,
    filter: 'blur(5px)',
  })
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    if (search.length > 0) {
      setButtonTransitionStatus({
        opacity: 1,
        filter: 'blur(0px)',
      })
      setButtonIsDisabled(false)
    } else {
      setButtonIsDisabled(true)
      setButtonTransitionStatus({
        opacity: 0,
        filter: 'blur(5px)',
      })
    }
  }, [search])

  useEffect(() => {
    if (hasNewVersion() && system.isUpdateLogEnabled) {
      setShowUpdateModal(true)
    }
  }, [hasNewVersion, setShowUpdateModal, system.isUpdateLogEnabled])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchHistoryOpen(false)
        setIsDeleteConfirmOpen(false)
      }
    }

    if (isSearchHistoryOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchHistoryOpen])

  useEffect(() => {
    const initApp = async () => {
      await initializeEnvSources()
      await fetchCategories()
    }
    initApp()
  }, [initializeEnvSources])

  useEffect(() => {
    if (videoAPIs.length > 0) {
      fetchCategories()
    }
  }, [videoAPIs, home?.defaultDataSourceId])

  const getCategoryParent = (typeId: number): number => {
    if (typeId >= 6 && typeId <= 12) return 1
    if (typeId === 39 || typeId === 62 || typeId === 70) return 1
    if (typeId >= 13 && typeId <= 19) return 2
    if (typeId === 23) return 2
    if (typeId >= 54 && typeId <= 61) return 2
    if (typeId >= 64 && typeId <= 69) return 2
    if (typeId >= 25 && typeId <= 28) return 3
    if (typeId >= 29 && typeId <= 31) return 4
    if (typeId === 44 || typeId === 45 || typeId === 63) return 4
    if (typeId >= 47 && typeId <= 53) return 20
    return 0
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)

      let targetApi = null
      if (home?.defaultDataSourceId) {
        targetApi = videoAPIs.find(api => api.id === home.defaultDataSourceId && api.isEnabled)
      }

      if (!targetApi) {
        targetApi = videoAPIs.find(api => api.isEnabled)
      }

      if (targetApi) {
        const isXmlApi = targetApi.url.includes('/xml')

        if (isXmlApi) {
          const mainCategories = XML_CATEGORIES.filter(cat => cat.type_pid === 0)
          setAllCategories(XML_CATEGORIES)
          setCategories(mainCategories)

          if (mainCategories.length > 0) {
            setSelectedCategory(mainCategories[0])
            setSelectedSubCategory(null)

            const firstCategorySubs = XML_CATEGORIES.filter(
              cat => cat.type_pid === mainCategories[0].type_id,
            )
            if (firstCategorySubs.length > 0) {
              setSelectedSubCategory(firstCategorySubs[0])
            }
          }
        } else {
          const categoryUrl = `${targetApi.url}?ac=list`
          const response = await fetch(`/proxy?url=${encodeURIComponent(categoryUrl)}`)

          if (response.ok) {
            const data = await response.json()

            if (data.code === 1 && Array.isArray(data.class)) {
              const hasTypePid = data.class.some((cat: Category) => cat.type_pid !== undefined)

              if (hasTypePid) {
                setAllCategories(data.class)
                const mainCategories = data.class.filter((cat: Category) => cat.type_pid === 0)
                setCategories(mainCategories)

                if (mainCategories.length > 0) {
                  setSelectedCategory(mainCategories[0])
                  setSelectedSubCategory(null)

                  const firstCategorySubs = data.class.filter(
                    (cat: Category) => cat.type_pid === mainCategories[0].type_id,
                  )
                  if (firstCategorySubs.length > 0) {
                    setSelectedSubCategory(firstCategorySubs[0])
                  }
                }
              } else {
                const mainCategoryIds = [1, 2, 3, 4, 20]
                const mainCategories = data.class.filter((cat: Category) =>
                  mainCategoryIds.includes(cat.type_id),
                )
                const allCategoriesWithPid = data.class.map((cat: Category) => ({
                  ...cat,
                  type_pid: mainCategoryIds.includes(cat.type_id) ? 0 : getCategoryParent(cat.type_id),
                }))

                setAllCategories(allCategoriesWithPid)
                setCategories(mainCategories.length > 0 ? mainCategories : data.class.slice(0, 6))

                if (mainCategories.length > 0) {
                  setSelectedCategory(mainCategories[0])
                  setSelectedSubCategory(null)

                  const firstCategorySubs = allCategoriesWithPid.filter(
                    (cat: Category) => cat.type_pid === mainCategories[0].type_id,
                  )
                  if (firstCategorySubs.length > 0) {
                    setSelectedSubCategory(firstCategorySubs[0])
                  } else {
                    setSelectedSubCategory(mainCategories[0])
                  }
                } else if (data.class.length > 0) {
                  setSelectedCategory(data.class[0])
                  setSelectedSubCategory(null)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleSearch = () => {
    searchMovie(search)
    setIsSearchHistoryOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
    if (event.key === 'Escape') {
      setIsSearchHistoryOpen(false)
    }
  }

  const handleHistoryClick = (content: string) => {
    searchMovie(content)
    setIsSearchHistoryOpen(false)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setIsDeleteConfirmOpen(false)
    setIsSearchHistoryOpen(false)
  }

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)

    const subs = allCategories.filter(cat => cat.type_pid === category.type_id)
    if (subs.length > 0) {
      setSelectedSubCategory(subs[0])
    }
  }

  const isSearchHistoryVisible = useSettingStore.getState().search.isSearchHistoryVisible
  const showSearchHistory = isSearchHistoryVisible && searchHistory.length > 0

  const getTargetApi = () => {
    let targetApi = null
    if (home?.defaultDataSourceId) {
      targetApi = videoAPIs.find(api => api.id === home.defaultDataSourceId && api.isEnabled)
    }
    if (!targetApi) {
      targetApi = videoAPIs.find(api => api.isEnabled)
    }
    return targetApi
  }

  const targetApi = getTargetApi()
  const subCategories = selectedCategory
    ? allCategories.filter(cat => cat.type_pid === selectedCategory.type_id)
    : []

  return (
    <>
      <React.Suspense fallback={null}>
        <UpdateModal />
      </React.Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pb-20"
      >
        <motion.div layoutId="history-icon" className="fixed top-5 right-5 z-50 flex gap-3">
          <Button
            isIconOnly
            className="bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
          >
            <RecentHistory />
          </Button>
          <Button
            onPress={() => navigate('/settings')}
            isIconOnly
            className="bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/60"
          >
            <SettingIcon size={25} />
          </Button>
        </motion.div>

        <div className="container mx-auto max-w-7xl px-4 pt-20">
          <motion.div
            layoutId="app-logo"
            transition={{ duration: 0.4 }}
            className="flex translate-x-[-1rem] items-end gap-2 text-[1.5rem] md:text-[2rem]"
          >
            <motion.div layoutId="logo-icon">
              <div className="block md:hidden">
                <OkiLogo size={48} />
              </div>
              <div className="hidden md:block">
                <OkiLogo size={64} />
              </div>
            </motion.div>
            <motion.p layoutId="logo-text" className="font-bold text-inherit">
              OUONNKI TV
            </motion.p>
          </motion.div>

          <motion.div
            ref={containerRef}
            layoutId="search-container"
            initial={{ width: '100%' }}
            className="relative mt-6 h-fit"
          >
            <Input
              classNames={{
                base: 'max-w-full h-13',
                mainWrapper: 'h-full',
                input: 'text-md',
                inputWrapper:
                  'h-full font-normal text-default-500 pr-2 shadow-xl shadow-black/5 backdrop-blur-xl bg-white/40 hover:bg-white/60 transition-all duration-300',
              }}
              placeholder="输入内容搜索..."
              size="lg"
              variant="bordered"
              startContent={
                <motion.div layoutId="search-icon">
                  <SearchIcon size={18} />
                </motion.div>
              }
              type="search"
              radius="full"
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (showSearchHistory) {
                  setIsSearchHistoryOpen(true)
                }
              }}
              endContent={
                <motion.div
                  initial={{ opacity: 0, filter: 'blur(5px)' }}
                  animate={{
                    opacity: buttonTransitionStatus.opacity,
                    filter: buttonTransitionStatus.filter,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white shadow-lg shadow-blue-500/25"
                    size="md"
                    radius="full"
                    onPress={handleSearch}
                    isDisabled={buttonIsDisabled}
                  >
                    搜索
                  </Button>
                </motion.div>
              }
            />

            <AnimatePresence>
              {isSearchHistoryOpen && showSearchHistory && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                      <h3 className="text-sm font-bold text-gray-900">搜索历史</h3>
                    </div>
                    <div className="relative">
                      {!isDeleteConfirmOpen ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsDeleteConfirmOpen(true)}
                          className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
                        >
                          <CloseIcon size={14} />
                          <span>清除</span>
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-gray-600">确定？</span>
                          <button
                            onClick={handleClearHistory}
                            className="text-xs font-medium text-red-500 hover:text-red-600"
                          >
                            确定
                          </button>
                          <button
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="flex max-h-[200px] flex-wrap gap-2 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {searchHistory.map(item => (
                        <motion.button
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleHistoryClick(item.content)}
                          className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200"
                        >
                          {item.content}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loadingCategories ? (
            <div className="mt-8 space-y-4">
              <div className="h-10 animate-pulse rounded-xl bg-white/20 backdrop-blur-xl" />
              <div className="h-8 animate-pulse rounded-xl bg-white/20 backdrop-blur-xl" />
            </div>
          ) : (
            categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <div className="mb-4 flex items-center gap-3 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <motion.button
                      key={category.type_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryClick(category)}
                      className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                        selectedCategory?.type_id === category.type_id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-white/40 text-gray-700 shadow-lg shadow-black/5 backdrop-blur-xl hover:bg-white/60'
                      }`}
                    >
                      {category.type_name}
                    </motion.button>
                  ))}
                </div>

                {subCategories.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-2">
                        {(isExpanded ? subCategories : subCategories.slice(0, 8)).map(subCat => (
                          <motion.button
                            key={subCat.type_id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedSubCategory(subCat)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                              selectedSubCategory?.type_id === subCat.type_id
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-white/40 text-gray-600 shadow-sm backdrop-blur-xl hover:bg-white/60'
                            }`}
                          >
                            {subCat.type_name}
                          </motion.button>
                        ))}
                      </div>
                      {subCategories.length > 8 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="flex items-center gap-1 rounded-full bg-white/40 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60"
                        >
                          {isExpanded ? (
                            <>
                              收起 <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              更多 <ChevronDown size={14} />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {targetApi && (selectedSubCategory || selectedCategory) && (
                  <div className="overflow-hidden rounded-2xl bg-white/40 p-4 shadow-xl shadow-black/5 backdrop-blur-xl md:p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedSubCategory
                          ? `${selectedCategory?.type_name} - ${selectedSubCategory.type_name}`
                          : selectedCategory?.type_name}
                      </h2>
                    </div>

                    {targetApi.url.includes('/xml') ? (
                      <XmlCategorySection
                        category={selectedSubCategory || selectedCategory!}
                        api={targetApi}
                      />
                    ) : (
                      <CategorySection
                        category={selectedSubCategory || selectedCategory!}
                        api={targetApi}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )
          )}
        </div>

        {import.meta.env.VITE_DISABLE_ANALYTICS !== 'true' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </motion.div>
    </>
  )
}

export default App
