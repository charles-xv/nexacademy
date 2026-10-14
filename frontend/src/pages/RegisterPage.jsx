import { useState } from "react";
import GoogleOneTap from "../components/GoogleOneTap";
import { useNavigate, Link } from "react-router";
import {
  Zap,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  MailCheck,
} from "lucide-react";
import LoadingBar from "../components/LoadingBar";
import "./RegisterPage.css";
import { API_URL } from "../api";

const COPY = {
  student: {
    tagline: "Learn at your own pace from anywhere",
    heading: "Create your account",
    subtitle: "Free to join, no card required",
    usernamePlaceholder: "Pick a username",
    submit: "Create account",
  },
  instructor: {
    tagline: "Share what you know start teaching today",
    heading: "Create your instructor account",
    subtitle: "Free to join, publish your first course in minutes",
    usernamePlaceholder: "Your teaching name",
    submit: "Create instructor account",
  },
};

function RegisterPage({ login }) {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  // After a successful signup the account is NOT logged in — it must be
  // verified by email first. This flips to a "check your email" screen.
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const navigate = useNavigate();

  const copy = COPY[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setShake(true);
        setLoading(false);
        return;
      }

      setSentEmail(email);
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setShake(true);
      setLoading(false);
    }
  };

  // ---- Confirmation screen shown after a successful signup ----
  if (submitted) {
    return (
      <div className="verify-page">
        <LoadingBar active={loading} />
        <div className="verify-card">
          <div className="register-brand-panel">
            <Link to="/" className="register-logo-link">
              <div className="register-logo-icon">
                <Zap size={18} />
              </div>
              <span className="register-logo-text">
                NeX<span className="register-logo-accent">AcaDemY</span>
              </span>
            </Link>
            <p className="register-tagline">{copy.tagline}</p>
          </div>

          <div className="register-form-panel" style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
                color: "var(--color-primary)",
              }}
            >
              <MailCheck size={40} />
            </div>
            <h2>Check your email</h2>
            <p className="register-subtitle" style={{ marginBottom: 20 }}>
              We sent a verification link to <strong>{sentEmail}</strong>. Click
              it to activate your account, then log in.
            </p>
            <Link
              to="/login"
              className="register-submit-btn"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Go to login
            </Link>
            <p className="register-login-row" style={{ marginTop: 18 }}>
              Didn't get it? Check your spam folder, or the link may take a
              minute to arrive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <LoadingBar active={loading} />
      <div className="register-card">
        <div className="register-brand-panel">
          <Link to="/" className="register-logo-link">
            <div className="register-logo-icon">
              <Zap size={18} />
            </div>
            <span className="register-logo-text">
              NeX<span className="register-logo-accent">AcaDemY</span>
            </span>
          </Link>
          <p className="register-tagline">{copy.tagline}</p>
        </div>

        <div className="register-form-panel">
          <h2>{copy.heading}</h2>
          <p className="register-subtitle">{copy.subtitle}</p>

          {error && <p className="register-error">{error}</p>}

          <div className="register-role-picker">
            <button
              type="button"
              className={`register-role-btn${role === "student" ? " active" : ""}`}
              onClick={() => setRole("student")}
            >
              <GraduationCap size={16} /> I'm a Student
            </button>
            <button
              type="button"
              className={`register-role-btn${role === "instructor" ? " active" : ""}`}
              onClick={() => setRole("instructor")}
            >
              <Briefcase size={16} /> I'm an Instructor
            </button>
          </div>

          <form
            className={`register-form${shake ? " shake" : ""}`}
            onSubmit={handleSubmit}
            onAnimationEnd={() => setShake(false)}
          >
            <div className="register-field">
              <label htmlFor="name">Username</label>
              <input
                type="text"
                id="name"
                placeholder={copy.usernamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="register-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="register-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating account…" : copy.submit}
            </button>
          </form>
          <GoogleOneTap login={login} context="signup" getRole={() => role} />

          <p className="register-login-row"></p>

          <p className="register-login-row">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
