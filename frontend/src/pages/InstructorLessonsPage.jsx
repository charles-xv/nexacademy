import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Plus, Trash2, ChevronLeft, Video, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonList } from "../components/Skeleton";
import "./InstructorLessonsPage.css";
import { API_URL } from "../api";


function InstructorLessonsPage({ user, logout }) {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLessons = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-course-lessons-admin.php?course_id=${courseId}`,
      );
      const data = await response.json();
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      setLessons([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setError("Both a title and a YouTube link are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/create-lesson.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          title,
          youtube_video_id: videoUrl,
          is_preview: isPreview ? 1 : 0,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not add that lesson.");
        setSaving(false);
        return;
      }

      setTitle("");
      setVideoUrl("");
      setIsPreview(false);
      setSaving(false);
      loadLessons();
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId) => {
    try {
      await fetch(`${API_URL}/delete-lesson-debug.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId }),
      });
      loadLessons();
    } catch (err) {
      setError("Could not delete that lesson.");
    }
  };

  const previewCount = lessons.filter((l) => Number(l.is_preview) === 1).length;

  return (
    <DashboardLayout user={user} logout={logout}>
    
      <Link to="/instructor/courses" className="lessons-back">
        <ChevronLeft size={15} /> My courses
      </Link>

      <div className="lessons-head">
        <h1>Course lessons</h1>
        <p>Add YouTube videos students will watch inside the platform.</p>
      </div>

      <form className="lessons-form" onSubmit={handleAdd}>
        <div className="lessons-field">
          <label htmlFor="lesson-title">Lesson title</label>
          <input
            id="lesson-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to variables"
          />
        </div>

        <div className="lessons-field">
          <label htmlFor="lesson-video">YouTube link or video ID</label>
          <input
            id="lesson-video"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <span className="lessons-hint">
            Paste the full link, a youtu.be short link, or just the 11-character
            ID.
          </span>
        </div>

        <label className="lessons-check">
          <input
            type="checkbox"
            checked={isPreview}
            onChange={(e) => setIsPreview(e.target.checked)}
          />
          <span>
            Free preview — students on the Free plan can watch this one
          </span>
        </label>

        {error && <p className="lessons-error">{error}</p>}

        <button type="submit" className="lessons-add-btn" disabled={saving}>
          <Plus size={15} /> {saving ? "Adding…" : "Add lesson"}
        </button>
      </form>

      <div className="lessons-list-head">
        <h3>Lessons ({lessons.length})</h3>
        {previewCount > 0 && (
          <span className="lessons-preview-count">
            {previewCount} free preview
          </span>
        )}
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : lessons.length === 0 ? (
        <div className="empty-state">
          <Video size={26} />
          <p>No lessons yet</p>
          <span>Add your first video above</span>
        </div>
      ) : (
        <div className="lessons-list">
          {lessons.map((lesson) => (
            <div className="lesson-row" key={lesson.id}>
              <span className="lesson-position">{lesson.position}</span>
              <img
                className="lesson-thumb"
                src={`https://img.youtube.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`}
                alt=""
              />
              <div className="lesson-info">
                <p>{lesson.title}</p>
                <span className="lesson-id">{lesson.youtube_video_id}</span>
              </div>
              <span
                className={`lesson-access${Number(lesson.is_preview) === 1 ? " is-preview" : ""}`}
              >
                {Number(lesson.is_preview) === 1 ? (
                  <>
                    <Eye size={12} /> Preview
                  </>
                ) : (
                  <>
                    <EyeOff size={12} /> Members
                  </>
                )}
              </span>
              <button
                className="lesson-delete"
                onClick={() => handleDelete(lesson.id)}
                aria-label="Delete lesson"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default InstructorLessonsPage;
