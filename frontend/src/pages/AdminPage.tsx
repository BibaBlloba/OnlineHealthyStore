import { useEffect, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import {
  type Category,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories"

export default function AdminPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryDrafts, setCategoryDrafts] = useState<Record<number, string>>({})

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: isCategoriesModalOpen,
  })

  useEffect(() => {
    if (!categoriesQuery.data) {
      return
    }

    const drafts = categoriesQuery.data.reduce<Record<number, string>>(
      (acc: Record<number, string>, category: Category) => {
        acc[category.id] = category.name
        return acc
      },
      {}
    )

    setCategoryDrafts(drafts)
  }, [categoriesQuery.data])

  const createMutation = useMutation({
    mutationFn: () => createCategory(newCategoryName.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      setNewCategoryName("")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: number; name: string }) =>
      updateCategory(categoryId, name.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const openCategoriesModal = () => {
    setIsCategoriesModalOpen(true)
  }

  const closeCategoriesModal = () => {
    setIsCategoriesModalOpen(false)
    setNewCategoryName("")
  }

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim()

    if (!trimmedName) {
      return
    }

    createMutation.mutate()
  }

  const handleSaveCategory = (categoryId: number) => {
    const nextName = categoryDrafts[categoryId]?.trim()

    if (!nextName) {
      return
    }

    updateMutation.mutate({ categoryId, name: nextName })
  }

  const handleDeleteCategory = (categoryId: number) => {
    const confirmed = window.confirm("Удалить категорию?")

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(categoryId)
  }

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
            Admin panel
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">
            Admin Panel
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Пользователи
            </h2>

            <p className="text-sm text-slate-400">
              Управление ползователями
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/products")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Каталог товаров
            </h2>

            <p className="text-sm text-slate-400">
              Управление каталогом товаров
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Заказы
            </h2>

            <p className="text-sm text-slate-400">
              Просмотор заказов пользователей
            </p>
          </button>

          <button
            onClick={openCategoriesModal}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
            type="button"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Категории
            </h2>

            <p className="text-sm text-slate-400">
              Добавление, редактирование и удаление категорий
            </p>
          </button>

        </div>
      </div>

      {isCategoriesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
          onClick={closeCategoriesModal}
        >
          <div
            className="max-h-[90svh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-50">
                  Управление категориями
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                </p>
              </div>

              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={closeCategoriesModal}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(90svh-97px)] space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    placeholder="Новая категория"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />

                  <button
                    className="rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-medium text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={createMutation.isPending || !newCategoryName.trim()}
                    onClick={handleCreateCategory}
                    type="button"
                  >
                    {createMutation.isPending ? "Добавление..." : "Добавить"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                    Список категорий
                  </h3>
                </div>

                {categoriesQuery.isLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-6 text-center text-slate-400">
                    Загружаем категории...
                  </div>
                ) : categoriesQuery.isError || !categoriesQuery.data ? (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-6 text-center text-rose-200">
                    Не удалось загрузить категории
                  </div>
                ) : categoriesQuery.data.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-6 text-center text-slate-400">
                    Пока нет категорий.
                  </div>
                ) : (
                  categoriesQuery.data.map((category: Category) => {
                    const currentName = categoryDrafts[category.id] ?? category.name
                    const isDirty = currentName.trim() !== category.name

                    return (
                      <div
                        className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                        key={category.id}
                      >
                        <input
                          className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                          value={currentName}
                          onChange={(event) =>
                            setCategoryDrafts((current) => ({
                              ...current,
                              [category.id]: event.target.value,
                            }))
                          }
                        />

                        <button
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={updateMutation.isPending || !isDirty || !currentName.trim()}
                          onClick={() => handleSaveCategory(category.id)}
                          type="button"
                        >
                          {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                        </button>

                        <button
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDeleteCategory(category.id)}
                          type="button"
                        >
                          {deleteMutation.isPending ? "Удаление..." : "Удалить"}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
