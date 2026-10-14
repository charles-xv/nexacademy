import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Plus,
  BookOpen,
  X,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ListVideo,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonCourseGrid } from "../components/Skeleton";
import "./InstructorCoursesPage.css";
import { API_URL } from "../api";


const emptyForm = {
  title: "",
  description: "",
  accessTier: "free",
  thumbnailUrl: "",
};

function InstructorCoursesPage({ user, logout }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-instructor-courses.php?instructor_id=${user.id}`,
      );
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      accessTier: course.access_tier || "free",
      thumbnailUrl: course.thumbnail_url || "",
    });
    setError("");
    setModalOpen(true);
  };

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const handleSave = async (status) => {
    if (!form.title.trim()) {
      setError("A course needs a title.");
      return;
    }
    setSaving(true);
    setError("");

    const isEdit = editingId !== null;
    const endpoint = isEdit ? "update-course.php" : "create-course.php";

    const body = isEdit
      ? {
          course_id: editingId,
          instructor_id: user.id,
          title: form.title,
          description: form.description,
          access_tier: form.accessTier,
          thumbnail_url: form.thumbnailUrl,
        }
      : {
          instructor_id: user.id,
          title: form.title,
          description: form.description,
          access_tier: form.accessTier,
          thumbnail_url: form.thumbnailUrl,
          status,
        };

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setSaving(false);
      flash(isEdit ? "Course updated" : "Course created");
      fetchCourses();
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setSaving(false);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const response = await fetch(`${API_URL}/toggle-publish.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id, instructor_id: user.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        flash(data.error || "Could not change that.");
        return;
      }

      flash(
        data.status === "published" ? "Course published" : "Moved to draft",
      );
      fetchCourses();
    } catch (err) {
      flash("Could not reach the server.");
    }
  };

  const handleDelete = async (course) => {
    try {
      const response = await fetch(`${API_URL}/delete-course.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id, instructor_id: user.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        flash(data.error || "Could not delete that course.");
        setConfirmDelete(null);
        return;
      }

      setConfirmDelete(null);
      flash("Course deleted");
      fetchCourses();
    } catch (err) {
      flash("Could not reach the server.");
      setConfirmDelete(null);
    }
  };

  return (
    <DashboardLayout user={user} logout={logout}>
   
      <div className="instr-courses-header">
        <div>
          <h1>My courses</h1>
          <p>Everything you've created, published or still in draft.</p>
        </div>
        <button className="instr-create-btn" onClick={openCreate}>
          <Plus size={16} /> Create course
        </button>
      </div>

      {notice && <p className="instr-notice">{notice}</p>}

      {loading ? (
        <SkeletonCourseGrid count={6} className="instr-course-grid" />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>No courses yet</p>
          <span>Create your first course to start teaching</span>
        </div>
      ) : (
        <div className="instr-course-grid">
          {courses.map((course) => (
            <div className="instr-course-card" key={course.id}>
              <Link
                to={`/instructor/courses/${course.id}/lessons`}
                className="instr-course-main"
              >
                <div className="instr-course-thumb">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} />
                  ) : (
                    <BookOpen size={26} />
                  )}
                  <span className={`instr-status-tag status-${course.status}`}>
                    {course.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="instr-course-body">
                  <p>{course.title}</p>
                  <span>
                    {course.access_tier === "free" ? "Free" : "Pro only"}
                  </span>
                </div>
              </Link>

              <div className="instr-course-actions">
                <Link
                  to={`/instructor/courses/${course.id}/lessons`}
                  className="instr-action"
                  title="Manage lessons"
                >
                  <ListVideo size={15} />
                </Link>
                <button
                  className="instr-action"
                  onClick={() => openEdit(course)}
                  title="Edit course"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="instr-action"
                  onClick={() => handleTogglePublish(course)}
                  title={
                    course.status === "published" ? "Move to draft" : "Publish"
                  }
                >
                  {course.status === "published" ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
                <button
                  className="instr-action instr-action-danger"
                  onClick={() => setConfirmDelete(course)}
                  title="Delete course"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="instr-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div className="instr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="instr-modal-header">
              <h3>{editingId ? "Edit course" : "Create a course"}</h3>
              <button onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {error && <p className="instr-modal-error">{error}</p>}

            <div className="instr-modal-form">
              <div className="instr-field">
                <label htmlFor="course-title">Title</label>
                <input
                  id="course-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Intro to cybersecurity"
                />
              </div>

              <div className="instr-field">
                <label htmlFor="course-desc">Description</label>
                <textarea
                  id="course-desc"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="What will students learn?"
                  rows={3}
                />
              </div>

              <div className="instr-field">
                <label htmlFor="course-tier">Access</label>
                <select
                  id="course-tier"
                  value={form.accessTier}
                  onChange={(e) => setField("accessTier", e.target.value)}
                >
                  <option value="free">Free — open to everyone</option>
                  <option value="pro">Pro — subscribers only</option>
                </select>
              </div>

              <div className="instr-field">
                <label htmlFor="course-thumb">Thumbnail URL</label>
                <input
                  id="course-thumb"
                  type="text"
                  value={form.thumbnailUrl}
                  onChange={(e) => setField("thumbnailUrl", e.target.value)}
                  placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                />
                {form.thumbnailUrl && (
                  <img
                    className="instr-thumb-preview"
                    src={form.thumbnailUrl}
                    alt="Thumbnail preview"
                  />
                )}
              </div>

              <div className="instr-modal-actions">
                {editingId ? (
                  <button
                    type="button"
                    className="instr-publish-btn"
                    disabled={saving}
                    onClick={() => handleSave()}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="instr-draft-btn"
                      disabled={saving}
                      onClick={() => handleSave("draft")}
                    >
                      Save as draft
                    </button>
                    <button
                      type="button"
                      className="instr-publish-btn"
                      disabled={saving}
                      onClick={() => handleSave("published")}
                    >
                      {saving ? "Publishing…" : "Publish"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="instr-modal-backdrop"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="instr-modal instr-modal-narrow"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="instr-confirm-title">Delete this course?</h3>
            <p className="instr-confirm-text">
              <strong>{confirmDelete.title}</strong> and all of its lessons will
              be removed, along with every student's progress on it. This cannot
              be undone.
            </p>
            <div className="instr-modal-actions">
              <button
                type="button"
                className="instr-draft-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="instr-delete-btn"
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete course
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default InstructorCoursesPage;
