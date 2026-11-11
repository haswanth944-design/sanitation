import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function ProtectedRoute({ roles, children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="p-8">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <p className="p-8">Loading profile…</p>
  if (roles && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />
  return children
}
