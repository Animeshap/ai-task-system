import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Home from "./pages/Home";
import Search from "./pages/Search";
import UserTasks from "./pages/user/UserTasks";
import UploadDocs from "./pages/admin/UploadDocs";
import AdminTasks from "./pages/admin/AdminTasks";
import Analytics from "./pages/admin/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/tasks" element={<UserTasks />} />
            </Route>
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/documents" element={<UploadDocs />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
