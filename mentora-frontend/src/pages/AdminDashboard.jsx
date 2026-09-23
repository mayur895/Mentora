import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AdminDashboard() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPendingMentors = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/mentors/admin/pending");
      setMentors(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMentors();
  }, []);

  const handleVerify = async (id, status) => {
    setMessage("");
    try {
      await api.patch(`/mentors/${id}/verify`, { verificationStatus: status });
      setMessage(`Mentor profile ${status} successfully!`);
      fetchPendingMentors();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  if (loading) return <div className="page">Loading pending profiles...</div>;

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
        Review and approve pending mentor profile verification requests.
      </p>

      {message && <p className="info">{message}</p>}
      {error && <p className="error">{error}</p>}

      {mentors.length === 0 ? (
        <div style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <p style={{ margin: 0 }}>All mentor verification requests have been processed. No pending profiles found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mentors.map((m) => (
            <div
              key={m._id}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{m.userId?.name || "Unnamed Mentor"}</h3>
                <p style={{ margin: "0 0 6px 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                  {m.userId?.email} · ${m.hourlyRate}/hr
                </p>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>{m.bio}</p>
                <div className="skills">
                  {m.skills?.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleVerify(m._id, "verified")}
                  style={{ background: "#16a34a" }}
                >
                  Approve
                </button>
                <button
                  className="secondary"
                  onClick={() => handleVerify(m._id, "rejected")}
                  style={{ color: "#dc2626", borderColor: "#dc2626" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
