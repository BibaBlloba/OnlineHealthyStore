import { Navigate } from "react-router-dom"
import { useAuth } from "../store/auth"

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const user = useAuth((s) => s.user)

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
