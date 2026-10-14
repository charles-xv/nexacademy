import { Bell } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { notifications } from "../data/notifications";
import "./NotificationsPage.css";

function NotificationsPage({ user, logout }) {
  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="notifs-header">
        <h1>Notifications</h1>
        <p>Everything the platform has sent you, most recent first.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={26} />
          <p>No notifications yet</p>
          <span>Updates about your courses and account will show up here</span>
        </div>
      ) : (
        <div className="notifs-list">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div className="notifs-item" key={item.id}>
                <div className="notifs-item-icon">
                  <Icon size={18} />
                </div>
                <div className="notifs-item-body">
                  <p>{item.title}</p>
                  <span>{item.message}</span>
                  <small>{item.time}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default NotificationsPage;
