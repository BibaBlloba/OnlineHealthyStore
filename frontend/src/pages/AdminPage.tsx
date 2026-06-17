import { useAuth } from "../store/auth"

export default function AdminPage() {
  const user = useAuth((s) => s.user)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        Admin Panel
      </h1>

      <p className="text-gray-600 mb-8">
        Welcome, {user?.first_name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-2">
            Products
          </h2>

          <p className="text-sm text-gray-500">
            Manage food items
          </p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-2">
            Orders
          </h2>

          <p className="text-sm text-gray-500">
            View customer orders
          </p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-2">
            Users
          </h2>

          <p className="text-sm text-gray-500">
            Manage customers
          </p>
        </div>

      </div>
    </div>
  )
}
