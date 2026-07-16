import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth({ roles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user?.role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={defaultPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

function defaultPathForRole(role) {
  if (role === "super_owner") return "/super-owner/dashboard";
  if (role === "company_owner") return "/company-owner/dashboard";
  if (role === "worker") return "/worker/dashboard";

  if (role === "project_owner" || role === "project_manager") {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const projectId = user?.projectIds?.[0];
      return projectId
        ? `/project-owner/${projectId}/dashboard`
        : "/project-owner/dashboard";
    } catch {
      return "/project-owner/dashboard";
    }
  }

  return "/login";
}
