import { useState } from 'react';
import { Factory, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, authError, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleDemoLogin = async () => {
    setEmail('demo@rubbertics.com');
    setPassword('demo123');
    await login('demo@rubbertics.com', 'demo123');
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
                { icon: '📦', text: 'Purchase Orders & Inventory' },
                { icon: '🏭', text: 'Production Planning & Work Orders' },
                { icon: '🚚', text: 'Dispatch & Inward Tracking' },
                { icon: '📊', text: 'Reports & Analytics' },
                { icon: '🏢', text: 'Multi-Organization Support' },
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
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your workspace</p>
            </div>

            {/* Demo badge */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="demo-badge-btn"
              id="demo-login-btn"
            >
              <Zap size={15} />
              <span>Try Demo — no account needed</span>
              <ArrowRight size={15} />
            </button>

            <div className="divider">
              <span>or sign in with your account</span>
            </div>

            <form onSubmit={handleSubmit} className="login-form" id="login-form">
              {authError && (
                <div className="auth-error" onClick={clearError}>
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
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@company.com"
                    className="login-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className="login-input"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="password-toggle"
                    tabIndex={-1}
                    id="toggle-password-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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

            <p className="login-hint">
              Demo credentials: <strong>demo@rubbertics.com</strong> / <strong>demo123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
