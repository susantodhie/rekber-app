import axios from "axios";

const API_BASE = import.meta.env.DEV ? "" : "https://rekberinsaja-api-production.up.railway.app";

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — unwrap { success, data, pagination } envelope
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    const apiError = error.response?.data || { success: false, error: error.message };
    return Promise.reject(apiError);
  }
);

export default apiClient;
