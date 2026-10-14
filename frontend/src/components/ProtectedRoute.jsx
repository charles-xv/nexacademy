import { Navigate } from 'react-router';

// The door check for each dashboard. No one logged in, wrong role,
// or an expired session -> sent back to /login. Right role and a
// fresh session -> lets them through.
function ProtectedRoute({ user, allowedRole, children }) {
  // Sessions expire after 24 hours. Without this, a saved login in
  // localStorage never times out — the session-management gap (OWASP A07).
  const loginTime = localStorage.getItem('loginTime');
  const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const expired = !loginTime || (Date.now() - Number(loginTime)) > SESSION_MAX_AGE;

  if (!user || user.role !== allowedRole || expired) {
    // Clear the stale session so the app treats them as logged out.
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;