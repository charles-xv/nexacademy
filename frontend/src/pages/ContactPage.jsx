import { useState } from 'react';
import { Mail, MapPin, GraduationCap, Send, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ContactPage.css';
import { API_URL } from "../api";


function ContactPage({ theme, toggleTheme }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Every field is required.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/submit-contact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Could not send your message.');
        setSending(false);
        return;
      }

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError('Could not reach the server. Is XAMPP running?');
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <section className="contact-hero">
        <h1>Get in touch</h1>
        <p>Questions about a course, your account, or the platform itself send them here.</p>
      </section>

      <section className="contact-body">
        <div className="contact-info">
          <div className="contact-info-item">
            <div className="contact-info-icon"><Mail size={17} /></div>
            <div>
              <p>Email</p>
              <span>support@nexacademy.com</span>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><GraduationCap size={17} /></div>
            <div>
              <p>Institution</p>
              <span>Department of Computer Engineering,<br />Caritas University, Amorji-Nike</span>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><MapPin size={17} /></div>
            <div>
              <p>Location</p>
              <span>Enugu State, Nigeria</span>
            </div>
          </div>

          <p className="contact-note">
            Messages are stored securely and reviewed by an administrator.
            We do not ask for passwords or payment details over email.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-field-row">
            <div className="contact-field">
              <label htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who's writing?"
                maxLength={100}
              />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-email">Email address</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={150}
              />
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              maxLength={200}
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you need…"
              rows={6}
              maxLength={5000}
            />
            <small className="contact-count">{message.length} / 5000</small>
          </div>

          {error && <p className="contact-error">{error}</p>}
          {sent && (
            <p className="contact-success">
              <Check size={15} /> Message sent we'll get back to you.
            </p>
          )}

          <button type="submit" className="contact-submit" disabled={sending}>
            <Send size={15} /> {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
