import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Search, ClipboardList, BookOpen, PlayCircle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import NotificationBell from "../components/NotificationBell";
import { SkeletonCourseGrid } from "../components/Skeleton";
import { getDailyQuote } from "../data/quotes";
import "./DashboardPage.css";
import { API_URL } from "../api";


function DashboardPage({ user, logout }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const searchInputRef = useRef(null);

  const [enrolled, setEnrolled] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => setSearchVisible(true));
  };

  const closeSearch = () => {
    setSearchVisible(false);
    setTimeout(() => setSearchOpen(false), 300);
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowQuote(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          `${API_URL}/get-student-dashboard.php?student_id=${user.id}`,
        );
        const data = await response.json();
        setEnrolled(Array.isArray(data.enrolled) ? data.enrolled : []);
        setRecommended(Array.isArray(data.recommended) ? data.recommended : []);
      } catch (err) {
        setEnrolled([]);
        setRecommended([]);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  // The tabs now filter real enrolments instead of decorating an empty list.
  const term = query.trim().toLowerCase();
  const visibleCourses = enrolled
    .filter((c) => {
      if (tab === "active") return c.progress_percent < 100;
      if (tab === "completed") return c.progress_percent >= 100;
      return true;
    })
    .filter((c) => !term || c.title.toLowerCase().includes(term));

  const initialsOf = (title) =>
    title
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="hello-banner">
        <div className="hello-banner-top">
          <div>
            <h2>Welcome, {user?.name}!</h2>
            <p className="hello-subtext" key={showQuote ? "quote" : "intro"}>
              {showQuote ? (
                getDailyQuote()
              ) : enrolled.length === 0 ? (
                <>
                  You haven't enrolled in any courses yet. <br /> Browse our
                  catalog to find something to start learning.
                </>
              ) : (
                <>
                  You're enrolled in {enrolled.length} course
                  {enrolled.length === 1 ? "" : "s"}. <br /> Pick up where you
                  left off.
                </>
              )}
            </p>
          </div>
          <div className="hello-banner-right">
            {!searchOpen && (
              <button
                className="hello-search-icon-btn"
                onClick={openSearch}
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            )}
            {searchOpen && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search your courses…"
                className={`hello-search-input${searchVisible ? " open" : ""}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={closeSearch}
              />
            )}
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="section-head">
        <h3>My courses</h3>
        <Link to="/dashboard/courses" className="see-all">
          See all
        </Link>
      </div>

      <div className="course-tabs">
        {["all", "active", "completed"].map((key) => (
          <span
            key={key}
            className={`course-tab${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {key === "all" ? "All" : key === "active" ? "Active" : "Completed"}
          </span>
        ))}
      </div>

      {loading ? (
        <SkeletonCourseGrid count={2} className="course-grid" />
      ) : visibleCourses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>
            {enrolled.length === 0
              ? "No courses yet"
              : tab === "completed"
                ? "Nothing completed yet"
                : "Nothing in progress"}
          </p>
          <span>
            {enrolled.length === 0
              ? "Enroll in a course to see it here"
              : "Keep going — finish a lesson to move things along"}
          </span>
        </div>
      ) : (
        <div className="course-grid">
          {visibleCourses.map((course) => (
            <Link
              to={`/dashboard/courses/${course.id}`}
              className="course-card"
              key={course.id}
            >
              <div className="course-top">
                <div className="course-avatar">{initialsOf(course.title)}</div>
                <div className="course-info">
                  <p>{course.title}</p>
                  <span>{course.instructor_name}</span>
                </div>
                <span className={`level-tag level-${course.access_tier}`}>
                  {course.access_tier === "free" ? "Free" : "Pro"}
                </span>
              </div>
              <div className="course-progress-bar">
                <div
                  className="course-progress-fill"
                  style={{ width: `${course.progress_percent}%` }}
                />
              </div>
              <div className="course-foot">
                Completed: <b>{course.progress_percent}%</b>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="section-head">
        <h3>Recommended for you</h3>
        <Link to="/dashboard/browse" className="see-all">
          Browse all
        </Link>
      </div>

      {loading ? (
        <SkeletonCourseGrid count={4} className="recommend-grid" />
      ) : recommended.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>You're enrolled in everything available</p>
          <span>New courses will show up here as instructors publish them</span>
        </div>
      ) : (
        <div className="recommend-grid">
          {recommended.map((course) => (
            <Link
              to="/dashboard/browse"
              className="recommend-card"
              key={course.id}
            >
              <div className="recommend-thumb">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    loading="lazy"
                  />
                ) : (
                  <BookOpen size={26} />
                )}
                <span className={`level-tag level-${course.access_tier}`}>
                  {course.access_tier === "free" ? "Free" : "Pro"}
                </span>
              </div>
              <div className="recommend-body">
                <p>{course.title}</p>
                <span>{course.instructor_name}</span>
                <div className="recommend-foot">
                  {/* No ratings table exists, so lesson count is shown
                      instead of an invented score. */}
                  <span className="recommend-meta">
                    <PlayCircle size={11} /> {course.lesson_count} lesson
                    {course.lesson_count === "1" ? "" : "s"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="section-head">
        <h3>Assignments</h3>
      </div>

      <div className="empty-state">
        <ClipboardList size={26} />
        <p>No assignments yet</p>
        <span>Assignments aren't part of the platform yet</span>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
