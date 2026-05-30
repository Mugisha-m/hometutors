import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
