import { useState, useEffect } from 'react';
import { BookOpen, Check, Lock, Search } from 'lucide-react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonCourseGrid } from '../components/Skeleton';
import './BrowseCoursesPage.css';
import { API_URL } from "../api";

function BrowseCoursesPage({ user, logout }) {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [enrolling, setEnrolling] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, enrolledRes, subRes] = await Promise.all([
          fetch(`${API_URL}/get-published-courses.php`),
          fetch(`${API_URL}/get-enrolled-courses.php?student_id=${user.id}`),
          fetch(`${API_URL}/get-subscription.php?user_id=${user.id}`),
        ]);
        const coursesData = await coursesRes.json();
        const enrolledData = await enrolledRes.json();
        const subData = await subRes.json();

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setEnrolledIds(
          Array.isArray(enrolledData) ? enrolledData.map((c) => Number(c.id)) : []
        );
        setSubscription(subData);
      } catch (err) {
        setCourses([]);
        setEnrolledIds([]);
        setSubscription({ plan: 'free' });
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const isPro = subscription?.plan === 'pro';

  const handleEnrol = async (course) => {
    setEnrolling(course.id);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/enroll.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, course_id: course.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Could not enrol.' });
        setEnrolling(null);
        return;
      }

      setEnrolledIds((prev) => [...prev, Number(course.id)]);
      setMessage({ type: 'success', text: `Enrolled in ${course.title}` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not reach the server. Is XAMPP running?' });
    }
    setEnrolling(null);
  };

  const visible = courses.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <DashboardLayout user={user} logout={logout}>
    
      <div className="browse-header">
        <div>
          <h1>Browse courses</h1>
          <p>Everything available on the platform right now.</p>
        </div>
        <div className="browse-search">
          <Search size={15} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
          />
        </div>
      </div>

      {!isPro && (
        <div className="browse-plan-note">
          <Lock size={15} />
          <span>You're on the Free plan — Pro courses need an upgrade.</span>
          <Link to="/dashboard/payments">View plans</Link>
        </div>
      )}

      {message && (
        <p className={`browse-message browse-message-${message.type}`}>{message.text}</p>
      )}

      {loading ? (
        <SkeletonCourseGrid count={6} className="browse-grid" />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>{query ? 'No courses match that search' : 'No courses published yet'}</p>
          <span>{query ? 'Try a different word' : 'Check back soon'}</span>
        </div>
      ) : (
        <div className="browse-grid">
          {visible.map((course) => {
            const isFree = course.access_tier === 'free';
            const enrolled = enrolledIds.includes(Number(course.id));
            const locked = !isFree && !isPro;

            return (
              <div className="browse-card" key={course.id}>
                <div className="browse-thumb">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} />
                  ) : (
                    <BookOpen size={26} />
                  )}
                  <span className={`browse-tier tier-${course.access_tier}`}>
                    {isFree ? 'Free' : 'Pro'}
                  </span>
                </div>

                <div className="browse-body">
                  <p className="browse-title">{course.title}</p>
                  <span className="browse-instructor">{course.instructor_name}</span>
                  {course.description && (
                    <p className="browse-description">{course.description}</p>
                  )}

                  <div className="browse-foot">
                    {enrolled ? (
                      <span className="browse-enrolled">
                        <Check size={14} /> Enrolled
                      </span>
                    ) : locked ? (
                      <Link to="/dashboard/payments" className="browse-locked-btn">
                        <Lock size={13} /> Upgrade to unlock
                      </Link>
                    ) : (
                      <button
                        className="browse-enrol-btn"
                        disabled={enrolling === course.id}
                        onClick={() => handleEnrol(course)}
                      >
                        {enrolling === course.id ? 'Enrolling…' : 'Enrol'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default BrowseCoursesPage;
