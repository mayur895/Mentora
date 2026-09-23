import { Link } from "react-router-dom";

export default function MentorCard({ mentor }) {
  return (
    <div className="mentor-card">
      <div className="mentor-card-header">
        <div className="avatar-placeholder">{mentor.userId?.name?.[0] || "?"}</div>
        <div>
          <h3>{mentor.userId?.name || "Unnamed Mentor"}</h3>
          <p className="rate">${mentor.hourlyRate}/hr</p>
        </div>
      </div>
      <p className="bio">{mentor.bio?.slice(0, 100)}{mentor.bio?.length > 100 ? "..." : ""}</p>
      <div className="skills">
        {mentor.skills?.slice(0, 4).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
      <div className="mentor-card-footer">
        <span>⭐ {mentor.rating?.avg?.toFixed(1) || "New"} ({mentor.rating?.count || 0})</span>
        <Link to={`/mentors/${mentor._id}`} className="view-btn">View Profile</Link>
      </div>
    </div>
  );
}
