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
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.message;

      if (errorCode === 400_002) {
        // ✅ Chỉ redirect nếu chưa ở trang required-update-profile
        if (window.location.pathname !== "/required-update-profile") {
          window.location.replace("/required-update-profile");
        }
        return;
      }

      addAlert?.({
        type: "error",
        message: errorMessage || "Không thể tải dữ liệu người dùng!",
      });
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  const login = async (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  };

  const logout = useCallback(() => {
    removeAccessToken();
    removeRefreshToken();
    setUser(null);
    setAccount(null);
    addAlert({
      type: "success",
      message: "Đăng xuất thành công",
    });
  }, [addAlert]);

  useEffect(() => {
    const token = getAccessToken();
    // ✅ Không gọi getCurrentUser khi đang ở trang required-update-profile
    if (token && window.location.pathname !== "/required-update-profile") {
      getCurrentUser();
    } else {
      setLoading(false);
    }
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
