import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Map routes → page titles
const PAGE_TITLES = {
  '/orders':                      'Sale Orders',
  '/item-master':                 'Item Master',
  '/party-master':             'Party Master',
  '/inventory':                   'Inventory',
  '/mixing-molding-plan':         'Mixing / Molding Plan',
  '/weekly-moulding-plan':        'Weekly Moulding Plan',
  '/work-order-sheet':            'Work Order Sheet',
  '/work-order-details':          'Work Order Master',
  '/daily-finishing-output':      'Daily Finishing Output',
  '/dispatch':                    'Dispatch',
  '/inward':                      'Inward',
  '/requisition-slip':            'Requisition Slip',
  '/enquiry-register':            'Enquiry Register',
  '/internal-complain-register':  'Internal Complain Register',
  '/process-control-standard':    'Process Control Standard',
  '/lot-details-register':        'Lot Details Register',
  '/settings':                    'Settings',
};

export default function Topbar() {
  const { currentUser, logout } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const pageTitle    = PAGE_TITLES[location.pathname]    || 'Dashboard';

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSettings = () => {
    setOpen(false);
    navigate('/settings');
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="erp-topbar">
      {/* Left – page title */}
      <div className="erp-topbar-left">
        <div>
          <h2 className="erp-topbar-title">{pageTitle}</h2>
        </div>
      </div>

      {/* Right – user avatar + dropdown */}
      <div className="erp-topbar-right" ref={dropRef}>
        <button
          className="erp-topbar-user-btn"
          onClick={() => setOpen(v => !v)}
          id="topbar-user-menu-btn"
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
            className={`erp-topbar-chevron transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="erp-topbar-dropdown">
            {/* User card at top */}
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
                onClick={handleSettings}
                id="topbar-settings-btn"
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
              onClick={handleLogout}
              id="topbar-logout-btn"
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
  );
}
