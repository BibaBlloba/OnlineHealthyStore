import { Routes, Route } from "react-router-dom"

import { useCurrentUser } from "./hooks/useCurrentUser"

import HomePage from "./pages/HomePage"
import CartPage from "./pages/CartPage"
import AuthPage from "./pages/AuthPage"
import AdminPage from "./pages/AdminPage"
import ProductsPage from "./pages/admin/ProductsPage.tsx"
import ReportsPage from "./pages/admin/ReportsPage.tsx"
import OrdersPage from "./pages/admin/OrdersPage"
import UsersPage from "./pages/admin/UsersPage"

import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"

import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

export default function App() {
  useCurrentUser()

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}
