import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, authError, clearError } = useAuthStore();
  
  const { register, handleSubmit: hookFormSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <div className="login-page">
      {/* Background animated blobs */}
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />
      </div>

      <div className="login-container">
        {/* Left Panel - Branding */}
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon">
              <Factory size={32} className="text-white" />
            </div>
            <h1 className="brand-title">Rubbertics ERP</h1>
            <p className="brand-sub">Enterprise Resource Planning</p>
          </div>

          <div className="login-features">
            <h2 className="features-heading">Everything you need to run your factory</h2>
            <div className="feature-list">
              {[
                { icon: '📦', text: 'Sale Orders & Inventory' },
                { icon: '🏭', text: 'Production Planning & Work Orders' },
                { icon: '🚚', text: 'Dispatch & Inward Tracking' },
                { icon: '📊', text: 'Reports & Analytics' },
                { icon: '🏢', text: 'Multi-Role Staff Management' },
              ].map((f, i) => (
                <div className="feature-item" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="login-footer-text">
            Trusted by manufacturing teams across India
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-secure-badge">
                <ShieldCheck size={16} />
                <span>Secure Login</span>
              </div>
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your workspace</p>
            </div>

            <form onSubmit={hookFormSubmit(onSubmit)} className="login-form" id="login-form">
              {authError && (
                <div className="auth-error" onClick={clearError} role="alert">
                  <span>⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    className={`login-input ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                    autoComplete="email"
                    {...register('email', {
                      onChange: () => {
                        if (authError) clearError();
                      }
                    })}
                  />
                </div>
                {errors.email && <span className="text-xs font-medium text-red-500 mt-1.5 block">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <Link
                    to="/forgot-password"
                    className="forgot-link"
                    id="forgot-password-link"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`login-input ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                    autoComplete="current-password"
                    {...register('password', {
                      onChange: () => {
                        if (authError) clearError();
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="password-toggle"
                    tabIndex={-1}
                    id="toggle-password-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs font-medium text-red-500 mt-1.5 block">{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-submit-btn"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <p className="login-hint" style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Contact your administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
