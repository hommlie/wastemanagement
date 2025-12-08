import React from "react";
import { Navigate } from "react-router-dom";
import { can } from "../utils/permission";

export default function PermissionRoute({ moduleCode, actionCode = "view", children }) {
  const allowed = can(moduleCode, actionCode);
  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
