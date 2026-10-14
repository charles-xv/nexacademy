import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BookOpen, Users, Wallet, PlayCircle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonList } from "../components/Skeleton";
import { CURRENCY } from "../data/currency";
import "./InstructorOverviewPage.css";
import { API_URL } from "../api";


function InstructorOverviewPage({ user, logout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/get-instructor-overview.php?instructor_id=${user.id}`,
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        setData(null);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const stats = data?.stats;
  const hasCourses = (stats?.courses ?? 0) > 0;

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="instr-banner">
        <h2>Welcome, {user?.name}!</h2>
        <p>
          {hasCourses
            ? `You have ${stats.published} published course${stats.published === 1 ? "" : "s"} and ${stats.students} student${stats.students === 1 ? "" : "s"}.`
            : "You haven't created any courses yet. Create your first one to start teaching."}
        </p>
      </div>

      <div className="instr-stats">
        <div className="instr-stat-box">
          <BookOpen size={18} />
          <div>
            <p>{stats?.published ?? 0}</p>
            <span>Courses published</span>
          </div>
        </div>
        <div className="instr-stat-box">
          <Users size={18} />
          <div>
            <p>{stats?.students ?? 0}</p>
            <span>Total students</span>
          </div>
        </div>
        <div className="instr-stat-box">
          <Wallet size={18} />
          <div>
            <p>
              {CURRENCY}
              {data ? Number(data.earnings.estimated).toLocaleString() : 0}
            </p>
            <span>Estimated earnings</span>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h3>My courses</h3>
        <Link to="/instructor/courses" className="see-all">
          See all
        </Link>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : !data || data.recent.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>No courses yet</p>
          <span>Create your first course to start teaching</span>
          <Link to="/instructor/courses" className="instr-empty-btn">
            Create a course
          </Link>
        </div>
      ) : (
        <div className="instr-recent-list">
          {data.recent.map((course) => (
            <Link
              to={`/instructor/courses/${course.id}/lessons`}
              className="instr-recent-row"
              key={course.id}
            >
              <div className="instr-recent-thumb">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    loading="lazy"
                  />
                ) : (
                  <BookOpen size={18} />
                )}
              </div>
              <div className="instr-recent-info">
                <p>{course.title}</p>
                <span className={`instr-recent-status status-${course.status}`}>
                  {course.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div className="instr-recent-meta">
                <span>
                  <Users size={13} /> {course.student_count}
                </span>
                <span>
                  <PlayCircle size={13} /> {course.lesson_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default InstructorOverviewPage;
