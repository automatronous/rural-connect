import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Props:
 *   children      ReactNode  – the page to render
 *   allowedRoles  string[]   – optional list of roles allowed (e.g. ['asha','doctor'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access another role's page
    const home = user.role === 'asha' ? '/asha/dashboard' : '/doctor/dashboard'
    return <Navigate to={home} replace />
  }

  return children
}
