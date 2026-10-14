import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Play, Lock, Check, ChevronLeft, BookOpen } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonBox, SkeletonList } from "../components/Skeleton";
import "./CoursePlayerPage.css";
import { API_URL } from "../api";


function CoursePlayerPage({ user, logout }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [fullAccess, setFullAccess] = useState(false);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLessons = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-lessons.php?course_id=${courseId}&user_id=${user.id}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not load this course.");
        setLoading(false);
        return;
      }

      setCourse(data.course);
      setLessons(data.lessons);
      setFullAccess(data.full_access);

      // Open the first lesson they can actually watch.
      const firstOpen = data.lessons.find((l) => !l.locked);
      setActive((prev) => prev || firstOpen || null);
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLessons();
  }, [courseId, user.id]);

  const handleComplete = async () => {
    if (!active || active.completed) return;
    try {
      const response = await fetch(`${API_URL}/mark-lesson-complete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user.id, lesson_id: active.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save progress.");
        return;
      }
      setLessons((prev) =>
        prev.map((l) => (l.id === active.id ? { ...l, completed: true } : l)),
      );
      setActive((prev) => ({ ...prev, completed: true }));
    } catch (err) {
      setError("Could not save progress.");
    }
  };

  const doneCount = lessons.filter((l) => l.completed).length;
  const percent = lessons.length
    ? Math.round((doneCount / lessons.length) * 100)
    : 0;

  if (loading) {
    return (
      <DashboardLayout user={user} logout={logout}>
       
        <SkeletonBox width={110} height={13} />
        <div style={{ height: 18 }} />
        <SkeletonBox width="55%" height={22} />
        <div style={{ height: 22 }} />

        <div className="player-layout">
          <div className="player-main">
            <SkeletonBox width="100%" height={0} className="skeleton-thumb" />
          </div>
          <aside className="player-list">
            <SkeletonList count={4} />
          </aside>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !course) {
    return (
      <DashboardLayout user={user} logout={logout}>
        <div className="empty-state">
          <BookOpen size={26} />
          <p>{error}</p>
          <Link to="/dashboard/courses" className="player-back-btn">
            Back to my courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} logout={logout}>
      <Link to="/dashboard/courses" className="player-back">
        <ChevronLeft size={15} /> My courses
      </Link>

      <div className="player-head">
        <div>
          <h1>{course.title}</h1>
          <span className="player-instructor">{course.instructor_name}</span>
        </div>
        <span className={`player-tier tier-${course.access_tier}`}>
          {course.access_tier === "free" ? "Free" : "Pro"}
        </span>
      </div>

      <div className="player-progress">
        <div className="player-progress-track">
          <div
            className="player-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span>
          {doneCount} of {lessons.length} lessons complete
        </span>
      </div>

      {error && <p className="player-error">{error}</p>}

      <div className="player-layout">
        <div className="player-main">
          {lessons.length === 0 ? (
            <div className="player-locked-panel">
              <BookOpen size={30} />
              <p>No lessons yet</p>
              <span>
                The instructor hasn't added any content to this course
              </span>
            </div>
          ) : active && active.youtube_video_id ? (
            <>
              <div className="player-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${active.youtube_video_id}`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="player-embed-hint">
                Video not loading? The uploader may have disabled embedding.{" "}
                <a
                  href={`https://www.youtube.com/watch?v=${active.youtube_video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </a>
              </p>

              <div className="player-now">
                <div>
                  <p className="player-now-title">{active.title}</p>
                  <span className="player-now-sub">
                    Lesson {active.position}
                  </span>
                </div>
                <button
                  className={`player-complete-btn${active.completed ? " is-done" : ""}`}
                  onClick={handleComplete}
                  disabled={active.completed}
                >
                  {active.completed ? (
                    <>
                      <Check size={14} /> Completed
                    </>
                  ) : (
                    "Mark complete"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="player-locked-panel">
              <Lock size={30} />
              <p>This course is available to Pro members</p>
              <span>Upgrade to unlock every lesson</span>
              <Link to="/dashboard/payments" className="player-upgrade-btn">
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>

        <aside className="player-list">
          <p className="player-list-head">Lessons</p>
          {lessons.map((lesson) => {
            const isActive = active && active.id === lesson.id;
            return (
              <button
                key={lesson.id}
                className={`player-lesson${isActive ? " is-active" : ""}${lesson.locked ? " is-locked" : ""}`}
                onClick={() => !lesson.locked && setActive(lesson)}
                disabled={lesson.locked}
              >
                <span className="player-lesson-icon">
                  {lesson.locked ? (
                    <Lock size={13} />
                  ) : lesson.completed ? (
                    <Check size={13} />
                  ) : (
                    <Play size={13} />
                  )}
                </span>
                <span className="player-lesson-text">
                  <span className="player-lesson-title">{lesson.title}</span>
                  {lesson.is_preview && !fullAccess && (
                    <span className="player-lesson-badge">Free preview</span>
                  )}
                </span>
              </button>
            );
          })}

          {!fullAccess && (
            <div className="player-list-upsell">
              <p>Locked lessons need Pro</p>
              <Link to="/dashboard/payments">Upgrade</Link>
            </div>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default CoursePlayerPage;
