import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Use <Navigate> component (not navigate() function) — safe for render phase.
  // `replace` prevents the user from pressing Back to return to the dashboard.
  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
