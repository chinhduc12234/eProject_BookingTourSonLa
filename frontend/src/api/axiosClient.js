import axios from "axios";

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

export default axiosClient;
