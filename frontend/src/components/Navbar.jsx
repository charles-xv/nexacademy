import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router";
import {
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  BookOpen,
  Tag,
  Info,
  Mail,
} from "lucide-react";
import "./Navbar.css";

const navLinks = [
  { label: "Courses", icon: BookOpen, route: "/courses" },
  { label: "Pricing", icon: Tag, anchor: "pricing" },
  { label: "About", icon: Info, route: "/about" },
  { label: "Contact", icon: Mail, route: "/contact" },
];

function Navbar({ theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAnchor = (e, id) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      scrollTo(id);
    } else {
      navigate("/");
      setTimeout(() => scrollTo(id), 120);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon">
          <Zap size={16} />
        </div>
        <span className="navbar-logo-text">
          NeX<span className="navbar-logo-accent">AcaDemY</span>
        </span>
      </Link>

      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.label}>
            {link.route ? (
              <NavLink
                to={link.route}
                className={({ isActive }) =>
                  isActive ? "navbar-link-active" : ""
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                href={`/#${link.anchor}`}
                onClick={(e) => handleAnchor(e, link.anchor)}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <Link to="/login" className="navbar-login-link">
          Log in
        </Link>
        <Link to="/register" className="navbar-cta">
          Get started
        </Link>
        <button
          className="navbar-hamburger"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return link.route ? (
              <NavLink
                to={link.route}
                key={link.label}
                className={({ isActive }) =>
                  isActive ? "navbar-link-active" : ""
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            ) : (
              <a
                href={`/#${link.anchor}`}
                key={link.label}
                onClick={(e) => handleAnchor(e, link.anchor)}
              >
                <Icon size={16} />
                {link.label}
              </a>
            );
          })}
          <Link to="/login" onClick={() => setIsMenuOpen(false)}>
            Log in
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
