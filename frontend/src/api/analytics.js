import api from "./axiosInstance";

export function getAnalytics() {
  return api.get("/analytics");
}
