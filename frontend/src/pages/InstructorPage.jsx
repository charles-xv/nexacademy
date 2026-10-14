import { Link } from 'react-router';
import './InstructorPage.css';

function InstructorPage({ user, logout }) {
  return (
    <div className="placeholder-page">
      <h1>Instructor dashboard</h1>
      <p>Logged in as <b>{user?.name}</b> ({user?.role})</p>
      <p className="placeholder-note">Full design coming next — this just confirms login and routing work.</p>
      <div className="placeholder-actions">
        <Link to="/" className="placeholder-link">Back to home</Link>
        <button onClick={logout} className="placeholder-btn">Log out</button>
      </div>
    </div>
  );
}

export default InstructorPage;