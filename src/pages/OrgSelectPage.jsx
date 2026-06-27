import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Plus, Building2, ChevronRight, LogOut, X,
  Loader2, Check, Users, Briefcase, Edit2, Trash2,
  AlertTriangle, Settings, ArrowRight, ChevronDown, FileText, UploadCloud
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';

const orgSchema = z.object({
  name: z.string().min(1, 'Organisation name is required'),
  short_name: z.string().optional(),
  registered_address: z.string().optional(),
  factory_address: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  tan_number: z.string().optional(),
  date_of_incorporation: z.string().optional(),
  cin_number: z.string().optional(),
  msme_number: z.string().optional(),
  msme_validity: z.string().optional(),
  banking_details: z.string().optional(),
  bank_name: z.string().optional(),
  bank_branch: z.string().optional(),
  bank_account_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  iso_certificate_number: z.string().optional(),
  iso_validity: z.string().optional(),
  pf_number: z.string().optional(),
  esic_number: z.string().optional(),
  prof_tax_number: z.string().optional(),
  factory_license_number: z.string().optional(),
  pollution_certificate_number: z.string().optional(),
  fire_noc_number: z.string().optional(),
});

// ─── Attachments Field ──────────────────────────────────────────────────────
function AttachmentsField({ value, onChange, disabled }) {
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    const newAttachment = { id: crypto.randomUUID(), name: '', fileData: null, fileName: '', fileType: '' };
    onChange([...(value || []), newAttachment]);
  };

  const handleRemove = (id) => {
    onChange((value || []).filter(att => att.id !== id));
  };

  const handleUpdate = (id, updates) => {
    onChange((value || []).map(att => att.id === id ? { ...att, ...updates } : att));
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpdate(id, {
        fileObject: file,
        fileData: URL.createObjectURL(file), // temporary local URL for preview
        fileName: file.name,
        fileType: file.type
      });
    }
    e.target.value = null;
  };

  const triggerFileInput = (id) => {
    setEditingId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openFile = (fileData) => {
    if (!fileData) return;
    if (fileData.startsWith('blob:') || fileData.startsWith('http')) {
      window.open(fileData, '_blank');
    } else {
      const newTab = window.open();
      newTab.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(editingId, e)}
        disabled={disabled}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />

      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">
          {(!value || value.length === 0) ? 'Company Documents' : `Company Documents (${value.length})`}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <UploadCloud size={14} /> Add Document
          </button>
        )}
      </div>

      {(!value || value.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <FileText size={32} className="mb-2 opacity-50 text-slate-400" />
          <p className="text-sm font-medium">No documents attached</p>
          {!disabled && <p className="text-xs mt-1 text-slate-400">Click "Add Document" to upload Logo, PAN, GST, etc.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {value.map((att) => (
            <div key={att.id} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <select
                value={att.name || ''}
                onChange={(e) => handleUpdate(att.id, { name: e.target.value })}
                disabled={disabled}
                className="w-full h-[36px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-700 focus:bg-white outline-none transition-colors"
              >
                <option value="" disabled>Select Document Type</option>
                <option value="Company Logo">Company Logo</option>
                <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                <option value="GST Certificate">GST Certificate</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Factory License">Factory License</option>
                <option value="ISO/IATF Certificates">ISO/IATF Certificates</option>
                <option value="Bank Cancelled Cheque">Bank Cancelled Cheque</option>
                <option value="Digital Signature">Digital Signature</option>
                <option value="Other">Other</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerFileInput(att.id)}
                  disabled={disabled}
                  className="flex-1 h-[36px] flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[13px] font-semibold overflow-hidden px-2"
                >
                  <span className="truncate">{att.fileName || 'Choose File...'}</span>
                </button>
                {(att.url || att.fileData) && (
                  <button
                    type="button"
                    onClick={() => openFile(att.url || att.fileData)}
                    className="h-[36px] px-3 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-semibold text-[13px]"
                  >
                    View
                  </button>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(att.id)}
                    className="h-[36px] w-[36px] flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Form: Create / Edit Org ──────────────────────────────────────────
function OrgFormInline({ onCancel, onSaved, editOrg = null }) {
  const { createOrganization, updateOrganization } = useAuthStore();
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState(editOrg?.attachments || []);
  const isEdit = !!editOrg;
  
  const { register, handleSubmit: hookFormSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: editOrg?.name || '',
      short_name: editOrg?.short_name || '',
      registered_address: editOrg?.registered_address || '',
      factory_address: editOrg?.factory_address || '',
      gst_number: editOrg?.gst_number || '',
      pan_number: editOrg?.pan_number || '',
      tan_number: editOrg?.tan_number || '',
      date_of_incorporation: editOrg?.date_of_incorporation || '',
      cin_number: editOrg?.cin_number || '',
      msme_number: editOrg?.msme_number || '',
      msme_validity: editOrg?.msme_validity || '',
      banking_details: editOrg?.banking_details || '',
      bank_name: editOrg?.bank_name || '',
      bank_branch: editOrg?.bank_branch || '',
      bank_account_name: editOrg?.bank_account_name || '',
      bank_account_number: editOrg?.bank_account_number || '',
      bank_ifsc: editOrg?.bank_ifsc || '',
      iso_certificate_number: editOrg?.iso_certificate_number || '',
      iso_validity: editOrg?.iso_validity || '',
      pf_number: editOrg?.pf_number || '',
      esic_number: editOrg?.esic_number || '',
      prof_tax_number: editOrg?.prof_tax_number || '',
      factory_license_number: editOrg?.factory_license_number || '',
      pollution_certificate_number: editOrg?.pollution_certificate_number || '',
      fire_noc_number: editOrg?.fire_noc_number || '',
    }
  });

  const onSubmit = async (data) => {
    setError('');
    const payload = { ...data, attachments };
    const result = isEdit
      ? await updateOrganization(editOrg.id, payload)
      : await createOrganization(payload);
    if (!result.success) { setError(result.error || 'Something went wrong'); return; }
    onSaved(result.data);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6 mb-12">
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-sm">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEdit ? 'Edit Organisation' : 'Create Organisation'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? 'Update workspace details' : 'Set up a new workspace for your company'}
            </p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          Cancel & Go Back
        </button>
      </div>

      <form onSubmit={hookFormSubmit(onSubmit)} className="px-8 py-6 space-y-8" id="org-form">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm mb-4">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* SECTION: Basic Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Basic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="org-name">Company Name <span className="text-red-500">*</span></label>
                <input id="org-name" type="text" placeholder="e.g. Nisarg Polymers Pvt. Ltd." className={`login-input ${errors.name ? 'border-red-400 focus:border-red-500' : ''}`} autoFocus {...register('name')} />
                {errors.name && <span className="text-xs font-medium text-red-500 mt-1 block">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-short-name">Short Name</label>
                <input id="org-short-name" type="text" placeholder="e.g. NPPL" className="login-input" {...register('short_name')} />
              </div>
            </div>
          </div>

          {/* SECTION: Addresses */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Addresses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="org-reg-address">Registered Address</label>
                <textarea id="org-reg-address" rows="3" placeholder="Full registered address..." className="login-input py-3 resize-y" {...register('registered_address')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-fac-address">Factory Address</label>
                <textarea id="org-fac-address" rows="3" placeholder="Full factory address..." className="login-input py-3 resize-y" {...register('factory_address')} />
              </div>
            </div>
          </div>

          {/* SECTION: Registration & Tax */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Tax & Registration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="org-gst">GST Number</label>
                <input id="org-gst" type="text" className="login-input uppercase" {...register('gst_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-pan">PAN Number</label>
                <input id="org-pan" type="text" className="login-input uppercase" {...register('pan_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-tan">TAN Number</label>
                <input id="org-tan" type="text" className="login-input uppercase" {...register('tan_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-cin">CIN Number</label>
                <input id="org-cin" type="text" className="login-input uppercase" {...register('cin_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-doi">Date of Incorporation</label>
                <input id="org-doi" type="date" className="login-input" {...register('date_of_incorporation')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-msme">MSME Number</label>
                <input id="org-msme" type="text" className="login-input uppercase" {...register('msme_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-msme-val">MSME Validity</label>
                <input id="org-msme-val" type="date" className="login-input" {...register('msme_validity')} />
              </div>
            </div>
          </div>

          {/* SECTION: Banking */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Banking Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="org-bank-name">Bank Name</label>
                <input id="org-bank-name" type="text" placeholder="e.g. HDFC Bank" className="login-input" {...register('bank_name')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-bank-branch">Branch Name</label>
                <input id="org-bank-branch" type="text" placeholder="e.g. Andheri East" className="login-input" {...register('bank_branch')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-bank-acc-name">Account Name</label>
                <input id="org-bank-acc-name" type="text" placeholder="e.g. Nisarg Polymers Pvt Ltd" className="login-input" {...register('bank_account_name')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-bank-acc-no">Account Number</label>
                <input id="org-bank-acc-no" type="text" className="login-input" {...register('bank_account_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-bank-ifsc">IFSC Code</label>
                <input id="org-bank-ifsc" type="text" className="login-input uppercase" {...register('bank_ifsc')} />
              </div>
            </div>
          </div>

          {/* SECTION: Compliances & Certificates */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Compliances & Certificates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="org-pf">PF Number</label>
                <input id="org-pf" type="text" className="login-input uppercase" {...register('pf_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-esic">ESIC Number</label>
                <input id="org-esic" type="text" className="login-input uppercase" {...register('esic_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-prof-tax">Professional Tax Number</label>
                <input id="org-prof-tax" type="text" className="login-input uppercase" {...register('prof_tax_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-fac-lic">Factory License Number</label>
                <input id="org-fac-lic" type="text" className="login-input uppercase" {...register('factory_license_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-poll-cert">Pollution Certificate</label>
                <input id="org-poll-cert" type="text" className="login-input uppercase" {...register('pollution_certificate_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-fire-noc">Fire NOC Number</label>
                <input id="org-fire-noc" type="text" className="login-input uppercase" {...register('fire_noc_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-iso-cert">ISO Certificate Number</label>
                <input id="org-iso-cert" type="text" className="login-input uppercase" {...register('iso_certificate_number')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org-iso-val">ISO Validity</label>
                <input id="org-iso-val" type="date" className="login-input" {...register('iso_validity')} />
              </div>
            </div>
          </div>

          {/* SECTION: Attachments */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Documents & Attachments</h4>
            <AttachmentsField value={attachments} onChange={setAttachments} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={onCancel} className="btn-cancel w-32" id="cancel-org-modal">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !watch('name')?.trim()}
              className="login-submit-btn flex-1 min-w-[200px]"
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

  const [view, setView] = useState('list'); // 'list' | 'create' | { type: 'edit', org }
  const [deleteModal, setDeleteModal] = useState(null); // null | org
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
    // If it was a create, immediately enter that org
    if (view === 'create') {
      selectOrganization(savedOrg);
    }
    setView('list');
  };

  const handleDeleted = () => {
    setDeleteModal(null);
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
      <main className="org-select-main max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {view === 'list' && (
          <>
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
                      {org.short_name && (
                        <span className="org-meta-chip">
                          <Briefcase size={12} />{org.short_name}
                        </span>
                      )}
                      {org.gst_number && (
                        <span className="org-meta-chip">
                          <FileText size={12} />GST: {org.gst_number}
                        </span>
                      )}
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
                      onClick={(e) => { e.stopPropagation(); setView({ type: 'edit', org }); }}
                      title="Edit organisation"
                      className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteModal(org); }}
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
                onClick={() => setView('create')}
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
          </>
        )}

        {view === 'create' && (
          <OrgFormInline
            onCancel={() => setView('list')}
            onSaved={handleSaved}
          />
        )}
        
        {view?.type === 'edit' && (
          <OrgFormInline
            editOrg={view.org}
            onCancel={() => setView('list')}
            onSaved={handleSaved}
          />
        )}
      </main>

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteConfirmModal
          org={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
