import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Zap,
  LayoutDashboard,
  Users,
  BookOpen,
  ShieldAlert,
  LogOut,
  Search,
  Trash2,
  UserX,
  UserCheck,
  RefreshCw,
  Mail,
  Check,
  Circle,
} from "lucide-react";
import { SkeletonList, SkeletonBox } from "../components/Skeleton";
import "./AdminPage.css";
import { API_URL } from "../api";



const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "security", label: "Security", icon: ShieldAlert },
];

function AdminPage({ user, logout }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logSummary, setLogSummary] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2800);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes, logsRes, messagesRes] =
        await Promise.all([
          fetch(`${API_URL}/admin-get-stats.php?admin_id=${user.id}`),
          fetch(`${API_URL}/admin-get-users.php?admin_id=${user.id}`),
          fetch(`${API_URL}/admin-get-courses.php?admin_id=${user.id}`),
          fetch(`${API_URL}/admin-get-security-logs.php?admin_id=${user.id}`),
          fetch(`${API_URL}/admin-get-messages.php?admin_id=${user.id}`),
        ]);
      if (!statsRes.ok) {
        const err = await statsRes.json();
        flash("error", err.error || "Access denied.");
        setLoading(false);
        return;
      }

      setStats(await statsRes.json());
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const logsData = await logsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setLogs(logsData.logs || []);
      setLogSummary(logsData.summary || []);
      const messagesData = await messagesRes.json();
      setMessages(messagesData.messages || []);
      setNewMessageCount(messagesData.new_count || 0);
    } catch (err) {
      flash("error", "Could not reach the server. Is XAMPP running?");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [user.id]);

  const handleStatus = async (target, status) => {
    try {
      const response = await fetch(`${API_URL}/admin-set-user-status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id, user_id: target.id, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        flash("error", data.error || "Could not change that account.");
        return;
      }
      flash(
        "success",
        status === "suspended"
          ? `${target.name} suspended`
          : `${target.name} reinstated`,
      );
      loadAll();
    } catch (err) {
      flash("error", "Could not reach the server.");
    }
  };

  const handleDeleteCourse = async (course) => {
    try {
      const response = await fetch(`${API_URL}/admin-delete-course.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id, course_id: course.id }),
      });
      const handleMessageStatus = async (message, status) => {
        try {
          const response = await fetch(
            `${API_URL}/admin-set-message-status.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                admin_id: user.id,
                message_id: message.id,
                status,
              }),
            },
          );
          if (!response.ok) {
            flash("error", "Could not update that message.");
            return;
          }
          loadAll();
        } catch (err) {
          flash("error", "Could not reach the server.");
        }
      };
      const data = await response.json();
      setConfirmDelete(null);
      if (!response.ok) {
        flash("error", data.error || "Could not remove that course.");
        return;
      }
      flash("success", "Course removed");
      loadAll();
    } catch (err) {
      setConfirmDelete(null);
      flash("error", "Could not reach the server.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value.replace(" ", "T")).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value.replace(" ", "T")).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const severityOf = (eventType) => {
    if (
      [
        "account_locked",
        "admin_access_denied",
        "email_change_denied",
        "password_change_denied",
        "course_edit_denied",
        "course_delete_denied",
        "enrol_denied",
        "progress_denied",
        "account_suspended",
      ].includes(eventType)
    ) {
      return "high";
    }
    if (["failed_login"].includes(eventType)) return "warn";
    return "info";
  };

  const term = query.trim().toLowerCase();
  const visibleUsers = users.filter(
    (u) =>
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term),
  );
  const visibleCourses = courses.filter(
    (c) =>
      !term ||
      c.title.toLowerCase().includes(term) ||
      c.instructor_name.toLowerCase().includes(term),
  );

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <Link to="/" className="admin-logo">
          <div className="admin-logo-icon">
            <Zap size={16} />
          </div>
          <span>
            NeX<span className="admin-logo-accent">AcaDemY</span>
          </span>
        </Link>

        <div className="admin-topbar-right">
          <button className="admin-refresh" onClick={loadAll} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <div className="admin-whoami">
            <p>{user?.name}</p>
            <span>Administrator</span>
          </div>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              className={`admin-tab${tab === t.key ? " is-active" : ""}`}
              onClick={() => {
                setTab(t.key);
                setQuery("");
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </nav>

      {notice && (
        <p className={`admin-notice admin-notice-${notice.type}`}>
          {notice.text}
        </p>
      )}

      <main className="admin-content">
        {loading ? (
          tab === "overview" ? (
            <div className="admin-stat-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="admin-stat" key={i}>
                  <SkeletonBox width="55%" height={24} />
                  <div style={{ height: 8 }} />
                  <SkeletonBox width="70%" height={11} />
                </div>
              ))}
            </div>
          ) : (
            <SkeletonList count={6} />
          )
        ) : (
          <>
            {tab === "overview" && stats && (
              <>
                <h2 className="admin-section-title">Platform at a glance</h2>
                <div className="admin-stat-grid">
                  <StatCard label="Students" value={stats.students} />
                  <StatCard label="Instructors" value={stats.instructors} />
                  <StatCard
                    label="Pro subscribers"
                    value={stats.pro_subscribers}
                  />
                  <StatCard
                    label="Revenue"
                    value={`$${Number(stats.revenue).toLocaleString()}`}
                  />
                  <StatCard
                    label="Courses"
                    value={stats.courses_total}
                    sub={`${stats.courses_live} published`}
                  />
                  <StatCard label="Lessons" value={stats.lessons} />
                  <StatCard label="Enrolments" value={stats.enrollments} />
                  <StatCard
                    label="Security events"
                    value={stats.security_events}
                  />
                </div>

                {(stats.suspended > 0 || stats.locked_accounts > 0) && (
                  <div className="admin-alert">
                    <ShieldAlert size={16} />
                    <span>
                      {stats.suspended} suspended account
                      {stats.suspended === 1 ? "" : "s"}
                      {" · "}
                      {stats.locked_accounts} currently locked out
                    </span>
                  </div>
                )}
              </>
            )}

            {tab === "users" && (
              <>
                <div className="admin-section-head">
                  <h2 className="admin-section-title">
                    Accounts ({users.length})
                  </h2>
                  <div className="admin-search">
                    <Search size={14} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or email"
                    />
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Plan</th>
                        <th>Activity</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="admin-cell-strong">{u.name}</td>
                          <td className="admin-cell-mono">{u.email}</td>
                          <td>
                            <span className={`admin-role role-${u.role}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role === "student" ? (
                              <span
                                className={`admin-plan plan-${u.plan || "free"}`}
                              >
                                {u.plan || "free"}
                              </span>
                            ) : (
                              <span className="admin-muted">—</span>
                            )}
                          </td>
                          <td className="admin-muted">
                            {u.role === "instructor"
                              ? `${u.course_count} course${u.course_count === "1" ? "" : "s"}`
                              : u.role === "student"
                                ? `${u.enrolment_count} enrolled`
                                : "—"}
                          </td>
                          <td>
                            {u.status === "suspended" ? (
                              <span className="admin-status status-suspended">
                                Suspended
                              </span>
                            ) : u.locked ? (
                              <span className="admin-status status-locked">
                                Locked out
                              </span>
                            ) : (
                              <span className="admin-status status-active">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="admin-cell-actions">
                            {u.role !== "admin" &&
                              (u.status === "suspended" ? (
                                <button
                                  className="admin-row-btn"
                                  onClick={() => handleStatus(u, "active")}
                                  title="Reinstate account"
                                >
                                  <UserCheck size={14} /> Reinstate
                                </button>
                              ) : (
                                <button
                                  className="admin-row-btn admin-row-btn-danger"
                                  onClick={() => handleStatus(u, "suspended")}
                                  title="Suspend account"
                                >
                                  <UserX size={14} /> Suspend
                                </button>
                              ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "courses" && (
              <>
                <div className="admin-section-head">
                  <h2 className="admin-section-title">
                    Courses ({courses.length})
                  </h2>
                  <div className="admin-search">
                    <Search size={14} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search title or instructor"
                    />
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Instructor</th>
                        <th>Access</th>
                        <th>Lessons</th>
                        <th>Students</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCourses.map((c) => (
                        <tr key={c.id}>
                          <td className="admin-cell-strong">{c.title}</td>
                          <td>
                            <span className="admin-cell-strong">
                              {c.instructor_name}
                            </span>
                            <br />
                            <span className="admin-cell-mono admin-muted">
                              {c.instructor_email}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-plan plan-${c.access_tier}`}
                            >
                              {c.access_tier}
                            </span>
                          </td>
                          <td className="admin-muted">{c.lesson_count}</td>
                          <td className="admin-muted">{c.student_count}</td>
                          <td>
                            <span
                              className={`admin-status status-${c.status === "published" ? "active" : "draft"}`}
                            >
                              {c.status === "published" ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="admin-cell-actions">
                            <button
                              className="admin-row-btn admin-row-btn-danger"
                              onClick={() => setConfirmDelete(c)}
                              title="Remove course"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {tab === "messages" && (
              <>
                {" "}
                <h2 className="admin-section-title">
                  {" "}
                  Contact messages ({messages.length}){" "}
                  {newMessageCount > 0 && (
                    <span className="admin-msg-badge">
                      {newMessageCount} new
                    </span>
                  )}{" "}
                </h2>
                {messages.length === 0 ? (
                  <div className="admin-empty">
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="admin-msg-list">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`admin-msg-card status-${m.status}`}
                      >
                        <div className="admin-msg-head">
                          <div>
                            <p className="admin-msg-subject">{m.subject}</p>
                            <span className="admin-msg-from">
                              {m.name} · {m.email}
                            </span>
                          </div>
                          <span className={`admin-msg-status pill-${m.status}`}>
                            {m.status}
                          </span>
                        </div>
                        {/* Rendered as plain text via {m.message} — never as HTML —
                so a message body can't inject a script (stored XSS). */}
                        <p className="admin-msg-body">{m.message}</p>
                        <div className="admin-msg-actions">
                          {m.status !== "read" && (
                            <button
                              onClick={() => handleMessageStatus(m, "read")}
                            >
                              <Check size={13} /> Mark read
                            </button>
                          )}
                          {m.status !== "closed" && (
                            <button
                              onClick={() => handleMessageStatus(m, "closed")}
                            >
                              <Circle size={13} /> Close
                            </button>
                          )}
                          {m.status !== "new" && (
                            <button
                              onClick={() => handleMessageStatus(m, "new")}
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "security" && (
              <>
                <h2 className="admin-section-title">Security events</h2>

                {logSummary.length > 0 && (
                  <div className="admin-log-summary">
                    {logSummary.map((s) => (
                      <span
                        key={s.event_type}
                        className={`admin-log-chip sev-${severityOf(s.event_type)}`}
                      >
                        {s.event_type.replace(/_/g, " ")} <b>{s.total}</b>
                      </span>
                    ))}
                  </div>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Event</th>
                        <th>Account</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id}>
                          <td className="admin-muted admin-cell-nowrap">
                            {formatDateTime(l.created_at)}
                          </td>
                          <td>
                            <span
                              className={`admin-event sev-${severityOf(l.event_type)}`}
                            >
                              {l.event_type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td>
                            {l.user_name ? (
                              <>
                                <span className="admin-cell-strong">
                                  {l.user_name}
                                </span>
                                <br />
                                <span className="admin-cell-mono admin-muted">
                                  {l.user_email}
                                </span>
                              </>
                            ) : (
                              <span className="admin-muted">Unknown</span>
                            )}
                          </td>
                          <td className="admin-muted">{l.details || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {logs.length === 0 && (
                  <div className="admin-empty">
                    <p>No security events recorded yet</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {confirmDelete && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove this course?</h3>
            <p>
              <strong>{confirmDelete.title}</strong> by{" "}
              {confirmDelete.instructor_name} will be removed, along with its{" "}
              {confirmDelete.lesson_count} lesson
              {confirmDelete.lesson_count === "1" ? "" : "s"} and{" "}
              {confirmDelete.student_count} student enrolment
              {confirmDelete.student_count === "1" ? "" : "s"}. This cannot be
              undone.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="admin-modal-confirm"
                onClick={() => handleDeleteCourse(confirmDelete)}
              >
                Remove course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="admin-stat">
      <p className="admin-stat-value">{value}</p>
      <span className="admin-stat-label">{label}</span>
      {sub && <span className="admin-stat-sub">{sub}</span>}
    </div>
  );
}

export default AdminPage;
