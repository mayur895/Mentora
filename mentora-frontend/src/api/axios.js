import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL()
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mentora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
