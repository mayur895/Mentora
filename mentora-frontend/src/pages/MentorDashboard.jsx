import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const SKILL_SUGGESTIONS = [
  "React", "JavaScript", "TypeScript", "Node.js", "Python", "Django",
  "Vue.js", "Angular", "Next.js", "GraphQL", "AWS", "Docker",
  "Kubernetes", "Machine Learning", "Data Science", "UI/UX Design",
  "Figma", "Flutter", "Swift", "Kotlin", "Java", "C++", "Ruby on Rails"
];

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    bio: "",
    skills: [],
    hourlyRate: "",
    currency: "USD",
    portfolioLinks: [""]
  });

  // Redirect non-mentors
  useEffect(() => {
    if (user && user.role !== "mentor") {
      navigate("/mentors");
    }
  }, [user, navigate]);

  // Load existing profile
  useEffect(() => {
    if (!user) return;
    api
      .get("/mentors/my-profile")
      .then(({ data }) => {
        setProfile(data);
        setForm({
          bio: data.bio || "",
          skills: data.skills || [],
          hourlyRate: data.hourlyRate || "",
          currency: data.currency || "USD",
          portfolioLinks: data.portfolioLinks?.length ? data.portfolioLinks : [""]
        });
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setProfile(null); // No profile yet
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Skills management
  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm({ ...form, skills: [...form.skills, trimmed] });
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((x) => x !== s) });

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  // Portfolio links
  const updateLink = (i, val) => {
    const links = [...form.portfolioLinks];
    links[i] = val;
    setForm({ ...form, portfolioLinks: links });
  };

  const addLink = () => setForm({ ...form, portfolioLinks: [...form.portfolioLinks, ""] });
  const removeLink = (i) =>
    setForm({ ...form, portfolioLinks: form.portfolioLinks.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...form,
      hourlyRate: Number(form.hourlyRate),
      portfolioLinks: form.portfolioLinks.filter((l) => l.trim() !== "")
    };

    try {
      const { data } = await api.put("/mentors/my-profile", payload);
      const isNew = !profile;
      setProfile(data);
      setMessage({
        text: isNew
          ? "🎉 Profile created! You're now listed as a mentor."
          : "✅ Profile updated successfully!",
        type: "success"
      });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to save profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };


  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s)
  );

  if (loading) return <div className="page">Loading your profile...</div>;

  return (
    <div className="page mentor-dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>{profile ? "Edit Your Mentor Profile" : "Create Your Mentor Profile"}</h1>
          <p className="dashboard-sub">
            {profile
              ? "Update your details to attract more students."
              : "Set up your profile to start receiving session bookings."}
          </p>
        </div>
        {profile && (
          <a
            href={`/mentors/${profile._id}`}
            className="view-btn"
            target="_blank"
            rel="noreferrer"
          >
            👁 View Public Profile
          </a>
        )}
      </div>

      {/* ── Status banner ── */}
      {profile && (
        <div className={`status-banner status-${profile.verificationStatus}`}>
          {profile.verificationStatus === "verified" && "✅ Your profile is verified and visible to students."}
          {profile.verificationStatus === "pending" && "⏳ Your profile is pending admin verification."}
          {profile.verificationStatus === "rejected" && "❌ Your profile was rejected. Please update and resubmit."}
        </div>
      )}

      {/* ── Message ── */}
      {message.text && (
        <p className={message.type === "success" ? "info save-msg" : "error save-msg"}>
          {message.text}
        </p>
      )}

      {/* ── Form ── */}
      <form className="mentor-profile-form" onSubmit={handleSubmit}>
        {/* Bio */}
        <div className="form-section">
          <h3>👤 About You</h3>
          <label>
            Bio <span className="field-hint">(Tell students about your experience)</span>
            <textarea
              name="bio"
              rows="5"
              placeholder="e.g. I'm a senior React developer with 6 years of experience building production apps. I love teaching clean code principles and modern frontend patterns..."
              value={form.bio}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>🛠 Skills & Expertise</h3>
          <label>
            Add Skills <span className="field-hint">(Press Enter or click a suggestion)</span>
            <div className="skill-input-wrapper">
              <input
                type="text"
                placeholder="Type a skill (e.g. React, Python...)"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
                <div className="skill-suggestions">
                  {filteredSuggestions.slice(0, 6).map((s) => (
                    <div key={s} className="suggestion-item" onMouseDown={() => addSkill(s)}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>
          <div className="skills">
            {form.skills.map((s) => (
              <span key={s} className="skill-tag editable">
                {s}
                <button type="button" className="skill-remove" onClick={() => removeSkill(s)}>
                  ×
                </button>
              </span>
            ))}
            {form.skills.length === 0 && (
              <span className="field-hint">No skills added yet. Type above to add some.</span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>💰 Pricing</h3>
          <div className="form-row">
            <label>
              Hourly Rate
              <div className="rate-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  name="hourlyRate"
                  type="number"
                  min="1"
                  max="999"
                  placeholder="e.g. 40"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "28px" }}
                />
              </div>
            </label>
            <label>
              Currency
              <select name="currency" value={form.currency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </label>
          </div>
          {form.hourlyRate && (
            <p className="price-preview">
              Students will see: <strong>${form.hourlyRate}/hr</strong> · A 60-min session costs <strong>${form.hourlyRate}</strong>
            </p>
          )}
        </div>

        {/* Portfolio */}
        <div className="form-section">
          <h3>🔗 Portfolio Links <span className="field-hint">(optional)</span></h3>
          {form.portfolioLinks.map((link, i) => (
            <div key={i} className="portfolio-link-row">
              <input
                type="url"
                placeholder="https://github.com/username or https://yourwebsite.com"
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
              />
              {form.portfolioLinks.length > 1 && (
                <button type="button" className="secondary icon-btn" onClick={() => removeLink(i)}>
                  🗑
                </button>
              )}
            </div>
          ))}
          <button type="button" className="secondary add-link-btn" onClick={addLink}>
            + Add Another Link
          </button>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" disabled={saving} className="save-btn">
            {saving ? "Saving..." : profile ? "💾 Save Changes" : "🚀 Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
