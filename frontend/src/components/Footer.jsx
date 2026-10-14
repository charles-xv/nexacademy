import { Zap, LayoutGrid, Building2, BookOpen } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router";
import "./Footer.css";

// Each link now points at a real route. Anchors that jump to a section
// of the landing page use "/#id"; pages use their route. Items with no
// page yet (Careers, Blog, Help Center, FAQ, Community, Status) point
// home rather than sitting dead on "#".
const footerColumns = [
  {
    title: "Platform",
    icon: LayoutGrid,
    links: [
      { label: "Courses", to: "/courses" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Certificates", to: "/dashboard/certificates" },
    ],
  },
  {
    title: "Company",
    icon: Building2,
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/about" },
      { label: "Blog", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    icon: BookOpen,
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "FAQ", to: "/contact" },
      { label: "Community", to: "/contact" },
      { label: "Status", to: "/contact" },
    ],
  },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <div className="footer-logo">
              <Zap size={16} />
            </div>
            <div className="footer-logo-text-block">
              <span className="footer-logo-text">
                NeX<span className="footer-logo-accent">AcaDemY</span>
              </span>
              <p className="footer-logo-sub">
                Learn tech skills, the secure way
              </p>
            </div>
          </div>
          <p className="footer-description">
            Hands on courses in web development, cybersecurity and data skills,
            built by working professionals.
          </p>
          <div className="footer-socials">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaXTwitter size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={15} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub size={15} />
            </a>
          </div>
        </div>

        {footerColumns.map((column) => {
          const Icon = column.icon;
          return (
            <div className="footer-column" key={column.title}>
              <h4>
                <Icon size={14} />
                {column.title}
              </h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NeXaCaDeMy. All rights reserved.</p>
        <div className="footer-status">
          <span className="footer-status-dot" />
          All systems operational
        </div>
        <div className="footer-legal">
          <Link to="/about">Privacy Policy</Link>
          <Link to="/about">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
