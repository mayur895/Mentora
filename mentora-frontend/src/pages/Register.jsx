import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/mentors");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} autoComplete="name" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="email" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">I'm a Student</option>
          <option value="mentor">I'm a Mentor</option>
        </select>
        <button type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
