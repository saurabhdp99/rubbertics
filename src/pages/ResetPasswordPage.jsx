import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, Factory, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { resetPassword, isLoading, authError, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the recovery token into the URL hash.
    // onAuthStateChange fires PASSWORD_RECOVERY event and logs the user in automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    // Also handle case where session already exists from URL token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsRecoveryMode(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strengthScore];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    const ok = await resetPassword(password);
    if (ok) {
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (!isRecoveryMode) {
    return (
      <div className="login-page">
        <div className="login-bg">
          <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
          <div className="grid-overlay" />
        </div>
        <div className="auth-centered-container">
          <div className="auth-card text-center">
            <div className="brand-icon mx-auto mb-6 w-[52px] h-[52px]">
              <Factory size={26} className="text-white" />
            </div>
            <h2 className="auth-card-title">Invalid reset link</h2>
            <p className="auth-card-subtitle">
              This link has expired or is invalid. Please request a new password reset.
            </p>
            <button onClick={() => navigate('/forgot-password')} className="login-submit-btn mt-6">
              Request new link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <div className="grid-overlay" />
      </div>

      <div className="auth-centered-container">
        <div className="auth-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="brand-icon w-11 h-11">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[1.1rem] text-[var(--text-primary)]">Set new password</div>
              <div className="text-[0.75rem] text-[var(--text-muted)]">Rubbertics ERP</div>
            </div>
          </div>

          {done ? (
            <div className="auth-success-state">
              <div className="success-icon-ring">
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 className="auth-card-title">Password updated!</h2>
              <p className="auth-card-subtitle">
                Your password has been changed successfully. Redirecting you to login…
              </p>
            </div>
          ) : (
            <>
              <h2 className="auth-card-title">Create new password</h2>
              <p className="auth-card-subtitle">Choose a strong password for your account.</p>

              {(authError || localError) && (
                <div className="auth-error" onClick={() => { clearError(); setLocalError(''); }} role="alert">
                  <span>⚠️</span>
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form" id="reset-password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="login-input"
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="password-toggle" tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className="strength-bar"
                            style={{ background: i <= strengthScore ? strengthColor : 'var(--border-color)' }}
                          />
                        ))}
                      </div>
                      <span className="text-[0.75rem]" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password">Confirm password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="login-input"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="password-toggle" tabIndex={-1}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-submit-btn"
                  id="reset-submit-btn"
                >
                  {isLoading ? (
                    <><Loader2 size={20} className="spin" /><span>Updating…</span></>
                  ) : (
                    <span>Set new password</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
