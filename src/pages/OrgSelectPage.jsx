import { useState, useEffect } from 'react';
import {
  Factory, Plus, Building2, ChevronRight, LogOut, X,
  Loader2, Check, Users, Briefcase, Edit2, Trash2,
  AlertTriangle, Settings, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const INDUSTRY_OPTIONS = [
  'Manufacturing', 'Automotive', 'Chemical', 'Pharmaceutical',
  'Food & Beverage', 'Textile', 'Electronics', 'Construction', 'Other',
];

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

// ─── Modal: Create / Edit Org ────────────────────────────────────────────────
function OrgFormModal({ onClose, onSaved, editOrg = null }) {
  const { createOrganization, updateOrganization } = useAuthStore();
  const [form, setForm] = useState({
    name: editOrg?.name || '',
    industry: editOrg?.industry || 'Manufacturing',
    size: editOrg?.size || '11-50',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!editOrg;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Organisation name is required'); return; }
    setSaving(true);
    setError('');
    const result = isEdit
      ? await updateOrganization(editOrg.id, form)
      : await createOrganization(form);
    setSaving(false);
    if (!result.success) { setError(result.error || 'Something went wrong'); return; }
    onSaved(result.data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-org-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-org-header">
          <div className="create-org-icon">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="create-org-title">
              {isEdit ? 'Edit Organisation' : 'Create Organisation'}
            </h3>
            <p className="create-org-sub">
              {isEdit ? 'Update workspace details' : 'Set up a new workspace for your company'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="close-org-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-org-form" id="org-form">
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
              color: '#be123c', fontSize: 13, marginBottom: 14,
            }}>
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="org-name">
              Company / Organisation Name <span className="required-star">*</span>
            </label>
            <input
              id="org-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nisarg Polymers Pvt. Ltd."
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
                onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                className="login-input"
              >
                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="org-size">Team Size</label>
              <select
                id="org-size"
                value={form.size}
                onChange={(e) => setForm(f => ({ ...f, size: e.target.value }))}
                className="login-input"
              >
                {SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} employees</option>)}
              </select>
            </div>
          </div>

          <div className="create-org-actions">
            <button type="button" onClick={onClose} className="btn-cancel" id="cancel-org-modal">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="login-submit-btn flex-1"
              id="submit-org-btn"
            >
              {saving ? (
                <><Loader2 size={18} className="spin" /><span>{isEdit ? 'Saving…' : 'Creating…'}</span></>
              ) : (
                <><Check size={18} /><span>{isEdit ? 'Save Changes' : 'Create & Continue'}</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Confirm Delete ───────────────────────────────────────────────────
function DeleteConfirmModal({ org, onClose, onDeleted }) {
  const { deleteOrganization } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteOrganization(org.id);
    setDeleting(false);
    if (result.success) onDeleted();
    else onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-org-modal" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}>
        <div style={{ padding: '28px 28px 0', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#fff1f2',
            border: '2px solid #fecdd3', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Trash2 size={24} style={{ color: '#e11d48' }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Delete Organisation?
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
            <strong>"{org.name}"</strong> will be permanently deleted. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 28px 28px' }}>
          <button onClick={onClose} className="btn-cancel" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              flex: 1, padding: '12px', borderRadius: 12, background: '#e11d48',
              color: 'white', fontWeight: 700, fontSize: 14, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, fontFamily: 'Outfit, sans-serif',
            }}
          >
            {deleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function OrgSelectPage() {
  const {
    currentUser, organizations, orgsLoading,
    selectOrganization, logout, loadOrganizations,
  } = useAuthStore();

  const isAdmin = currentUser?.role === 'admin';

  const [modal, setModal] = useState(null); // null | 'create' | { type:'edit', org } | { type:'delete', org }
  const [selecting, setSelecting] = useState(null);

  useEffect(() => { loadOrganizations(); }, []);

  const handleSelect = async (org) => {
    setSelecting(org.id);
    await new Promise(r => setTimeout(r, 350));
    selectOrganization(org);
  };

  const handleSaved = (savedOrg) => {
    setModal(null);
    // If it was a create, immediately enter that org
    if (modal === 'create') {
      selectOrganization(savedOrg);
    }
  };

  const handleDeleted = () => {
    setModal(null);
    loadOrganizations();
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
            Choose a workspace to enter, or create a new one. Each organisation has its own isolated data.
          </p>
        </div>

        {/* Loading state */}
        {orgsLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 0', color: '#64748b', fontSize: 14 }}>
            <Loader2 size={22} className="spin" style={{ color: '#10b981' }} />
            Loading organisations…
          </div>
        )}

        {!orgsLoading && (
          <div className="org-cards-grid" id="org-cards-grid">
            {/* Existing org cards */}
            {organizations.map((org) => (
              <div key={org.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleSelect(org)}
                  disabled={!!selecting}
                  className={`org-card ${selecting === org.id ? 'org-card-loading' : ''}`}
                  id={`org-card-${org.id}`}
                  style={{ paddingRight: 80 }}
                >
                  <div className="org-card-icon">
                    <Building2 size={26} className="text-emerald-600" />
                  </div>
                  <div className="org-card-info">
                    <div className="org-card-name-row">
                      <span className="org-card-name">{org.name}</span>
                    </div>
                    <div className="org-card-meta">
                      <span className="org-meta-chip">
                        <Briefcase size={12} />{org.industry}
                      </span>
                      <span className="org-meta-chip">
                        <Users size={12} />{org.size} employees
                      </span>
                    </div>
                  </div>
                  <div className="org-card-arrow">
                    {selecting === org.id
                      ? <Loader2 size={20} className="spin text-emerald-600" />
                      : <ArrowRight size={20} className="text-slate-400" />
                    }
                  </div>
                </button>

                {/* Admin-only edit/delete actions */}
                {isAdmin && (
                  <div style={{
                    position: 'absolute', top: '50%', right: 52,
                    transform: 'translateY(-50%)',
                    display: 'flex', gap: 4,
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', org }); }}
                      title="Edit organisation"
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: '#f1f5f9',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', org }); }}
                      title="Delete organisation"
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: '#f1f5f9',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Create new org card (Admin only) */}
            {isAdmin && (
              <button
                onClick={() => setModal('create')}
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
            )}

            {/* Empty state */}
            {organizations.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center', padding: '20px 20px 0',
                color: '#94a3b8', fontSize: 14,
              }}>
                {isAdmin
                  ? "No organisations yet. Create your first one above ↑"
                  : "You have not been granted access to any organisations. Please contact your administrator."}
              </div>
            )}
          </div>
        )}

        {/* Go to settings link (Admin only) */}
        {isAdmin && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href="/settings" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5,
              color: '#94a3b8', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <Settings size={14} /> Manage staff & settings
            </a>
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === 'create' && (
        <OrgFormModal
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === 'edit' && (
        <OrgFormModal
          editOrg={modal.org}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadOrganizations(); }}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal
          org={modal.org}
          onClose={() => setModal(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
