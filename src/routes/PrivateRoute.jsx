import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ redirectTo = '/auth', onlyRoleAdmin = 'ROLE_ADMIN' }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
};
export default PrivateRoute;
