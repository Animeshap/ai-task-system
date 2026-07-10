import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAdmin, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">AI</span>
        Task &amp; Knowledge
      </NavLink>

      <nav className="nav-links">
        {isAdmin ? (
          <>
            <NavLink to="/admin/documents" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Documents
            </NavLink>
            <NavLink to="/admin/tasks" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Tasks
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Analytics
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Search
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/tasks" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              My Tasks
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Search
            </NavLink>
          </>
        )}
      </nav>

      <div className="nav-right">
        <div className="user-chip">
          <span className={`role-badge${role === "user" ? " user" : ""}`}>{role}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
