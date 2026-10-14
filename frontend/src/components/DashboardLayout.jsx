import Sidebar from './Sidebar';
import ProfilePanel from './ProfilePanel';
import './DashboardLayout.css';

function DashboardLayout({ user, logout, children }) {
  return (
    <div className="dashboard-page">
      <Sidebar user={user} />
      <main className="dashboard-main">{children}</main>
      <ProfilePanel user={user} logout={logout} />
    </div>
  );
}

export default DashboardLayout;