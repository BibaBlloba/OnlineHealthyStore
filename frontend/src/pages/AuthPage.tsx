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
    <div className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/85 p-6 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
            Account access
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">
            Вход
          </h1>
        </div>

        <div className="flex mb-4">
          <button
            className={`flex-1 rounded-l-2xl border border-white/10 px-4 py-3 transition ${mode === "login" ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`flex-1 rounded-r-2xl border border-l-0 border-white/10 px-4 py-3 transition ${mode === "register" ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          {mode === "register" && (
            <>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                name="first_name"
                placeholder="First name"
                onChange={handleChange}
              />

              <input
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                name="last_name"
                placeholder="Last name"
                onChange={handleChange}
              />
            </>
          )}

          <input
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button
            className="rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400"
            onClick={handleSubmit}
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </div>

      </div>
    </div>
  )
}
