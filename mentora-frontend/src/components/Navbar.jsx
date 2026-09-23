import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Mentora</Link>
      <div className="nav-links">
        <Link to="/mentors">Find Mentors</Link>
        {user ? (
          <>
            <Link to="/sessions">My Sessions</Link>
            {user.role === "mentor" && (
              <Link to="/mentor-dashboard" style={{ color: "var(--primary)", fontWeight: 700 }}>My Profile</Link>
            )}
            {user.role === "admin" && <Link to="/admin" style={{ color: "#dc2626", fontWeight: 700 }}>Admin Panel</Link>}
            <span className="nav-user">Hi, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
