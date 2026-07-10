import api from "./axiosInstance";

export function listTasks({ status, assignedTo } = {}) {
  const params = {};
  if (status) params.status = status;
  if (assignedTo) params.assigned_to = assignedTo;
  return api.get("/tasks", { params });
}

export function createTask(payload) {
  // payload: { title, description, assigned_to }
  return api.post("/tasks", payload);
}

export function updateTaskStatus(taskId, status) {
  return api.patch(`/tasks/${taskId}/status`, { status });
}
