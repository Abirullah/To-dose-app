import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "https://to-dose-app-2ct7.vercel.app").replace(/\/+$/, ""),
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthSession();
      if (window.location.pathname !== "/AccountLogin") {
        window.location.href = "/AccountLogin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
