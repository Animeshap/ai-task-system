import api from "./axiosInstance";

export function listDocuments() {
  return api.get("/documents");
}

export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
