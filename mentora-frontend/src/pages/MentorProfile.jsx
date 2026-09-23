import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MentorProfile() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ skill: "", type: "1on1", scheduledAt: "", duration: 60 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/mentors/${id}`)
      .then(({ data }) => {
        setMentor(data);
        setForm((f) => ({ ...f, skill: data.skills?.[0] || "General Mentorship" }));
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load mentor profile");
      });

    api
      .get(`/reviews/mentor/${id}`)
      .then(({ data }) => setReviews(data))
      .catch((err) => console.error("Error loading reviews:", err));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setMessage("");

    if (!form.scheduledAt) {
      setMessage("Please select a date and time for the session.");
      return;
    }

    const scheduledDate = new Date(form.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      setMessage("Please select a valid date and time.");
      return;
    }

    if (scheduledDate < new Date()) {
      setMessage("Session time must be scheduled in the future.");
      return;
    }

    if (Number(form.duration) < 15) {
      setMessage("Session duration must be at least 15 minutes.");
      return;
    }

    try {
      const price = Math.round((mentor.hourlyRate * Number(form.duration)) / 60);
      const { data: session } = await api.post("/sessions", {
        mentorId: id,   // pass the MentorProfile _id — backend resolves to userId
        skill: form.skill || mentor.skills?.[0] || "General Mentorship",
        type: form.type,
        scheduledAt: form.scheduledAt,
        duration: Number(form.duration),
        price
      });

      setMessage("Session created! Redirecting to checkout...");

      const { data: checkout } = await api.post("/payments/create-checkout-session", {
        sessionId: session._id
      });

      if (checkout?.url) {
        window.location.href = checkout.url;
      } else {
        navigate("/sessions");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  if (error) return <div className="page error">{error}</div>;
  if (!mentor) return <div className="page">Loading...</div>;

  const skillOptions = (mentor.skills && mentor.skills.length > 0)
    ? mentor.skills
    : ["General Mentorship"];

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar-placeholder large">{mentor.userId?.name?.[0] || "?"}</div>
        <div>
          <h1>{mentor.userId?.name || "Mentor"}</h1>
          <p>${mentor.hourlyRate}/hr · ⭐ {mentor.rating?.avg?.toFixed(1) || "New"} ({mentor.rating?.count || 0})</p>
        </div>
      </div>
      <p className="bio">{mentor.bio}</p>
      <div className="skills">
        {skillOptions.map((s) => <span key={s} className="skill-tag">{s}</span>)}
      </div>

      <h2>Book a Session</h2>
      {message && <p className="info">{message}</p>}
      <form className="booking-form" onSubmit={handleBook}>
        <label>
          Skill
          <select value={form.skill || skillOptions[0]} onChange={(e) => setForm({ ...form, skill: e.target.value })}>
            {skillOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Session Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="1on1">1-on-1</option>
            <option value="group">Group</option>
            <option value="async">Async Q&A</option>
          </select>
        </label>
        <label>
          Date & Time
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            min="15"
            step="15"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </label>
        <p className="price-preview">
          Estimated price: ${Math.round((mentor.hourlyRate * form.duration) / 60)}
        </p>
        <button type="submit">Request Session</button>
      </form>

      <div className="reviews-section" style={{ marginTop: "40px" }}>
        <h2>Reviews & Ratings</h2>
        {reviews.length === 0 ? (
          <p className="rate">No reviews yet for this mentor.</p>
        ) : (
          <div className="reviews-list" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            {reviews.map((rev) => (
              <div key={rev._id} className="review-card" style={{ background: "var(--card-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{rev.studentId?.name || "Student"}</strong>
                  <span>{"⭐".repeat(rev.rating)}</span>
                </div>
                <p style={{ margin: 0, color: "var(--text)" }}>{rev.comment}</p>
                <small style={{ color: "var(--muted)" }}>{new Date(rev.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
