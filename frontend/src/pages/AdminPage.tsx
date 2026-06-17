import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth"

export default function AdminPage() {
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()

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
          <p className="mt-2 text-slate-400">
            Welcome, {user?.first_name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Users
            </h2>

            <p className="text-sm text-slate-400">
              Manage customers and admins
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/products")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Products
            </h2>

            <p className="text-sm text-slate-400">
              Manage food items
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Orders
            </h2>

            <p className="text-sm text-slate-400">
              View customer orders
            </p>
          </button>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left">
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Categories
            </h2>

            <p className="text-sm text-slate-400">
              Categories management is not implemented yet.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
