import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SkeletonCourseGrid } from "../components/Skeleton";
import "./CoursesPage.css";
import { API_URL } from "../api";


function CoursesPage({ theme, toggleTheme }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/get-published-courses.php`);
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setCourses([]);
        setFailed(true);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="courses-page">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="courses-hero">
        <h1>Explore our courses</h1>
        <p>Real, hands-on courses built by working professionals.</p>
      </div>

      <div className="courses-content">
        {loading ? (
          <SkeletonCourseGrid count={8} className="courses-grid" />
        ) : failed ? (
          <div className="courses-empty">
            <BookOpen size={26} />
            <p>Couldn't load the courses</p>
            <span>Check your connection and try again</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-empty">
            <BookOpen size={26} />
            <p>No courses published yet</p>
            <span>Check back soon — instructors are working on it</span>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              const isFree = course.access_tier === "free";
              return (
                <Link to="/register" className="course-tile" key={course.id}>
                  <div className="course-tile-thumb">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        loading="lazy"
                      />
                    ) : (
                      <BookOpen size={26} />
                    )}
                    <span
                      className={`course-tile-level ${isFree ? "level-free" : "level-pro"}`}
                    >
                      {isFree ? "Free" : "Pro"}
                    </span>
                  </div>
                  <div className="course-tile-body">
                    <p className="course-tile-title">{course.title}</p>
                    <span className="course-tile-instructor">
                      {course.instructor_name}
                    </span>
                    {course.description && (
                      <p className="course-tile-description">
                        {course.description}
                      </p>
                    )}
                    <div className="course-tile-foot">
                      <span className="course-tile-price">
                        {isFree ? "Free to watch" : "Included with Pro"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CoursesPage;
