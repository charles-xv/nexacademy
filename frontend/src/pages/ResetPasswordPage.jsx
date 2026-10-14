import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Zap, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import LoadingBar from "../components/LoadingBar";
import "./VerifyEmailPage.css";
import { API_URL } from "../api";


function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL + "/reset-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, password: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch (err) {
      setError("Could not reach the server. Is XAMPP running?");
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <LoadingBar active={loading} />
      <div className="verify-card">
        <Link to="/" className="verify-logo">
          <div className="verify-logo-icon">
            <Zap size={18} />
          </div>
          <span>
            NeX<span className="verify-logo-accent">AcaDemY</span>
          </span>
        </Link>

        {!token && (
          <div className="verify-body">
            <XCircle size={44} className="verify-icon-error" />
            <h2>Invalid link</h2>
            <p>No reset token found in this link.</p>
            <Link to="/forgot-password" className="verify-btn">
              Request a new link
            </Link>
          </div>
        )}

        {token && done && (
          <div className="verify-body">
            <CheckCircle2 size={44} className="verify-icon-success" />
            <h2>Password changed</h2>
            <p>Your password has been updated. You can now log in with it.</p>
            <Link to="/login" className="verify-btn">
              Log in
            </Link>
          </div>
        )}

        {token && !done && (
          <div className="verify-body">
            <h2>Choose a new password</h2>
            <p>Pick something you have not used on this account before.</p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="verify-field">
                <label htmlFor="password">New password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="verify-field">
                <label htmlFor="confirm">Confirm new password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && <p className="verify-error">{error}</p>}

              <button type="submit" className="verify-btn" disabled={loading}>
                {loading ? "Saving…" : "Change my password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
