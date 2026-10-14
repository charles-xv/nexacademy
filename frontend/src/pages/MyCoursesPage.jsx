import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonCourseGrid } from "../components/Skeleton";
import "./MyCoursesPage.css";
import { API_URL } from "../api";

function MyCoursesPage({ user, logout }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const response = await fetch(
          `${API_URL}/get-enrolled-courses.php?student_id=${user.id}`,
        );
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setCourses([]);
      }
      setLoading(false);
    };
    fetchEnrolled();
  }, [user.id]);

  return (
    <DashboardLayout user={user} logout={logout}>
    
      <div className="mycourses-header">
        <h1>My courses</h1>
        <p>Everything you're currently enrolled in.</p>
      </div>

      {loading ? (
        <SkeletonCourseGrid count={3} className="mycourses-grid" />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>You haven't enrolled in any courses yet</p>
          <span>Browse the catalogue and enrol to see them here</span>
          <Link to="/dashboard/browse" className="mycourses-browse-btn">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mycourses-grid">
          {courses.map((course) => (
            <Link
              to={`/dashboard/courses/${course.id}`}
              className="mycourse-card"
              key={course.id}
            >
              <div className="mycourse-thumb">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <BookOpen size={26} />
                )}
                <span className={`mycourse-tier tier-${course.access_tier}`}>
                  {course.access_tier === "free" ? "Free" : "Pro"}
                </span>
              </div>
              <div className="mycourse-body">
                <p className="mycourse-title">{course.title}</p>
                <span className="mycourse-instructor">
                  {course.instructor_name}
                </span>
                <div className="mycourse-foot">
                  <div className="mycourse-progress-track">
                    <div
                      className="mycourse-progress-fill"
                      style={{ width: `${course.progress_percent || 0}%` }}
                    />
                  </div>
                  <span className="mycourse-progress-label">
                    {course.progress_percent || 0}% complete
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyCoursesPage;
