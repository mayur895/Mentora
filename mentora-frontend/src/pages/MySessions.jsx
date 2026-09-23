import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ sessionId: null, rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState({});
  const [bannerMsg, setBannerMsg] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await api.get("/sessions/mine");
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      api
        .post("/payments/confirm-payment", { sessionId })
        .then(() => {
          setBannerMsg("🎉 Payment successful! Your session is confirmed.");
          setSearchParams({});
          fetchSessions();
        })
        .catch(() => {
          fetchSessions();
        });
    } else if (paymentStatus === "cancelled") {
      setBannerMsg("⚠️ Payment was cancelled. You can try booking again.");
      setSearchParams({});
      fetchSessions();
    } else {
      fetchSessions();
    }
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/sessions/${id}/status`, { status });
    fetchSessions();
  };

  const handleReviewSubmit = async (sessionId) => {
    try {
      await api.post("/reviews", {
        sessionId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      setReviewMsg({ [sessionId]: "Review submitted successfully!" });
      setReviewForm({ sessionId: null, rating: 5, comment: "" });
      fetchSessions();
    } catch (err) {
      setReviewMsg({ [sessionId]: err.response?.data?.message || "Failed to submit review" });
    }
  };

  if (loading) return <div className="page">Loading sessions...</div>;

  return (
    <div className="page">
      <h1>My Sessions</h1>
      {bannerMsg && <p className="info" style={{ fontWeight: 600, fontSize: "1.05rem" }}>{bannerMsg}</p>}
      {sessions.length === 0 ? (
        <p>No sessions yet. Go find a mentor!</p>
      ) : (
        <div className="session-list">
          {sessions.map((s) => {
            const isMentor = s.mentorId?._id === user?._id || s.mentorId === user?._id;
            const otherParty = isMentor ? s.studentId : s.mentorId;
            const isStudentCompleted = !isMentor && s.status === "completed";
            const showReviewInput = reviewForm.sessionId === s._id;

            return (
              <div key={s._id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className={`session-card status-${s.status}`}>
                  <div>
                    <h3>{s.skill} <span className="badge">{s.status}</span></h3>
                    <p>With {otherParty?.name || "..."} · {new Date(s.scheduledAt).toLocaleString()}</p>
                    <p>{s.duration} min · ${s.price} · {s.type}</p>
                  </div>
                  <div className="session-actions">
                    {isMentor && s.status === "pending" && (
                      <button onClick={() => updateStatus(s._id, "confirmed")}>Confirm</button>
                    )}
                    {s.status !== "cancelled" && s.status !== "completed" && (
                      <button className="secondary" onClick={() => updateStatus(s._id, "cancelled")}>
                        Cancel
                      </button>
                    )}
                    {isMentor && s.status === "confirmed" && (
                      <button onClick={() => updateStatus(s._id, "completed")}>Mark Completed</button>
                    )}
                    {isStudentCompleted && (
                      <button
                        className="secondary"
                        onClick={() =>
                          setReviewForm((prev) =>
                            prev.sessionId === s._id ? { sessionId: null, rating: 5, comment: "" } : { sessionId: s._id, rating: 5, comment: "" }
                          )
                        }
                      >
                        {showReviewInput ? "Close Review" : "Leave a Review"}
                      </button>
                    )}
                  </div>
                </div>

                {reviewMsg[s._id] && <p className="info" style={{ margin: "0 0 8px 8px" }}>{reviewMsg[s._id]}</p>}

                {showReviewInput && (
                  <div className="booking-form" style={{ maxWidth: "100%", margin: "0 0 16px 0", background: "var(--card-bg)" }}>
                    <h4>Leave a Review for {otherParty?.name}</h4>
                    <label>
                      Rating
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5/5 - Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5 - Good)</option>
                        <option value="3">⭐⭐⭐ (3/5 - Average)</option>
                        <option value="2">⭐⭐ (2/5 - Below Expectation)</option>
                        <option value="1">⭐ (1/5 - Poor)</option>
                      </select>
                    </label>
                    <label>
                      Comment
                      <textarea
                        rows="3"
                        placeholder="Share your experience learning with this mentor..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
                      />
                    </label>
                    <button type="button" onClick={() => handleReviewSubmit(s._id)}>Submit Review</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
