import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth"

export default function AdminPage() {
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-3xl font-semibold mb-2 text-slate-50">
        Admin Panel
      </h1>

      <p className="text-slate-400 mb-8">
        Welcome, {user?.first_name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <button
          onClick={() => navigate("/admin/products")}
          className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
        >
          <h2 className="font-semibold mb-2">
            Products
          </h2>

          <p className="text-sm text-slate-400">
            Manage food items
          </p>
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/5"
        >
          <h2 className="font-semibold mb-2">
            Orders
          </h2>

          <p className="text-sm text-slate-400">
            View customer orders
          </p>
        </button>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-left">
          <h2 className="font-semibold mb-2 text-slate-50">
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
