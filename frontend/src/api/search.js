import api from "./axiosInstance";

export function semanticSearch(query, k = 5) {
  return api.get("/search", { params: { q: query, k } });
}
