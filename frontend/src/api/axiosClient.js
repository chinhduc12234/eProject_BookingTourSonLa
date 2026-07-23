import axios from "axios";
import { clearAuthSession } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";

const defaultApiBaseURL = import.meta.env.DEV
  ? "http://localhost:8080/api"
  : "/api";
const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseURL;

const axiosClient = axios.create({
  baseURL: apiBaseURL.replace(/\/+$/, ""),
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
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
    error.userMessage = getApiErrorMessage(error);
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
