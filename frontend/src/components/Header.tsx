import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth"
import { logout } from "../api/auth"

export default function Header() {
  const navigate = useNavigate()

  const user = useAuth((s) => s.user)

  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-between p-4">

        <div
          className="font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          FoodShop
        </div>

        <div className="flex gap-3">

          {user && (
            <button
              className="border px-3 py-1 rounded"
              onClick={() => navigate("/cart")}
            >
              Cart
            </button>
          )}

          {user?.role_id === 1 && (
            <button
              className="border px-3 py-1 rounded"
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
          )}

          {!user ? (
            <button
              className="bg-black text-white px-3 py-1 rounded"
              onClick={() => navigate("/auth")}
            >
              Login / Register
            </button>
          ) : (
            <>
              <span>
                {user.first_name}
              </span>
              <button
                onClick={async () => {
                  await logout()

                  useAuth.getState().logout()

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
