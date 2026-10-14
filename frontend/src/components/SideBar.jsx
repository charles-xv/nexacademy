import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router";
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Award,
  Bell,
  CreditCard,
  Settings,
  Menu,
  X,
  Users,
  Wallet,
  Compass,
  Crown,
} from "lucide-react";
import "./Sidebar.css";
import { API_URL } from "../api";


const studentNavItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Browse courses", icon: Compass, path: "/dashboard/browse" },
  { label: "My courses", icon: BookOpen, path: "/dashboard/courses" },
  { label: "Certificates", icon: Award, path: "/dashboard/certificates" },
  { label: "Notifications", icon: Bell, path: "/dashboard/notifications" },
  { label: "Payments", icon: CreditCard, path: "/dashboard/payments" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const instructorNavItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/instructor" },
  { label: "My courses", icon: BookOpen, path: "/instructor/courses" },
  { label: "Students", icon: Users, path: "/instructor/students" },
  { label: "Earnings", icon: Wallet, path: "/instructor/earnings" },
  { label: "Settings", icon: Settings, path: "/instructor/settings" },
];

function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const location = useLocation();

  const isInstructor = user?.role === "instructor";
  const homePath = isInstructor
    ? "/instructor"
    : user?.role === "admin"
      ? "/admin"
      : "/dashboard";
  const alreadyHome = location.pathname === homePath;
  const navItems = isInstructor ? instructorNavItems : studentNavItems;

  // Only students carry a subscription, so instructors and admins
  // never need this request.
  useEffect(() => {
    if (!user?.id || user.role !== "student") return;
    fetch(API_URL + "/get-subscription.php?user_id=" + user.id)
      .then((res) => res.json())
      .then((data) => setIsPro(data.plan === "pro"))
      .catch(() => setIsPro(false));
  }, [user?.id, user?.role]);

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
      )}

      <aside className={"sidebar" + (isOpen ? " sidebar-open" : "")}>
        <div className="sidebar-top-row">
          {alreadyHome ? (
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <Zap size={16} />
              </div>
              <span className="sidebar-logo-text">
                NeX<span className="sidebar-logo-accent">AcaDemY</span>
              </span>
            </div>
          ) : (
            <Link
              to={homePath}
              className="sidebar-logo"
              onClick={() => setIsOpen(false)}
            >
              <div className="sidebar-logo-icon">
                <Zap size={16} />
              </div>
              <span className="sidebar-logo-text">
                NeX<span className="sidebar-logo-accent">AcaDemY</span>
              </span>
            </Link>
          )}
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <p className="sidebar-menu-label">Menu</p>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                to={item.path}
                end={item.path === homePath}
                className={({ isActive }) =>
                  "sidebar-nav-item" + (isActive ? " active" : "")
                }
                key={item.label}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {!isInstructor &&
          (isPro ? (
            <div className="sidebar-upgrade-card sidebar-pro-card">
              <p className="sidebar-upgrade-title">
                <Crown size={15} /> Pro member
              </p>
              <p className="sidebar-upgrade-text">
                full access to every course
              </p>
            </div>
          ) : (
            <div className="sidebar-upgrade-card">
              <p className="sidebar-upgrade-title">Unlock all courses</p>
              <p className="sidebar-upgrade-text">
                Get full access to every course
              </p>
              <Link
                to="/dashboard/payments"
                className="sidebar-upgrade-btn"
                onClick={() => setIsOpen(false)}
              >
                Upgrade to Pro
              </Link>
            </div>
          ))}
      </aside>
    </>
  );
}

export default Sidebar;
