import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLogin, useRegister } from "../hooks/useAuth"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const navigate = useNavigate()

  const login = useLogin()
  const register = useRegister()

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (mode === "login") {
      login.mutate({
        email: form.email,
        password: form.password,
      }, {
        onSuccess: () => navigate("/"),
      })
    } else {
      register.mutate({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      }, {
        onSuccess: () => navigate("/"),
      })
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-[400px] bg-white p-6 rounded-xl shadow">

        {/* Tabs */}
        <div className="flex mb-4">
          <button
            className={`flex-1 p-2 ${mode === "login" ? "bg-black text-white" : "bg-gray-200"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`flex-1 p-2 ${mode === "register" ? "bg-black text-white" : "bg-gray-200"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <input
            className="border p-2"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          {mode === "register" && (
            <>
              <input
                className="border p-2"
                name="first_name"
                placeholder="First name"
                onChange={handleChange}
              />

              <input
                className="border p-2"
                name="last_name"
                placeholder="Last name"
                onChange={handleChange}
              />
            </>
          )}

          <input
            className="border p-2"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={handleSubmit}
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </div>

      </div>
    </div>
  )
}
