import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Eye, EyeOff, Loader2, CheckCircle, X, AlertCircle, ToggleLeft, ToggleRight, Hash, Mail, User, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

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
  const { getStaffOrgAccess, toggleStaffOrgAccess } = useAuthStore();
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccess() {
      const orgIds = await getStaffOrgAccess(staff.id);
      const initialMap = {};
      orgIds.forEach(id => initialMap[id] = true);
      setAccessMap(initialMap);
      setLoading(false);
    }
    fetchAccess();
  }, [staff.id, getStaffOrgAccess]);

  const handleToggle = async (orgId) => {
    const currentlyHasAccess = !!accessMap[orgId];
    const newAccess = !currentlyHasAccess;
    
    // Optimistic update
    setAccessMap(prev => ({ ...prev, [orgId]: newAccess }));
    
    const success = await toggleStaffOrgAccess(staff.id, orgId, newAccess);
    if (!success) {
      // Revert if failed
      setAccessMap(prev => ({ ...prev, [orgId]: currentlyHasAccess }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-org-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Manage Access: {staff.name}</h3>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, marginBottom: 0 }}>Select organisations this staff member can access.</p>
        </div>
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="spin" size={24} /></div>
          ) : organizations.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14 }}>No organisations exist yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {organizations.map(org => (
                <label key={org.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <input type="checkbox" checked={!!accessMap[org.id]} onChange={() => handleToggle(org.id)} style={{ width: 18, height: 18, accentColor: '#10b981' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{org.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{org.industry}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, createStaff, listStaff, toggleStaffStatus, organizations, isLoading } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

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

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
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
                    <User size={13} style={{ display: 'inline', marginRight: 4 }} />
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
                    <Mail size={13} style={{ display: 'inline', marginRight: 4 }} />
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
                    <Hash size={13} style={{ display: 'inline', marginRight: 4 }} />
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
                    <div className="password-strength" style={{ marginTop: '0.4rem' }}>
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="strength-bar" style={{ background: i <= strengthScore ? strengthColor : 'var(--border-color)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.73rem', color: strengthColor }}>{strengthLabel}</span>
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
          <div className="settings-card" style={{ marginTop: '1.5rem' }}>
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
                <Users size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
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
                          className="staff-toggle-btn"
                          title="Manage Workspace Access"
                          style={{ color: '#0f172a', background: '#f1f5f9', borderColor: '#e2e8f0' }}
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
            <div className="account-password-hint">
              <Shield size={14} />
              <span>To change your password, use <strong>Forgot Password</strong> from the login page or contact your admin.</span>
            </div>
          </div>
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
