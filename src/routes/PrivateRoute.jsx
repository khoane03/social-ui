import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getAccessToken } from "../service/storeService";
import { useEffect, useState } from "react";
import Loading from "../components/common/Loading";

const PrivateRoute = ({ redirectTo = "/auth", role = "ROLE_USER" }) => {
  const token = getAccessToken();
  const { account, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Wait for account to load
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  // Show loading while checking auth
  if (isChecking || loading) {
    return <Loading />;
  }

  // No token - redirect to login
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if account exists
  if (!account) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role if required
  if (role) {
    const hasRole = account?.roles?.some(r => r.role === role);
    
    if (!hasRole) {
      return <Navigate to="/no-permission" replace />;
    }
  }
  
  return <Outlet />;
};

export default PrivateRoute;