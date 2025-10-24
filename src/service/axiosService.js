import axios from "axios";
import { getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken, setAccessToken } from "./storeService";

const noAuthEndpoints = ["/auth", "/auth/refresh"];

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (!noAuthEndpoints.some((url) => config.url?.includes(url))) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        window.location.href = "/auth";
        return Promise.reject(new Error("No access token"));
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          window.location.href = "/auth";
          return Promise.reject(new Error("No refresh token"));
        }

        // ⚠️ Gọi trực tiếp axios (ko dùng axiosInstance) để tránh interceptor lặp
        const res = await axios.post("http://localhost:8080/api/v1/auth/refresh", {
          token: refreshToken,
        });
        console.log("token ",res.data.data.accessToken);
        const newAccessToken = res.data.data.accessToken;
        setAccessToken(newAccessToken);

        // Cập nhật header mặc định
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        removeAccessToken();
        removeRefreshToken();
        console.error("Refresh token failed:", err);
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
