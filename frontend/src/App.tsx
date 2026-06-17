import { Routes, Route } from "react-router-dom"

import { useCurrentUser } from "./hooks/useCurrentUser"

import HomePage from "./pages/HomePage"
import CartPage from "./pages/CartPage"
import AuthPage from "./pages/AuthPage"
import AdminPage from "./pages/AdminPage"

import MainLayout from "./layouts/MainLayout"

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

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}
