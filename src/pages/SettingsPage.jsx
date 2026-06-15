import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Shield, Eye, EyeOff, Loader2, CheckCircle, X, AlertCircle, ToggleLeft, ToggleRight, Hash, Mail, User, Building, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { navItems } from '../components/Sidebar';

function StaffBadge({ role }) {
  return (
    <span className={`staff-role-badge ${role}`}>{role === 'admin' ? '👑 Admin' : '👤 Staff'}</span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span className={`staff-status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function ManageStaffOrgsModal({ staff, organizations, onClose }) {
  const { getStaffOrgAccess, updateStaffOrgAccess } = useAuthStore();
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAccess() {
      const accessData = await getStaffOrgAccess(staff.id);
      const initialMap = {};
      accessData.forEach(item => {
        initialMap[item.org_id] = { hasAccess: true, allowedPages: item.allowed_pages, hasChanged: false };
      });
      setAccessMap(initialMap);
      setLoading(false);
    }
    fetchAccess();
  }, [staff.id, getStaffOrgAccess]);

  const handleToggleOrg = (orgId) => {
    const currentState = accessMap[orgId] || { hasAccess: false, allowedPages: null };
    const newHasAccess = !currentState.hasAccess;
    const newAllowedPages = newHasAccess ? null : null; // default to full access when newly checked

    setAccessMap(prev => ({ ...prev, [orgId]: { hasAccess: newHasAccess, allowedPages: newAllowedPages, hasChanged: true } }));
  };

  const handleTogglePage = (orgId, pagePath) => {
    const currentState = accessMap[orgId];
    if (!currentState || !currentState.hasAccess) return;

    let currentPages = currentState.allowedPages;
    let newPages = [];
    
    if (currentPages === null) {
      newPages = navItems.filter(item => item.path !== pagePath).map(item => item.path);
    } else {
      if (currentPages.includes(pagePath)) {
        newPages = currentPages.filter(p => p !== pagePath);
      } else {
        newPages = [...currentPages, pagePath];
      }
    }

    setAccessMap(prev => ({ ...prev, [orgId]: { ...currentState, allowedPages: newPages, hasChanged: true } }));
  };

  const handleToggleAllPages = (orgId) => {
    const currentState = accessMap[orgId];
    if (!currentState || !currentState.hasAccess) return;
    
    const isAllChecked = currentState.allowedPages === null || currentState.allowedPages.length === navItems.length;
    const newPages = isAllChecked ? [] : null; // toggle between none and all

    setAccessMap(prev => ({ ...prev, [orgId]: { ...currentState, allowedPages: newPages, hasChanged: true } }));
  };

  const handleSave = async () => {
    setSaving(true);
    // find all organizations that were changed
    const changedOrgs = Object.keys(accessMap).filter(orgId => accessMap[orgId].hasChanged);
    
    // update all in parallel
    await Promise.all(changedOrgs.map(orgId => {
      const orgState = accessMap[orgId];
      return updateStaffOrgAccess(staff.id, orgId, orgState.hasAccess, orgState.allowedPages);
    }));

    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-org-modal max-w-[600px] w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-[18px] font-bold m-0">Manage Access: {staff.name}</h3>
            <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <p className="text-[13px] text-slate-500 mt-2 mb-0">Select organisations and allowed pages this staff member can access.</p>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-5"><Loader2 className="spin" size={24} /></div>
          ) : organizations.length === 0 ? (
            <p className="text-center text-slate-500 text-[14px]">No organisations exist yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {organizations.map(org => {
                const orgAccess = accessMap[org.id];
                const hasAccess = !!orgAccess?.hasAccess;
                const allowedPages = orgAccess?.allowedPages;
                const allPagesChecked = hasAccess && (allowedPages === null || allowedPages.length === navItems.length);

                return (
                  <div key={org.id} className={`border rounded-xl transition-colors duration-200 ${hasAccess ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 rounded-t-xl">
                      <input 
                        type="checkbox" 
                        checked={hasAccess} 
                        onChange={() => handleToggleOrg(org.id)} 
                        className="w-4.5 h-4.5 accent-emerald-500 rounded" 
                      />
                      <div className="flex-1">
                        <div className="font-bold text-[14px] text-slate-900">{org.name}</div>
                        <div className="text-[12px] text-slate-500">{org.industry}</div>
                      </div>
                    </label>
                    
                    {hasAccess && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100/60">
                        <div className="flex justify-between items-center mb-3 mt-2">
                          <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Allowed Pages</span>
                          <button 
                            onClick={() => handleToggleAllPages(org.id)}
                            className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer bg-transparent border-none"
                          >
                            {allPagesChecked ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {navItems.map(item => {
                            const isChecked = allowedPages === null || allowedPages.includes(item.path);
                            return (
                              <label key={item.path} className="flex items-center gap-2.5 cursor-pointer group">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePage(org.id, item.path)}
                                  className="w-4 h-4 accent-emerald-500 rounded border-slate-300"
                                />
                                <span className="text-[13px] text-slate-700 group-hover:text-slate-900">{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || Object.values(accessMap).every(org => !org.hasChanged)}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, createStaff, listStaff, toggleStaffStatus, organizations, isLoading, updateEmail, updatePassword } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const navigate = useNavigate();

  // Staff form state
  const [form, setForm] = useState({ name: '', email: '', password: '', staffId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Staff list state
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');
  const [manageOrgsStaff, setManageOrgsStaff] = useState(null);

  // Account – change email
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Account – change password
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) loadStaff();
  }, [isAdmin]);

  const loadStaff = async () => {
    setLoadingStaff(true);
    const data = await listStaff();
    setStaffList(data);
    setLoadingStaff(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.staffId.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(form.staffId)) {
      setFormError('Staff ID can only contain letters, numbers, - and _');
      return;
    }

    setIsCreating(true);
    const result = await createStaff({
      email: form.email,
      password: form.password,
      name: form.name,
      staffId: form.staffId,
    });
    setIsCreating(false);

    if (result.success) {
      setFormSuccess(`Staff member "${form.name}" (ID: ${form.staffId}) created successfully!`);
      setForm({ name: '', email: '', password: '', staffId: '' });
      loadStaff();
    } else {
      setFormError(result.error || 'Failed to create staff. Please try again.');
    }
  };

  const handleToggleStatus = async (staffMember) => {
    const newStatus = !staffMember.is_active;
    const ok = await toggleStaffStatus(staffMember.id, newStatus);
    if (ok) {
      setStaffList(prev => prev.map(s => s.id === staffMember.id ? { ...s, is_active: newStatus } : s));
    }
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strengthScore];

  const getPwdStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const newPwdScore = getPwdStrength(pwdForm.newPassword);
  const newPwdLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][newPwdScore];
  const newPwdColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][newPwdScore];

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError(''); setEmailSuccess('');
    if (!emailForm.newEmail.trim()) { setEmailError('Please enter a new email.'); return; }
    if (emailForm.newEmail.trim() === currentUser?.email) { setEmailError('New email is the same as current.'); return; }
    setEmailLoading(true);
    const result = await updateEmail(emailForm.newEmail.trim());
    setEmailLoading(false);
    if (result.success) {
      setEmailSuccess('Email updated successfully!');
      setEmailForm({ newEmail: '' });
    } else {
      setEmailError(result.error || 'Failed to update email.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess('');
    if (!pwdForm.newPassword) { setPwdError('Please enter a new password.'); return; }
    if (pwdForm.newPassword.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    const result = await updatePassword(pwdForm.newPassword);
    setPwdLoading(false);
    if (result.success) {
      setPwdSuccess('Password changed successfully!');
      setPwdForm({ newPassword: '', confirmPassword: '' });
    } else {
      setPwdError(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header relative pt-4">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account and team members</p>
        </div>
        <div className="settings-current-user">
          <div className="current-user-avatar">
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="current-user-name">{currentUser?.name}</div>
            <StaffBadge role={currentUser?.role} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {isAdmin && (
          <button
            className={`settings-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
            id="tab-staff-management"
          >
            <Users size={16} />
            Staff Management
          </button>
        )}
        <button
          className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
          id="tab-account"
        >
          <Shield size={16} />
          Account
        </button>
      </div>

      {/* ── Staff Management Tab ── */}
      {activeTab === 'staff' && isAdmin && (
        <div className="settings-content">
          {/* Create Staff Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <UserPlus size={20} />
              <div>
                <h2 className="settings-card-title">Create Staff Account</h2>
                <p className="settings-card-sub">New staff will be able to log in immediately</p>
              </div>
            </div>

            {formError && (
              <div className="settings-alert error">
                <AlertCircle size={16} />
                <span>{formError}</span>
                <button onClick={() => setFormError('')}><X size={14} /></button>
              </div>
            )}
            {formSuccess && (
              <div className="settings-alert success">
                <CheckCircle size={16} />
                <span>{formSuccess}</span>
                <button onClick={() => setFormSuccess('')}><X size={14} /></button>
              </div>
            )}

            <form onSubmit={handleCreate} className="staff-create-form" id="create-staff-form">
              <div className="staff-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="staff-name">
                    <User size={13} className="inline mr-1" />
                    Full Name
                  </label>
                  <input
                    id="staff-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Raj Sharma"
                    className="settings-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="staff-email">
                    <Mail size={13} className="inline mr-1" />
                    Email Address
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="staff@company.com"
                    className="settings-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="staff-id">
                    <Hash size={13} className="inline mr-1" />
                    Staff ID
                    <span className="form-label-hint">Unique identifier for backend</span>
                  </label>
                  <input
                    id="staff-id"
                    type="text"
                    value={form.staffId}
                    onChange={(e) => setForm(f => ({ ...f, staffId: e.target.value.toUpperCase() }))}
                    placeholder="e.g. STF-001"
                    className="settings-input"
                    required
                    pattern="[A-Za-z0-9_-]+"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="staff-password">Initial Password</label>
                  <div className="settings-input-wrapper">
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="settings-input with-icon"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="settings-eye-btn" tabIndex={-1}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="password-strength mt-1.5">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="strength-bar" style={{ background: i <= strengthScore ? strengthColor : '#e2e8f0' }} />
                        ))}
                      </div>
                      <span className="text-[11.5px]" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="staff-form-footer">
                <div className="staff-form-note">
                  <Shield size={14} />
                  <span>Staff will be created with <strong>staff</strong> role. Only admins can access Settings.</span>
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="staff-create-btn"
                  id="create-staff-submit-btn"
                >
                  {isCreating ? (
                    <><Loader2 size={16} className="spin" /><span>Creating…</span></>
                  ) : (
                    <><UserPlus size={16} /><span>Create Staff Account</span></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Staff List Card */}
          <div className="settings-card mt-6">
            <div className="settings-card-header">
              <Users size={20} />
              <div>
                <h2 className="settings-card-title">Staff Members</h2>
                <p className="settings-card-sub">{staffList.length} staff account{staffList.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {loadingStaff ? (
              <div className="staff-list-loading">
                <Loader2 size={24} className="spin" />
                <span>Loading staff…</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="staff-list-empty">
                <Users size={32} className="text-[var(--text-muted)] opacity-40" />
                <p>No staff accounts yet. Create one above.</p>
              </div>
            ) : (
              <div className="staff-list">
                {staffList.map((staff) => (
                  <div key={staff.id} className={`staff-list-item ${!staff.is_active ? 'inactive' : ''}`}>
                    <div className="staff-avatar">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-info">
                      <div className="staff-name">{staff.name}</div>
                      <div className="staff-meta">
                        <span>{staff.email}</span>
                        {staff.staff_id && (
                          <span className="staff-id-tag">
                            <Hash size={11} />
                            {staff.staff_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="staff-actions">
                      <StatusBadge isActive={staff.is_active} />
                      {staff.role === 'staff' && (
                        <button
                          onClick={() => setManageOrgsStaff(staff)}
                          className="staff-toggle-btn text-slate-900 bg-slate-100 border-slate-200"
                          title="Manage Workspace Access"
                        >
                          <Building size={16} /> Access
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`staff-toggle-btn ${staff.is_active ? 'deactivate' : 'activate'}`}
                        title={staff.is_active ? 'Deactivate account' : 'Activate account'}
                        id={`toggle-staff-${staff.id}`}
                      >
                        {staff.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {staff.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Account Tab ── */}
      {activeTab === 'account' && (
        <div className="settings-content">
          {/* Profile info card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <Shield size={20} />
              <div>
                <h2 className="settings-card-title">Your Account</h2>
                <p className="settings-card-sub">Your profile and security information</p>
              </div>
            </div>
            <div className="account-info-grid">
              <div className="account-info-item">
                <span className="account-info-label">Name</span>
                <span className="account-info-value">{currentUser?.name}</span>
              </div>
              <div className="account-info-item">
                <span className="account-info-label">Email</span>
                <span className="account-info-value">{currentUser?.email}</span>
              </div>
              <div className="account-info-item">
                <span className="account-info-label">Role</span>
                <StaffBadge role={currentUser?.role} />
              </div>
              {currentUser?.staff_id && (
                <div className="account-info-item">
                  <span className="account-info-label">Staff ID</span>
                  <span className="account-info-value account-staff-id">
                    <Hash size={13} />
                    {currentUser.staff_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Change Email – admin only */}
          {isAdmin && (
            <div className="settings-card mt-6">
              <div className="settings-card-header">
                <Mail size={20} />
                <div>
                  <h2 className="settings-card-title">Change Email</h2>
                  <p className="settings-card-sub">Update the email address used to log in</p>
                </div>
              </div>

              {emailError && (
                <div className="settings-alert error">
                  <AlertCircle size={16} />
                  <span>{emailError}</span>
                  <button onClick={() => setEmailError('')}><X size={14} /></button>
                </div>
              )}
              {emailSuccess && (
                <div className="settings-alert success">
                  <CheckCircle size={16} />
                  <span>{emailSuccess}</span>
                  <button onClick={() => setEmailSuccess('')}><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleChangeEmail} id="change-email-form">
                <div className="staff-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="current-email">
                      <Mail size={13} className="inline mr-1" />
                      Current Email
                    </label>
                    <input
                      id="current-email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="settings-input opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-email">
                      <Mail size={13} className="inline mr-1" />
                      New Email
                    </label>
                    <input
                      id="new-email"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ newEmail: e.target.value })}
                      placeholder="new@example.com"
                      className="settings-input"
                      required
                    />
                  </div>
                </div>
                <div className="staff-form-footer">
                  <div className="staff-form-note">
                    <Shield size={14} />
                    <span>A confirmation may be sent to both old and new email addresses.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="staff-create-btn"
                    id="change-email-submit-btn"
                  >
                    {emailLoading ? (
                      <><Loader2 size={16} className="spin" /><span>Updating…</span></>
                    ) : (
                      <><Mail size={16} /><span>Update Email</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password – admin only */}
          {isAdmin && (
            <div className="settings-card mt-6">
              <div className="settings-card-header">
                <KeyRound size={20} />
                <div>
                  <h2 className="settings-card-title">Change Password</h2>
                  <p className="settings-card-sub">Set a new password for your account</p>
                </div>
              </div>

              {pwdError && (
                <div className="settings-alert error">
                  <AlertCircle size={16} />
                  <span>{pwdError}</span>
                  <button onClick={() => setPwdError('')}><X size={14} /></button>
                </div>
              )}
              {pwdSuccess && (
                <div className="settings-alert success">
                  <CheckCircle size={16} />
                  <span>{pwdSuccess}</span>
                  <button onClick={() => setPwdSuccess('')}><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleChangePassword} id="change-password-form">
                <div className="staff-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-password">
                      <Lock size={13} className="inline mr-1" />
                      New Password
                    </label>
                    <div className="settings-input-wrapper">
                      <input
                        id="new-password"
                        type={showNewPwd ? 'text' : 'password'}
                        value={pwdForm.newPassword}
                        onChange={(e) => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                        placeholder="Min. 8 characters"
                        className="settings-input with-icon"
                        required
                      />
                      <button type="button" onClick={() => setShowNewPwd(v => !v)} className="settings-eye-btn" tabIndex={-1}>
                        {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwdForm.newPassword && (
                      <div className="password-strength mt-1.5">
                        <div className="strength-bars">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="strength-bar" style={{ background: i <= newPwdScore ? newPwdColor : 'var(--border-color)' }} />
                          ))}
                        </div>
                        <span className="text-[0.73rem]" style={{ color: newPwdColor }}>{newPwdLabel}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-password">
                      <Lock size={13} className="inline mr-1" />
                      Confirm Password
                    </label>
                    <div className="settings-input-wrapper">
                      <input
                        id="confirm-password"
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={pwdForm.confirmPassword}
                        onChange={(e) => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        className="settings-input with-icon"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="settings-eye-btn" tabIndex={-1}>
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                      <p className="text-[0.75rem] text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {pwdForm.confirmPassword && pwdForm.newPassword === pwdForm.confirmPassword && (
                      <p className="text-[0.75rem] text-emerald-500 mt-1">✓ Passwords match</p>
                    )}
                  </div>
                </div>

                <div className="staff-form-footer">
                  <div className="staff-form-note">
                    <Shield size={14} />
                    <span>Use a strong password with uppercase, numbers, and special characters.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="staff-create-btn"
                    id="change-password-submit-btn"
                  >
                    {pwdLoading ? (
                      <><Loader2 size={16} className="spin" /><span>Saving…</span></>
                    ) : (
                      <><KeyRound size={16} /><span>Change Password</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Non-admin hint */}
          {!isAdmin && (
            <div className="account-password-hint mt-6">
              <Shield size={14} />
              <span>To change your password, use <strong>Forgot Password</strong> from the login page or contact your admin.</span>
            </div>
          )}
        </div>
      )}

      {manageOrgsStaff && (
        <ManageStaffOrgsModal
          staff={manageOrgsStaff}
          organizations={organizations}
          onClose={() => setManageOrgsStaff(null)}
        />
      )}
    </div>
  );
}
