import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Mail,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import "./ProfilePanel.css";
import { API_URL } from "../api";


// "Hours studied" and "day streak" used to sit here as permanent zeros.
// Neither has a data source — there is no lesson duration column and no
// per-day login record — so they were replaced with counts that are
// genuinely derived from the database.
function ProfilePanel({ user, logout }) {
  const [chipMenuOpen, setChipMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const isInstructor = user?.role === "instructor";

  useEffect(() => {
    if (!user?.id) return;

    const url = isInstructor
      ? `${API_URL}/get-instructor-stats.php?instructor_id=${user.id}`
      : `${API_URL}/get-student-dashboard.php?student_id=${user.id}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats || null);
        setProgress(data.checklist || null);
      })
      .catch(() => {
        setStats(null);
        setProgress(null);
      });
  }, [user?.id, isInstructor]);

  const statBoxes = isInstructor
    ? [
        { label: "Courses", value: stats?.courses ?? 0 },
        { label: "Published", value: stats?.published ?? 0 },
        { label: "Lessons", value: stats?.lessons ?? 0 },
        { label: "Students", value: stats?.students ?? 0 },
      ]
    : [
        { label: "Enrolled", value: stats?.enrolled ?? 0 },
        { label: "Completed", value: stats?.completed ?? 0 },
        { label: "In progress", value: stats?.in_progress ?? 0 },
        { label: "Lessons done", value: stats?.lessons_done ?? 0 },
      ];

  const checklist = isInstructor
    ? [
        { label: "Create your account", done: true },
        { label: "Create your first course", done: !!progress?.first_course },
        { label: "Publish a course", done: !!progress?.first_published },
      ]
    : [
        { label: "Create your account", done: true },
        {
          label: "Enroll in your first course",
          done: !!progress?.first_enrolment,
        },
        { label: "Complete your first lesson", done: !!progress?.first_lesson },
      ];

  const openLogoutConfirm = () => {
    setChipMenuOpen(false);
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="profile-mobile-wrap">
        <button
          className="profile-mobile-chip"
          onClick={() => setChipMenuOpen((prev) => !prev)}
          aria-label="Account menu"
        >
          <User size={15} />
          <span>{user?.name?.split(" ")[0]}</span>
        </button>

        {chipMenuOpen && (
          <>
            <div
              className="chip-menu-backdrop"
              onClick={() => setChipMenuOpen(false)}
            />
            <div className="chip-menu">
              <div className="chip-menu-header">
                <div className="chip-menu-avatar">
                  <User size={22} />
                </div>
                <p className="chip-menu-name">{user?.name}</p>
                <div className="chip-menu-email">
                  <Mail size={11} />
                  {user?.email}
                </div>
              </div>
              <button className="chip-menu-logout" onClick={openLogoutConfirm}>
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </>
        )}
      </div>

      <aside className="profile-panel">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={34} />
          </div>
          <h3>{user?.name}</h3>
          <div className="profile-email">
            <Mail size={12} />
            {user?.email}
          </div>
          <button
            className="profile-logout-btn"
            onClick={() => setConfirmOpen(true)}
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>

        <div className="profile-stats">
          {statBoxes.map((stat) => (
            <div className="profile-stat-box" key={stat.label}>
              <p>{stat.value}</p>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="profile-section">
          <h4>Getting started</h4>
          <div className="checklist">
            {checklist.map((item) => (
              <div
                className={`checklist-item${item.done ? " done" : ""}`}
                key={item.label}
              >
                {item.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {confirmOpen && (
        <div
          className="logout-modal-backdrop"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 id="logout-modal-title">Log out?</h3>
            <p>You'll need to log back in to access your dashboard.</p>
            <div className="logout-modal-actions">
              <button
                className="logout-modal-cancel"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button className="logout-modal-confirm" onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePanel;
