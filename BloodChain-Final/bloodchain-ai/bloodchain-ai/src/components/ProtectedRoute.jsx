import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/rbac";
import AccessDenied from "../pages/AccessDenied";

export default function ProtectedRoute({ allowedRoles = null, children = null }) {
  const { isAuthenticated, user, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const effectiveRole = role || normalizeRole(user?.role);

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    if (!normalizedAllowed.includes(effectiveRole)) {
      return <AccessDenied currentRole={effectiveRole} allowedRoles={normalizedAllowed} />;
    }
  }

  return children ? children : <Outlet />;
}
