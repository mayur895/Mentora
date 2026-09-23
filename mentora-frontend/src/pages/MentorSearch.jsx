import { useEffect, useState } from "react";
import api from "../api/axios.js";
import MentorCard from "../components/MentorCard.jsx";

export default function MentorSearch() {
  const [mentors, setMentors] = useState([]);
  const [skill, setSkill] = useState("");
  const [sort, setSort] = useState("rating");
  const [loading, setLoading] = useState(true);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/mentors", { params: { skill, sort } });
      setMentors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  return (
    <div className="page">
      <h1>Find a Mentor</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by skill (e.g. React, SQL, UI Design)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Top Rated</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p>Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p>No mentors found. Try a different skill.</p>
      ) : (
        <div className="mentor-grid">
          {mentors.map((mentor) => (
            <MentorCard key={mentor._id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
