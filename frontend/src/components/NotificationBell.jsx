import { useState } from 'react';
import { Bell, PartyPopper, Sparkles } from 'lucide-react';
import './NotificationBell.css';

const notifications = [
  {
    id: 1,
    icon: PartyPopper,
    title: 'Welcome to NeXaCaDemY!',
    message: 'Your account is ready. Start exploring the course catalog to find something to learn.',
    time: 'Just now',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'Complete your first course',
    message: 'Enroll in a course and pick up where you left off anytime.',
    time: 'Just now',
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readNotificationIds');
    return saved ? JSON.parse(saved) : [];
  });

  const hasUnread = notifications.some((item) => !readIds.includes(item.id));

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    setRinging(true);

    if (nextOpen) {
      const allIds = notifications.map((item) => item.id);
      const merged = [...new Set([...readIds, ...allIds])];
      setReadIds(merged);
      localStorage.setItem('readNotificationIds', JSON.stringify(merged));
    }
  };

  return (
    <div className="notif-wrap">
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        onAnimationEnd={() => setRinging(false)}
        aria-label="Notifications"
      >
        <Bell size={16} className={ringing ? 'notif-bell-icon ringing' : 'notif-bell-icon'} />
        {hasUnread && <span className="notif-dot" />}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel">
            <div className="notif-panel-header">
              <h4>Notifications</h4>
            </div>
            <div className="notif-list">
              {notifications.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="notif-item" key={item.id}>
                    <div className="notif-item-icon">
                      <Icon size={16} />
                    </div>
                    <div className="notif-item-body">
                      <p>{item.title}</p>
                      <span>{item.message}</span>
                      <small>{item.time}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;