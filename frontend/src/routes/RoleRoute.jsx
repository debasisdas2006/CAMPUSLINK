import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RoleRoute({
  allowedRole,
}) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  /* =====================================
     NOT LOGGED IN
  ===================================== */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================
     ADMIN = SUPER ADMIN
     
     Admin can access:
     - Student features
     - Recruiter features
     - Admin features
  ===================================== */

  if (user?.role === "admin") {
    return <Outlet />;
  }

  /* =====================================
     NORMAL ROLE CHECK
  ===================================== */

  if (
    !user ||
    user.role !== allowedRole
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;