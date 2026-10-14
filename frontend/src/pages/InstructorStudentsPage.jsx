import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonList } from "../components/Skeleton";
import "./InstructorStudentsPage.css";
import { API_URL } from "../api";


function InstructorStudentsPage({ user, logout }) {
  const [rows, setRows] = useState([]);
  const [distinct, setDistinct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/get-instructor-students.php?instructor_id=${user.id}`,
        );
        const json = await res.json();
        setRows(Array.isArray(json.students) ? json.students : []);
        setDistinct(json.distinct_students || 0);
      } catch (err) {
        setRows([]);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value.replace(" ", "T")).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const term = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      !term ||
      r.student_name.toLowerCase().includes(term) ||
      r.student_email.toLowerCase().includes(term) ||
      r.course_title.toLowerCase().includes(term),
  );

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="instr-page-header">
        <div>
          <h1>Students</h1>
          <p>
            {distinct > 0
              ? `${distinct} student${distinct === 1 ? "" : "s"} across ${rows.length} enrolment${rows.length === 1 ? "" : "s"}.`
              : "Everyone enrolled across your courses."}
          </p>
        </div>
        {rows.length > 0 && (
          <div className="instr-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or course"
            />
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <Users size={26} />
          <p>{query ? "No matches" : "No students yet"}</p>
          <span>
            {query
              ? "Try a different name or course"
              : "Once someone enrolls in one of your courses, they'll show up here"}
          </span>
        </div>
      ) : (
        <div className="instr-students-table-wrap">
          <table className="instr-students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <tr key={`${r.student_id}-${r.course_id}-${i}`}>
                  <td>
                    <span className="instr-student-name">{r.student_name}</span>
                    <br />
                    <span className="instr-student-email">
                      {r.student_email}
                    </span>
                  </td>
                  <td>{r.course_title}</td>
                  <td>
                    <div className="instr-progress-cell">
                      <div className="instr-progress-track">
                        <div
                          className="instr-progress-fill"
                          style={{ width: `${r.progress_percent}%` }}
                        />
                      </div>
                      <span>{r.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="instr-student-date">
                    {formatDate(r.enrolled_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export default InstructorStudentsPage;
