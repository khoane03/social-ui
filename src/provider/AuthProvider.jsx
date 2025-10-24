import { createContext, useEffect, useState, useCallback } from "react";
import {
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../service/storeService";
import { useAlerts } from "../context/AlertContext";
import userService from "../service/userService";
import accountService from "../service/accountService";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addAlert } = useAlerts();

  const getCurrentUser = useCallback(async () => {
    try {
      const [accountRes, userRes] = await Promise.all([
        accountService.getAccountLogin(),
        userService.getUserLogin(),
      ]);
      setAccount(accountRes?.data || null);
      setUser(userRes?.data || null);
    } catch (err) {
      addAlert?.({
        type: "error",
        message:
          err?.response?.data?.message || "Không thể tải dữ liệu người dùng!",
      });
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  const login = useCallback(async (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    await getCurrentUser();
  }, [getCurrentUser]);

  const logout = useCallback(() => {
    removeAccessToken();
    removeRefreshToken();
    setUser(null);
    setAccount(null);
    addAlert({
      type: "success",
      message: "Đăng xuất thành công",
    });
    setTimeout(() => {
      window.location.href = "/auth";
    }, 1000);
  }, [addAlert]);

  useEffect(() => {
    const token = getAccessToken();
    if (token) getCurrentUser();
    else setLoading(false);
  }, [getCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        loading,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
