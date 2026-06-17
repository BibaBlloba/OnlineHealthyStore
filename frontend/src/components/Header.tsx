import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth"
import { logout } from "../api/auth"
import { useCart } from "../store/cart"

export default function Header() {
  const navigate = useNavigate()

  const user = useAuth((s) => s.user)
  const cartCount = useCart((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  )

  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 text-slate-100">

        <div
          className="cursor-pointer text-lg font-semibold tracking-wide text-slate-100 transition hover:text-emerald-300"
          onClick={() => navigate("/")}
        >
          FoodShop
        </div>

        <div className="flex gap-3">

          {user && (
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              onClick={() => navigate("/cart")}
            >
              Корзина {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          )}

          {user?.role_id === 1 && (
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              onClick={() => navigate("/admin")}
            >
              Админка
            </button>
          )}

          {!user ? (
            <button
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              onClick={() => navigate("/auth")}
            >
              Login / Register
            </button>
          ) : (
            <>
              <span className="flex items-center">
                {user.first_name}
              </span>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-rose-400/40 hover:bg-rose-400/10"
                onClick={async () => {
                  await logout()

                  useAuth.getState().logout()
                  useCart.getState().reset()

                  navigate("/")
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
