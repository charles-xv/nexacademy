import { useState } from 'react';
import { User, Mail, Sun, Moon, Check, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import './SettingsPage.css';
import { API_URL } from "../api";

function SettingsPage({ user, logout, theme, toggleTheme, updateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const emailChanged = email.trim().toLowerCase() !== (user?.email || '').toLowerCase();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Your username cannot be empty.');
      return;
    }
    setSavingProfile(true);
    setProfileError('');

    try {
      const response = await fetch(`${API_URL}/update-profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name,
          email,
          current_password: confirmPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileError(data.error || 'Could not save your changes.');
        setSavingProfile(false);
        return;
      }

      // The server response replaces the stored user, so the new name and
      // email appear everywhere the app reads it — sidebar, profile panel,
      // greetings — without a reload.
      updateUser({ ...user, ...data });
      setConfirmPassword('');
      setSavingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError('Could not reach the server. Is XAMPP running?');
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNew) {
      setPasswordError('The two new passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    setPasswordError('');

    try {
      const response = await fetch(`${API_URL}/change-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Could not change your password.');
        setSavingPassword(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
      setSavingPassword(false);
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError('Could not reach the server.');
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout user={user} logout={logout}>
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile and preferences.</p>
      </div>

      <div className="settings-section">
        <h3>Profile</h3>
        <form className="settings-card" onSubmit={handleSaveProfile}>
          <div className="settings-field">
            <label htmlFor="settings-name">Username</label>
            <div className="settings-input-wrap">
              <User size={15} />
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your username"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="settings-email">Email address</label>
            <div className="settings-input-wrap">
              <Mail size={15} />
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {emailChanged && (
            <div className="settings-field">
              <label htmlFor="settings-confirm">Current password</label>
              <div className="settings-input-wrap">
                <Lock size={15} />
                <input
                  id="settings-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm it's you"
                />
              </div>
              <small className="settings-note">
                Changing your email needs your password — it's the address used to sign in.
              </small>
            </div>
          )}

          {profileError && <p className="settings-error">{profileError}</p>}

          <button
            type="submit"
            className={`settings-save-btn${profileSaved ? ' saved' : ''}`}
            disabled={savingProfile}
          >
            {profileSaved ? (<><Check size={15} /> Saved</>)
              : savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Password</h3>
        <form className="settings-card" onSubmit={handleChangePassword}>
          <div className="settings-field">
            <label htmlFor="settings-current-pw">Current password</label>
            <div className="settings-input-wrap">
              <Lock size={15} />
              <input
                id="settings-current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="settings-new-pw">New password</label>
            <div className="settings-input-wrap">
              <Lock size={15} />
              <input
                id="settings-new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="settings-confirm-pw">Confirm new password</label>
            <div className="settings-input-wrap">
              <Lock size={15} />
              <input
                id="settings-confirm-pw"
                type="password"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                placeholder="Type it again"
              />
            </div>
          </div>

          {passwordError && <p className="settings-error">{passwordError}</p>}

          <button
            type="submit"
            className={`settings-save-btn${passwordSaved ? ' saved' : ''}`}
            disabled={savingPassword}
          >
            {passwordSaved ? (<><Check size={15} /> Password changed</>)
              : savingPassword ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-card">
          <div className="settings-toggle-row">
            <div className="settings-toggle-label">
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              <div>
                <p>Theme</p>
                <span>Currently {theme === 'light' ? 'Light' : 'Dark'} mode</span>
              </div>
            </div>
            <button
              className={`settings-switch${theme === 'dark' ? ' on' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="settings-switch-knob" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
