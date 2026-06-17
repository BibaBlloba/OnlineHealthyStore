import { Navigate } from "react-router-dom"
import { useAuth } from "../store/auth"

type Props = {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const user = useAuth((s) => s.user)

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (user.role_id !== 1) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
