import axios from "axios";

let rawBaseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://campuslink-4n0x.onrender.com/api/v1"
    : "http://127.0.0.1:8006/api/v1");

rawBaseURL = rawBaseURL.trim().replace(/\/+$/, "");
if (!rawBaseURL.endsWith("/api/v1")) {
  rawBaseURL += "/api/v1";
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campuslink_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("campuslink_token");
      localStorage.removeItem("campuslink_user");
    }

    return Promise.reject(error);
  }
);

export default api;