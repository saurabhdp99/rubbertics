import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Shield, Eye, EyeOff, Loader2, CheckCircle, X, AlertCircle, ToggleLeft, ToggleRight, Hash, Mail, User, Building, Lock, KeyRound, ArrowLeft, Trash2 } from 'lucide-react';
import { Tabs, Card, Button, TextField, Input, Label, Description, FieldError, Spinner } from '@heroui/react';
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

function useAccessToggles(accessMap, setAccessMap) {
  return {
    handleToggleOrg: (orgId) => {
      const currentState = accessMap[orgId] || { hasAccess: false, allowedPages: null };
      const newHasAccess = !currentState.hasAccess;
      setAccessMap(prev => ({ ...prev, [orgId]: { hasAccess: newHasAccess, allowedPages: null, hasChanged: true } }));
    },
    handleTogglePage: (orgId, pagePath) => {
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
    },
    handleToggleAllPages: (orgId) => {
      const currentState = accessMap[orgId];
      if (!currentState || !currentState.hasAccess) return;
      const isAllChecked = currentState.allowedPages === null || currentState.allowedPages.length === navItems.length;
      const newPages = isAllChecked ? [] : null;
      setAccessMap(prev => ({ ...prev, [orgId]: { ...currentState, allowedPages: newPages, hasChanged: true } }));
    }
  };
}

function OrgAccessSelector({ organizations, accessMap, onToggleOrg, onTogglePage, onToggleAllPages }) {
  if (organizations.length === 0) {
    return <p className="text-center text-slate-500 text-[14px]">No organisations exist yet.</p>;
  }

  return (
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
                onChange={() => onToggleOrg(org.id)}
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
                    type="button"
                    onClick={() => onToggleAllPages(org.id)}
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
                          onChange={() => onTogglePage(org.id, item.path)}
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

  const { handleToggleOrg, handleTogglePage, handleToggleAllPages } = useAccessToggles(accessMap, setAccessMap);

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
          ) : (
            <OrgAccessSelector
              organizations={organizations}
              accessMap={accessMap}
              onToggleOrg={handleToggleOrg}
              onTogglePage={handleTogglePage}
              onToggleAllPages={handleToggleAllPages}
            />
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
  const { currentUser, createStaff, listStaff, toggleStaffStatus, removeStaff, organizations, isLoading, updateEmail, updatePassword, updateStaffOrgAccess } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const navigate = useNavigate();

  // Staff form state
  const [form, setForm] = useState({ name: '', email: '', password: '', staffId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newStaffAccessMap, setNewStaffAccessMap] = useState({});
  const {
    handleToggleOrg: handleNewStaffToggleOrg,
    handleTogglePage: handleNewStaffTogglePage,
    handleToggleAllPages: handleNewStaffToggleAllPages
  } = useAccessToggles(newStaffAccessMap, setNewStaffAccessMap);

  // Staff list state
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');
  const [manageOrgsStaff, setManageOrgsStaff] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

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

    const hasAnyOrgSelected = Object.values(newStaffAccessMap).some(org => org.hasAccess);
    if (!hasAnyOrgSelected) {
      setFormError('Please assign access to at least one workspace and select allowed pages.');
      return;
    }

    setIsCreating(true);
    const result = await createStaff({
      email: form.email,
      password: form.password,
      name: form.name,
      staffId: form.staffId,
    });

    if (result.success) {
      // Find the new staff to assign access
      const updatedStaffList = await listStaff();
      const newStaff = updatedStaffList.find(s => s.email === form.email);
      if (newStaff) {
        const changedOrgs = Object.keys(newStaffAccessMap).filter(orgId => newStaffAccessMap[orgId].hasAccess);
        await Promise.all(changedOrgs.map(orgId => {
          const orgState = newStaffAccessMap[orgId];
          return updateStaffOrgAccess(newStaff.id, orgId, orgState.hasAccess, orgState.allowedPages);
        }));
      }

      setFormSuccess(`Staff member "${form.name}" (ID: ${form.staffId}) created successfully!`);
      setForm({ name: '', email: '', password: '', staffId: '' });
      setNewStaffAccessMap({});
      setStaffList(updatedStaffList);
    } else {
      setFormError(result.error || 'Failed to create staff. Please try again.');
    }
    setIsCreating(false);
  };

  const handleRemoveStaff = async (staffMember) => {
    setRemoving(true);
    setRemoveError('');
    const result = await removeStaff(staffMember.id);
    setRemoving(false);
    if (result.success) {
      setStaffList(prev => prev.filter(s => s.id !== staffMember.id));
      setConfirmRemoveId(null);
    } else {
      setRemoveError(result.error || 'Failed to remove staff member.');
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
      </div>

      <Tabs 
        orientation="vertical" 
        variant="secondary" 
        className="flex flex-col md:flex-row gap-8 mt-4 items-start w-full"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
      >
        <Tabs.ListContainer className="w-full md:w-64 flex-shrink-0">
          <Tabs.List aria-label="Settings Tabs" className="w-full flex flex-col gap-2">
            {isAdmin && (
              <Tabs.Tab id="staff" className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium w-full text-left justify-start data-[selected=true]:bg-emerald-50 data-[selected=true]:text-emerald-700">
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  Staff Management
                </div>
                <Tabs.Indicator className="bg-emerald-500 w-1" />
              </Tabs.Tab>
            )}
            <Tabs.Tab id="account" className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium w-full text-left justify-start data-[selected=true]:bg-emerald-50 data-[selected=true]:text-emerald-700">
              <div className="flex items-center gap-3">
                <Shield size={18} />
                Account
              </div>
              <Tabs.Indicator className="bg-emerald-500 w-1" />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <main className="flex-1 min-w-0 w-full">
          {/* ── Staff Management Tab ── */}
          {isAdmin && (
            <Tabs.Panel id="staff" className="m-0 w-full outline-none">
          {/* Create Staff Card */}
          <Card className="w-full mb-6 p-2 shadow-sm border border-slate-100">
            <Card.Header className="flex gap-3 px-4 pt-4">
              <UserPlus size={24} className="text-emerald-600" />
              <div className="flex flex-col gap-0.5">
                <Card.Title className="text-lg">Create Staff Account</Card.Title>
                <Card.Description>New staff will be able to log in immediately</Card.Description>
              </div>
            </Card.Header>

            <form onSubmit={handleCreate} id="create-staff-form">
              <Card.Content className="flex flex-col gap-6 px-4 py-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                    <AlertCircle size={16} />
                    <span className="flex-1 font-medium">{formError}</span>
                    <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                  </div>
                )}
                {formSuccess && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                    <CheckCircle size={16} />
                    <span className="flex-1 font-medium">{formSuccess}</span>
                    <button type="button" onClick={() => setFormSuccess('')} className="text-emerald-500 hover:text-emerald-700"><X size={14} /></button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField isRequired name="name" value={form.name} onChange={(value) => setForm(f => ({ ...f, name: value }))}>
                    <Label className="text-slate-700"><User size={14} className="inline mr-1" /> Full Name</Label>
                    <Input placeholder="e.g. Raj Sharma" />
                  </TextField>

                  <TextField isRequired type="email" name="email" value={form.email} onChange={(value) => setForm(f => ({ ...f, email: value }))}>
                    <Label className="text-slate-700"><Mail size={14} className="inline mr-1" /> Email Address</Label>
                    <Input placeholder="staff@company.com" />
                  </TextField>

                  <TextField isRequired name="staffId" value={form.staffId} onChange={(value) => setForm(f => ({ ...f, staffId: value.toUpperCase() }))}>
                    <Label className="text-slate-700"><Hash size={14} className="inline mr-1" /> Staff ID</Label>
                    <Input placeholder="e.g. STF-001" pattern="[A-Za-z0-9_-]+" />
                    <Description>Unique identifier for backend</Description>
                  </TextField>

                  <TextField isRequired type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={(value) => setForm(f => ({ ...f, password: value }))}>
                    <Label className="text-slate-700">Initial Password</Label>
                    <Input 
                      placeholder="Min. 8 characters" 
                      endContent={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center h-full pr-2" tabIndex={-1}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    {form.password && (
                      <div className="mt-1 flex flex-col gap-1">
                        <div className="flex gap-1 h-1 w-full max-w-[100px]">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex-1 rounded-full" style={{ background: i <= strengthScore ? strengthColor : '#e2e8f0' }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </TextField>
                </div>

                {/* Workspace Access Assignment */}
                <div className="mt-2 border-t border-slate-100 pt-5">
                  <h3 className="text-[14px] font-bold text-slate-800 mb-1">
                    Assign Workspace Access <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-[12px] text-slate-500 mb-4">Select which workspaces and pages this staff member can access immediately after creation.</p>
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <OrgAccessSelector
                      organizations={organizations}
                      accessMap={newStaffAccessMap}
                      onToggleOrg={handleNewStaffToggleOrg}
                      onTogglePage={handleNewStaffTogglePage}
                      onToggleAllPages={handleNewStaffToggleAllPages}
                    />
                  </div>
                </div>
              </Card.Content>

              <Card.Footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 pb-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                  <Shield size={16} className="text-slate-400" />
                  <span>Created with <strong>staff</strong> role. Only admins can access Settings.</span>
                </div>
                <Button type="submit" isDisabled={isCreating} className="w-full sm:w-auto bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700">
                  {isCreating ? <Spinner size="sm" color="current" /> : <UserPlus size={18} />}
                  {isCreating ? 'Creating…' : 'Create Staff Account'}
                </Button>
              </Card.Footer>
            </form>
          </Card>

          {/* Staff List Card */}
          <Card className="w-full mt-6 shadow-sm border border-slate-100">
            <Card.Header className="flex gap-3 px-4 pt-4">
              <Users size={24} className="text-slate-600" />
              <div className="flex flex-col gap-0.5">
                <Card.Title className="text-lg">Staff Members</Card.Title>
                <Card.Description>{staffList.length} staff account{staffList.length !== 1 ? 's' : ''}</Card.Description>
              </div>
            </Card.Header>

            <Card.Content className="px-4 py-4">
              {loadingStaff ? (
                <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                  <Spinner size="md" color="current" />
                  <span>Loading staff…</span>
                </div>
              ) : staffList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Users size={48} className="opacity-40 mb-3" />
                  <p>No staff accounts yet. Create one above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {staffList.map((staff) => (
                    <div key={staff.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-colors ${!staff.is_active ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-3 md:mb-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-semibold text-slate-800">{staff.name}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{staff.email}</span>
                            {staff.staff_id && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                <Hash size={11} />
                                {staff.staff_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge isActive={staff.is_active} />
                        {staff.role === 'staff' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setManageOrgsStaff(staff)}
                            title="Manage Workspace Access"
                          >
                            <Building size={16} /> Access
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={staff.is_active ? "ghost" : "primary"}
                          onPress={() => handleToggleStatus(staff)}
                          title={staff.is_active ? 'Deactivate account' : 'Activate account'}
                          id={`toggle-staff-${staff.id}`}
                        >
                          {staff.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {staff.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        {confirmRemoveId === staff.id ? (
                          <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg">
                            <span className="text-[12px] text-red-600 font-semibold px-1">Sure?</span>
                            <Button
                              size="sm"
                              variant="danger"
                              onPress={() => handleRemoveStaff(staff)}
                              isDisabled={removing}
                              id={`confirm-remove-staff-${staff.id}`}
                            >
                              {removing ? <Spinner size="sm" color="current" /> : <Trash2 size={16} />}
                              {removing ? 'Removing…' : 'Confirm'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onPress={() => { setConfirmRemoveId(null); setRemoveError(''); }}
                              isDisabled={removing}
                            >
                              <X size={16} /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onPress={() => { setConfirmRemoveId(staff.id); setRemoveError(''); }}
                            title="Remove staff member permanently"
                            id={`remove-staff-${staff.id}`}
                          >
                            <Trash2 size={16} /> Remove
                          </Button>
                        )}
                      </div>
                      {removeError && confirmRemoveId === staff.id && (
                        <div className="w-full bg-red-50 text-red-600 p-2 rounded-lg flex items-center gap-2 text-[12px] mt-2">
                          <AlertCircle size={14} />
                          <span className="flex-1">{removeError}</span>
                          <button type="button" onClick={() => setRemoveError('')} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
            </Tabs.Panel>
          )}

      {/* ── Account Tab ── */}
          <Tabs.Panel id="account" className="m-0 w-full outline-none">
          {/* Profile info card */}
          <Card className="w-full shadow-sm border border-slate-100">
            <Card.Header className="flex gap-3 px-4 pt-4">
              <Shield size={24} className="text-slate-600" />
              <div className="flex flex-col gap-0.5">
                <Card.Title className="text-lg">Your Account</Card.Title>
                <Card.Description>Your profile and security information</Card.Description>
              </div>
            </Card.Header>
            <Card.Content className="px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Name</span>
                  <span className="text-sm font-semibold text-slate-800">{currentUser?.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</span>
                  <span className="text-sm font-semibold text-slate-800 break-all">{currentUser?.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Role</span>
                  <div><StaffBadge role={currentUser?.role} /></div>
                </div>
                {currentUser?.staff_id && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Staff ID</span>
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-1 bg-slate-100 w-max px-2 py-0.5 rounded text-slate-600">
                      <Hash size={13} />
                      {currentUser.staff_id}
                    </span>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Change Email – admin only */}
          {isAdmin && (
            <Card className="w-full mt-6 shadow-sm border border-slate-100">
              <Card.Header className="flex gap-3 px-4 pt-4">
                <Mail size={24} className="text-slate-600" />
                <div className="flex flex-col gap-0.5">
                  <Card.Title className="text-lg">Change Email</Card.Title>
                  <Card.Description>Update the email address used to log in</Card.Description>
                </div>
              </Card.Header>

              <form onSubmit={handleChangeEmail} id="change-email-form">
                <Card.Content className="flex flex-col gap-6 px-4 py-4">
                  {emailError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                      <AlertCircle size={16} />
                      <span className="flex-1 font-medium">{emailError}</span>
                      <button type="button" onClick={() => setEmailError('')} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  )}
                  {emailSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                      <CheckCircle size={16} />
                      <span className="flex-1 font-medium">{emailSuccess}</span>
                      <button type="button" onClick={() => setEmailSuccess('')} className="text-emerald-500 hover:text-emerald-700"><X size={14} /></button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField isDisabled name="current-email" value={currentUser?.email || ''}>
                      <Label className="text-slate-700"><Mail size={14} className="inline mr-1" /> Current Email</Label>
                      <Input variant="faded" />
                    </TextField>

                    <TextField isRequired type="email" name="new-email" value={emailForm.newEmail} onChange={(value) => setEmailForm({ newEmail: value })}>
                      <Label className="text-slate-700"><Mail size={14} className="inline mr-1" /> New Email</Label>
                      <Input placeholder="new@example.com" />
                    </TextField>
                  </div>
                </Card.Content>
                <Card.Footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 pb-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    <Shield size={16} className="text-slate-400" />
                    <span>A confirmation may be sent to both old and new email addresses.</span>
                  </div>
                  <Button type="submit" isDisabled={emailLoading} className="w-full sm:w-auto bg-slate-900 text-white font-medium shadow-sm hover:bg-slate-800">
                    {emailLoading ? <Spinner size="sm" color="current" /> : <Mail size={18} />}
                    {emailLoading ? 'Updating…' : 'Update Email'}
                  </Button>
                </Card.Footer>
              </form>
            </Card>
          )}

          {/* Change Password – admin only */}
          {isAdmin && (
            <Card className="w-full mt-6 shadow-sm border border-slate-100">
              <Card.Header className="flex gap-3 px-4 pt-4">
                <KeyRound size={24} className="text-slate-600" />
                <div className="flex flex-col gap-0.5">
                  <Card.Title className="text-lg">Change Password</Card.Title>
                  <Card.Description>Set a new password for your account</Card.Description>
                </div>
              </Card.Header>

              <form onSubmit={handleChangePassword} id="change-password-form">
                <Card.Content className="flex flex-col gap-6 px-4 py-4">
                  {pwdError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                      <AlertCircle size={16} />
                      <span className="flex-1 font-medium">{pwdError}</span>
                      <button type="button" onClick={() => setPwdError('')} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  )}
                  {pwdSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                      <CheckCircle size={16} />
                      <span className="flex-1 font-medium">{pwdSuccess}</span>
                      <button type="button" onClick={() => setPwdSuccess('')} className="text-emerald-500 hover:text-emerald-700"><X size={14} /></button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField isRequired type={showNewPwd ? 'text' : 'password'} name="new-password" value={pwdForm.newPassword} onChange={(value) => setPwdForm(f => ({ ...f, newPassword: value }))}>
                      <Label className="text-slate-700"><Lock size={14} className="inline mr-1" /> New Password</Label>
                      <Input 
                        placeholder="Min. 8 characters" 
                        endContent={
                          <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center h-full pr-2" tabIndex={-1}>
                            {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                      />
                      {pwdForm.newPassword && (
                        <div className="mt-1 flex flex-col gap-1">
                          <div className="flex gap-1 h-1 w-full max-w-[100px]">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex-1 rounded-full" style={{ background: i <= newPwdScore ? newPwdColor : '#e2e8f0' }} />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium" style={{ color: newPwdColor }}>{newPwdLabel}</span>
                        </div>
                      )}
                    </TextField>

                    <TextField isRequired type={showConfirmPwd ? 'text' : 'password'} name="confirm-password" value={pwdForm.confirmPassword} onChange={(value) => setPwdForm(f => ({ ...f, confirmPassword: value }))}>
                      <Label className="text-slate-700"><Lock size={14} className="inline mr-1" /> Confirm Password</Label>
                      <Input 
                        placeholder="Re-enter new password" 
                        endContent={
                          <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center h-full pr-2" tabIndex={-1}>
                            {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                      />
                      {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                        <p className="text-[11px] font-medium text-red-500 mt-1">Passwords do not match</p>
                      )}
                      {pwdForm.confirmPassword && pwdForm.newPassword === pwdForm.confirmPassword && (
                        <p className="text-[11px] font-medium text-emerald-500 mt-1">✓ Passwords match</p>
                      )}
                    </TextField>
                  </div>
                </Card.Content>

                <Card.Footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 pb-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    <Shield size={16} className="text-slate-400" />
                    <span>Use a strong password with uppercase, numbers, and special characters.</span>
                  </div>
                  <Button type="submit" isDisabled={pwdLoading} className="w-full sm:w-auto bg-slate-900 text-white font-medium shadow-sm hover:bg-slate-800">
                    {pwdLoading ? <Spinner size="sm" color="current" /> : <KeyRound size={18} />}
                    {pwdLoading ? 'Saving…' : 'Change Password'}
                  </Button>
                </Card.Footer>
              </form>
            </Card>
          )}

          {/* Non-admin hint */}
          {!isAdmin && (
            <div className="flex items-center gap-2 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
              <Shield size={16} className="text-slate-400" />
              <span>To change your password, use <strong>Forgot Password</strong> from the login page or contact your admin.</span>
            </div>
          )}
          </Tabs.Panel>
        </main>
      </Tabs>

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
