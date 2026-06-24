import axios from "axios";
import { clearAuthSession } from "../utils/auth";

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: apiBaseURL.replace(/\/+$/, ""),
});

axiosClient.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

let redirectingToLogin = false;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hasToken = Boolean(localStorage.getItem("token"));
    const isAuthPage = ["/login", "/register"].includes(window.location.pathname);

    if (status === 401 && hasToken && !isAuthPage && !redirectingToLogin) {
      redirectingToLogin = true;
      clearAuthSession();
      sessionStorage.setItem(
        "auth_message",
        error?.response?.data?.message ||
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
