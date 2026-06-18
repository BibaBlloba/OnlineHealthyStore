import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteUser, getUsers, type AdminUser } from "../../api/auth"
import { useAuth } from "../../store/auth"

const roleLabel = (roleId?: number) => (roleId === 1 ? "Admin" : "User")

export default function UsersPage() {
  const queryClient = useQueryClient()
  const currentUserId = useAuth((s) => s.user?.id)

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  if (usersQuery.isLoading) {
    return (
      <div className="min-h-[calc(100svh-73px)] bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto max-w-6xl text-slate-400">Loading users...</div>
      </div>
    )
  }

  if (usersQuery.isError || !usersQuery.data) {
    return (
      <div className="min-h-[calc(100svh-73px)] bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto max-w-6xl text-rose-300">
          Не удалось загрузить пользователей
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
            Admin users
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">
            Пользователи
          </h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl shadow-black/30 backdrop-blur">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/5 text-sm text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">ID</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {usersQuery.data.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-5 py-4 text-sm text-slate-400">#{user.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-50">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${user.role_id === 1
                          ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                        }`}
                    >
                      {roleLabel(user.role_id)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Delete ${user.first_name} ${user.last_name}?`
                        )

                        if (confirmed) {
                          deleteMutation.mutate(user.id)
                        }
                      }}
                      type="button"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usersQuery.data.length === 0 && (
            <div className="border-t border-white/10 px-5 py-8 text-center text-slate-400">
              Пока нет пользователей.
            </div>
          )}
        </div>

        {currentUserId && (
          <div className="text-sm text-slate-500">
            Текущий пользователь: #{currentUserId}
          </div>
        )}
      </div>
    </div>
  )
}
