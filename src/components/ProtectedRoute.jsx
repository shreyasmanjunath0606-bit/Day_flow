import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';

/**
 * ProtectedRoute — Wraps dashboard routes to enforce authentication and role-based access.
 * 
 * Props:
 *   - children: The component to render if authorized
 *   - allowedRoles: Optional array of roles (e.g., ['hr']) that can access this route
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  // 1. Check if the user is logged in at all
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  // 2. If specific roles are required, check against the stored user
  if (allowedRoles && allowedRoles.length > 0) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect employees trying to access HR page back to their dashboard
      return <Navigate to="/dashboard/employee" replace />;
    }
  }

  return children;
}
