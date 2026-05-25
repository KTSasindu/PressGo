import { Navigate, Outlet } from "react-router-dom";
import { getUser, isAuthenticated } from "../utils/authStorage.js";

function ProtectedRoute({ allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
