import api from "./axiosInstance";

export function login(email, password) {
  return api.post("/auth/login", { email, password });
}

export function registerUser(payload) {
  // payload: { name, email, password, role }
  return api.post("/auth/register", payload);
}
