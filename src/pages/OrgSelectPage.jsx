import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Plus, Building2, ChevronRight, LogOut, X,
  Loader2, Check, Users, Briefcase, Edit2, Trash2,
  AlertTriangle, Settings, ArrowRight, ChevronDown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';

const orgSchema = z.object({
  name: z.string().min(1, 'Organisation name is required'),
  industry: z.string(),
  size: z.string()
});

const INDUSTRY_OPTIONS = [
  'Manufacturing', 'Automotive', 'Chemical', 'Pharmaceutical',
  'Food & Beverage', 'Textile', 'Electronics', 'Construction', 'Other',
];

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

// ─── Modal: Create / Edit Org ────────────────────────────────────────────────
function OrgFormModal({ onClose, onSaved, editOrg = null }) {
  const { createOrganization, updateOrganization } = useAuthStore();
  const [error, setError] = useState('');
  const isEdit = !!editOrg;
  
  const { register, handleSubmit: hookFormSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: editOrg?.name || '',
      industry: editOrg?.industry || 'Manufacturing',
      size: editOrg?.size || '11-50',
    }
  });

  const onSubmit = async (data) => {
    setError('');
    const result = isEdit
      ? await updateOrganization(editOrg.id, data)
      : await createOrganization(data);
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

        <form onSubmit={hookFormSubmit(onSubmit)} className="create-org-form" id="org-form">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[13px] mb-3.5">
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
              placeholder="e.g. Nisarg Polymers Pvt. Ltd."
              className={`login-input ${errors.name ? 'border-red-400 focus:border-red-500' : ''}`}
              autoFocus
              {...register('name')}
            />
            {errors.name && <span className="text-xs font-medium text-red-500 mt-1 block">{errors.name.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="org-industry">Industry</label>
              <select
                id="org-industry"
                className="login-input"
                {...register('industry')}
              >
                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="org-size">Team Size</label>
              <select
                id="org-size"
                className="login-input"
                {...register('size')}
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
              disabled={isSubmitting || !watch('name')?.trim()}
              className="login-submit-btn flex-1"
              id="submit-org-btn"
            >
              {isSubmitting ? (
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
      <div className="create-org-modal max-w-[400px]" onClick={(e) => e.stopPropagation()}>
        <div className="pt-7 px-7 pb-0 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-rose-600" />
          </div>
          <h3 className="text-[17px] font-extrabold text-slate-900 mb-2">
            Delete Organisation?
          </h3>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
            <strong>"{org.name}"</strong> will be permanently deleted. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-2.5 px-7 pb-7 pt-0">
          <button onClick={onClose} className="btn-cancel flex-1">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-[14px] border-none cursor-pointer flex items-center justify-center gap-2 font-sans hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  const navigate = useNavigate();

  const [modal, setModal] = useState(null); // null | 'create' | { type:'edit', org } | { type:'delete', org }
  const [selecting, setSelecting] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!openUserMenu) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openUserMenu]);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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
        <div className="erp-topbar-right" ref={userMenuRef}>
          <button
            className="erp-topbar-user-btn"
            onClick={() => setOpenUserMenu(v => !v)}
            id="org-page-user-menu-btn"
          >
            <div className="erp-topbar-avatar">{initials}</div>
            <div className="erp-topbar-user-info">
              <span className="erp-topbar-name">{currentUser?.name}</span>
              <span className={`erp-topbar-role ${isAdmin ? 'admin' : 'staff'}`}>
                {isAdmin ? '👑 Admin' : '👤 Staff'}
              </span>
            </div>
            <ChevronDown
              size={15}
              className={`erp-topbar-chevron transition-transform duration-200 ${openUserMenu ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          {openUserMenu && (
            <div className="erp-topbar-dropdown">
              <div className="erp-drop-user-card">
                <div className="erp-drop-avatar-lg">{initials}</div>
                <div>
                  <div className="erp-drop-name">{currentUser?.name}</div>
                  <div className="erp-drop-email">{currentUser?.email}</div>
                </div>
              </div>

              <div className="erp-drop-divider" />

              {isAdmin && (
                <button
                  className="erp-drop-item"
                  onClick={() => { setOpenUserMenu(false); navigate('/settings'); }}
                >
                  <div className="erp-drop-item-icon">
                    <Settings size={15} />
                  </div>
                  <span>Settings</span>
                </button>
              )}

              <div className="erp-drop-divider" />

              <button
                className="erp-drop-item danger"
                onClick={() => { setOpenUserMenu(false); logout(); }}
                id="org-page-logout-btn"
              >
                <div className="erp-drop-item-icon danger">
                  <LogOut size={15} />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          )}
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

        {orgsLoading && (
          <div className="flex items-center justify-center gap-3 py-10 text-slate-500 text-[14px]">
            <Loader2 size={22} className="spin text-emerald-500" />
            Loading organisations…
          </div>
        )}

        {!orgsLoading && (
          <div className="org-cards-grid" id="org-cards-grid">
            {/* Existing org cards */}
            {organizations.map((org) => (
              <div key={org.id} className="relative">
                <button
                  onClick={() => handleSelect(org)}
                  disabled={!!selecting}
                  className={`org-card pr-20 ${selecting === org.id ? 'org-card-loading' : ''}`}
                  id={`org-card-${org.id}`}
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

                {isAdmin && (
                  <div className="absolute top-1/2 right-[52px] -translate-y-1/2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', org }); }}
                      title="Edit organisation"
                      className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', org }); }}
                      title="Delete organisation"
                      className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
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
                  <p className="org-demo-note mt-1.5">
                    Set up a fresh workspace with your company name and data
                  </p>
                </div>
                <div className="org-card-arrow">
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              </button>
            )}

            {organizations.length === 0 && (
              <div className="col-span-full text-center pt-5 px-5 pb-0 text-slate-400 text-[14px]">
                {isAdmin
                  ? "No organisations yet. Create your first one above ↑"
                  : "You have not been granted access to any organisations. Please contact your administrator."}
              </div>
            )}
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
          onSaved={handleSaved}
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
