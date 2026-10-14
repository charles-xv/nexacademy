import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Zap, CheckCircle2, XCircle, Loader } from 'lucide-react';
import './VerifyEmailPage.css';
import { API_URL } from "../api";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error | expired
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/verify-email.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data.verified) {
          setStatus('success');
          setMessage(data.message);
        } else if (data.expired) {
          setStatus('expired');
          setMessage(data.error);
          setEmail(data.email || '');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Could not reach the server. Is XAMPP running?');
      }
    };
    verify();
  }, [searchParams]);

  const resend = async () => {
    if (!email) return;
    await fetch(`${API_URL}/resend-verification.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setMessage('A new verification link has been sent. Check your inbox.');
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <Link to="/" className="verify-logo">
          <div className="verify-logo-icon"><Zap size={18} /></div>
          <span>NeX<span className="verify-logo-accent">AcaDemY</span></span>
        </Link>

        {status === 'verifying' && (
          <div className="verify-body">
            <Loader size={40} className="verify-spinner" />
            <h2>Verifying your email…</h2>
            <p>One moment while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-body">
            <CheckCircle2 size={44} className="verify-icon-success" />
            <h2>Email verified!</h2>
            <p>{message}</p>
            <Link to="/login" className="verify-btn">Log in to your account</Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="verify-body">
            <XCircle size={44} className="verify-icon-error" />
            <h2>Link expired</h2>
            <p>{message}</p>
            {email && <button onClick={resend} className="verify-btn">Send a new link</button>}
          </div>
        )}

        {status === 'error' && (
          <div className="verify-body">
            <XCircle size={44} className="verify-icon-error" />
            <h2>Verification failed</h2>
            <p>{message}</p>
            <Link to="/register" className="verify-btn-secondary">Back to sign up</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
