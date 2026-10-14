import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Zap, Eye, EyeOff } from "lucide-react";
import GoogleOneTap from "../components/GoogleOneTap";
import "./LoginPage.css";
import { API_URL } from "../api";


function LoginPage({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL + "/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setShake(true);
        setLoading(false);
        return;
      }

      login(data);
      if (data.role === "student") navigate("/dashboard");
      if (data.role === "instructor") navigate("/instructor");
      if (data.role === "admin") navigate("/admin");
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setShake(true);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand-panel">
          <Link to="/" className="login-logo-link">
            <div className="login-logo-icon">
              <Zap size={18} />
            </div>
            <span className="login-logo-text">
              NeX<span className="login-logo-accent">AcaDemY</span>
            </span>
          </Link>
          <p className="login-tagline">
            Secure access to your courses and progress
          </p>
        </div>

        <div className="login-form-panel">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Log in to continue learning</p>

          {error && <p className="login-error">{error}</p>}

          <form
            className={"login-form" + (shake ? " shake" : "")}
            onSubmit={handleSubmit}
            onAnimationEnd={() => setShake(false)}
          >
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                className={error ? "input-error" : ""}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={error ? "input-error" : ""}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
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
            <div className="login-forgot-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <GoogleOneTap login={login} context="login" />

          <p className="login-signup-row">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
