import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return token ? children : navigate("/login");
}

export default ProtectedRoute;
