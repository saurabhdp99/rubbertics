import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Factory } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address')
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { forgotPassword, isLoading, authError, clearError } = useAuthStore();
  
  const { register, handleSubmit: hookFormSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    const ok = await forgotPassword(data.email);
    if (ok) setSent(true);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />
      </div>

      <div className="auth-centered-container">
        <div className="auth-card">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div className="brand-icon" style={{ width: 44, height: 44 }}>
              <Factory size={22} className="text-white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Rubbertics ERP</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password Recovery</div>
            </div>
          </div>

          {sent ? (
            <div className="auth-success-state">
              <div className="success-icon-ring">
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 className="auth-card-title">Check your email</h2>
              <p className="auth-card-subtitle">
                We sent a password reset link to <strong>{getValues('email')}</strong>. 
                Check your inbox and follow the link to reset your password.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); clearError(); }}
                className="auth-secondary-btn"
                style={{ marginTop: '1.5rem' }}
              >
                Try a different email
              </button>
              <Link to="/" className="auth-back-link" style={{ marginTop: '1rem' }}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="auth-card-title">Forgot your password?</h2>
              <p className="auth-card-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {authError && (
                <div className="auth-error" onClick={clearError} role="alert">
                  <span>⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={hookFormSubmit(onSubmit)} className="login-form" id="forgot-password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">Email address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="you@company.com"
                      className={`login-input ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                      autoFocus
                      {...register('email', {
                        onChange: () => {
                          if (authError) clearError();
                        }
                      })}
                    />
                  </div>
                  {errors.email && <span className="text-xs font-medium text-red-500 mt-1.5 block">{errors.email.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-submit-btn"
                  id="send-reset-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>

              <Link to="/" className="auth-back-link" style={{ marginTop: '1.5rem' }}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
