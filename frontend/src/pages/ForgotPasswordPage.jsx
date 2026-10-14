import { useState } from "react";
import { Link } from "react-router";
import { Zap, MailCheck } from "lucide-react";
import LoadingBar from "../components/LoadingBar";
import "./VerifyEmailPage.css";
import { API_URL } from "../api";


function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL + "/forgot-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSent(true);
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

        {sent ? (
          <div className="verify-body">
            <MailCheck size={44} className="verify-icon-success" />
            <h2>Check your email</h2>
            <p>
              If that email is registered, a reset link is on its way. The link
              expires in 1 hour.
            </p>
            <Link to="/login" className="verify-btn">
              Back to login
            </Link>
          </div>
        ) : (
          <div className="verify-body">
            <h2>Forgot your password?</h2>
            <p>
              Enter the email you signed up with and we will send you a link to
              choose a new password.
            </p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="verify-field">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="verify-error">{error}</p>}

              <button type="submit" className="verify-btn" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="verify-link-row">
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
