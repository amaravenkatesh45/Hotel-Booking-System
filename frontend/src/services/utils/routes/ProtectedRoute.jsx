import { Navigate } from "react-router-dom";
import { getToken } from "../utils/authUtils";

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;