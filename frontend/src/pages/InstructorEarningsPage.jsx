import { useState, useEffect } from "react";
import { Wallet, Users, Info } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { SkeletonList } from "../components/Skeleton";
import { CURRENCY } from "../data/currency";
import "./InstructorEarningsPage.css";
import { API_URL } from "../api";


function InstructorEarningsPage({ user, logout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/get-instructor-earnings.php?instructor_id=${user.id}`,
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

  const courses = data?.courses || [];
  const totalEnrolments = courses.reduce((sum, c) => sum + c.enrolments, 0);

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="instr-page-header">
        <div>
          <h1>Earnings</h1>
          <p>Estimated revenue from your courses.</p>
        </div>
      </div>

      <div className="earnings-summary">
        <div className="earnings-summary-card">
          <Wallet size={18} />
          <div>
            <p>
              {CURRENCY}
              {data ? Number(data.total_estimated).toLocaleString() : 0}
            </p>
            <span>Estimated earnings</span>
          </div>
        </div>
        <div className="earnings-summary-card">
          <Users size={18} />
          <div>
            <p>{totalEnrolments}</p>
            <span>Total enrolments</span>
          </div>
        </div>
      </div>

      {/* Honest disclosure: this platform is subscription-based, so these
          are attributed estimates, not literal per-sale payouts. */}
      <div className="earnings-note">
        <Info size={15} />
        <span>
          NeXaCaDeMy runs on subscriptions, so earnings are estimated as a 50%
          share of Pro revenue, attributed by your share of platform enrolments
          — {CURRENCY}
          {data ? Number(data.per_enrolment).toLocaleString() : 0} per
          enrolment.
        </span>
      </div>

      <div className="section-head">
        <h3>By course</h3>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <Wallet size={26} />
          <p>No earnings yet</p>
          <span>
            Once students enrol in your courses, estimated earnings appear here
          </span>
        </div>
      ) : (
        <div className="earnings-table-wrap">
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Access</th>
                <th>Enrolments</th>
                <th>Estimated</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="earnings-course-title">{c.title}</td>
                  <td>
                    <span className={`earnings-tier tier-${c.access_tier}`}>
                      {c.access_tier === "free" ? "Free" : "Pro"}
                    </span>
                  </td>
                  <td>{c.enrolments}</td>
                  <td className="earnings-amount">
                    {CURRENCY}
                    {Number(c.estimated).toLocaleString()}
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

export default InstructorEarningsPage;
