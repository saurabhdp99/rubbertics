import { useState } from 'react';
import {
  Factory,
  Plus,
  Building2,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  Loader2,
  Check,
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const INDUSTRY_OPTIONS = [
  'Manufacturing',
  'Automotive',
  'Chemical',
  'Pharmaceutical',
  'Food & Beverage',
  'Textile',
  'Electronics',
  'Construction',
  'Other',
];

const SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

function CreateOrgModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', industry: 'Manufacturing', size: '11-50' });
  const [isCreating, setIsCreating] = useState(false);
  const { createOrganization } = useAuthStore();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 700));
    const org = createOrganization(form);
    setIsCreating(false);
    onCreated(org);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-org-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-org-header">
          <div className="create-org-icon">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="create-org-title">Create Organisation</h3>
            <p className="create-org-sub">Set up a new workspace for your company</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="close-create-org-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="create-org-form" id="create-org-form">
          <div className="form-group">
            <label className="form-label" htmlFor="org-name">
              Company / Organisation Name <span className="required-star">*</span>
            </label>
            <input
              id="org-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Acme Industries Pvt. Ltd."
              className="login-input"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="org-industry">Industry</label>
              <select
                id="org-industry"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                className="login-input"
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="org-size">Team Size</label>
              <select
                id="org-size"
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                className="login-input"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt} employees</option>
                ))}
              </select>
            </div>
          </div>

          <div className="create-org-actions">
            <button type="button" onClick={onClose} className="btn-cancel" id="cancel-create-org">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !form.name.trim()}
              className="login-submit-btn flex-1"
              id="submit-create-org"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Create & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrgSelectPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const { currentUser, organizations, selectOrganization, logout } = useAuthStore();

  const handleSelectOrg = async (org) => {
    setSelecting(org.id);
    await new Promise((r) => setTimeout(r, 500));
    selectOrganization(org);
  };

  const handleCreated = (org) => {
    setShowCreate(false);
    selectOrganization(org);
  };

  return (
    <div className="org-select-page">
      {/* Background */}
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />
      </div>

      {/* Top bar */}
      <header className="org-topbar">
        <div className="org-topbar-brand">
          <div className="brand-icon-sm">
            <Factory size={18} className="text-white" />
          </div>
          <span className="org-topbar-name">Rubbertics ERP</span>
        </div>
        <div className="org-topbar-user">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <p className="user-name">{currentUser?.name}</p>
            <p className="user-email">{currentUser?.email}</p>
          </div>
          <button onClick={logout} className="logout-btn-sm" id="org-page-logout-btn" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="org-select-main">
        <div className="org-select-header">
          <div className="org-select-icon-wrap">
            <Briefcase size={28} className="text-emerald-600" />
          </div>
          <h1 className="org-select-title">Select your Organisation</h1>
          <p className="org-select-sub">
            Choose an existing workspace or create a new one. Each organisation has its own isolated data.
          </p>
        </div>

        <div className="org-cards-grid" id="org-cards-grid">
          {/* Existing org cards */}
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org)}
              disabled={!!selecting}
              className={`org-card ${selecting === org.id ? 'org-card-loading' : ''}`}
              id={`org-card-${org.id}`}
            >
              <div className="org-card-icon">
                <Building2 size={26} className="text-emerald-600" />
              </div>
              <div className="org-card-info">
                <div className="org-card-name-row">
                  <span className="org-card-name">{org.name}</span>
                  {org.isDemo && (
                    <span className="org-demo-badge">
                      <Sparkles size={11} />
                      Demo
                    </span>
                  )}
                </div>
                <div className="org-card-meta">
                  <span className="org-meta-chip">
                    <Briefcase size={12} />
                    {org.industry}
                  </span>
                  <span className="org-meta-chip">
                    <Users size={12} />
                    {org.size} employees
                  </span>
                </div>
                {org.isDemo && (
                  <p className="org-demo-note">Pre-loaded with sample data — perfect for exploring</p>
                )}
              </div>
              <div className="org-card-arrow">
                {selecting === org.id ? (
                  <Loader2 size={20} className="spin text-emerald-600" />
                ) : (
                  <ChevronRight size={20} className="text-slate-400" />
                )}
              </div>
            </button>
          ))}

          {/* Create new org card */}
          <button
            onClick={() => setShowCreate(true)}
            disabled={!!selecting}
            className="org-card org-card-create"
            id="create-new-org-btn"
          >
            <div className="org-card-icon org-card-icon-create">
              <Plus size={26} className="text-emerald-600" />
            </div>
            <div className="org-card-info">
              <span className="org-card-name">Create new Organisation</span>
              <p className="org-demo-note" style={{ marginTop: 6 }}>
                Set up a fresh workspace with your company name and data
              </p>
            </div>
            <div className="org-card-arrow">
              <ChevronRight size={20} className="text-slate-400" />
            </div>
          </button>
        </div>
      </main>

      {showCreate && (
        <CreateOrgModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
