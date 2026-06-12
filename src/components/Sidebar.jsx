import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Purchase Orders', path: '/orders' },
  { label: 'Item Master', path: '/item-master' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Mixing/Molding Plan', path: '/mixing-molding-plan' },
  { label: 'Weekly Moulding Plan', path: '/weekly-moulding-plan' },
  { label: 'Work Order Sheet', path: '/work-order-sheet' },
  { label: 'Work Order Master', path: '/work-order-details' },
  { label: 'Daily Finishing Output', path: '/daily-finishing-output' },
  { label: 'Dispatch', path: '/dispatch' },
  { label: 'Inward', path: '/inward' },
  { label: 'Requisition Slip', path: '/requisition-slip' },
  { label: 'Enquiry Register', path: '/enquiry-register' },
  { label: 'Internal Complain Register', path: '/internal-complain-register' },
  { label: 'Process Control Standard', path: '/process-control-standard' },
  { label: 'Lot Details Register', path: '/lot-details-register' },
];

export default function Sidebar() {
  const { currentOrg, logout, selectOrganization, organizations } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-56 z-30 flex flex-col bg-white border-r border-slate-200"
    >
      {/* Logo / Org Switcher Section */}
      <div className="relative border-b border-slate-100">
        <div className="flex items-center h-20 px-4 justify-between gap-2">
          <div className="flex items-center gap-2 w-full min-w-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-left truncate hover:bg-slate-50 p-1.5 rounded-xl border border-slate-100/80 transition-all flex-1 min-w-0 group cursor-pointer"
              id="org-selector-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                <Building2 size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">{currentOrg?.name}</p>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-0.5">{currentOrg?.industry || 'Workspace'}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1.5 left-4 right-4 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
              Active Workspaces
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {organizations.map((org) => {
                const isSelected = org.id === currentOrg?.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      selectOrganization(org);
                      setDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer
                      ${isSelected ? 'bg-emerald-50/30' : ''}
                    `}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold truncate leading-tight ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{org.industry} • {org.size} employees</p>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-slate-100 my-1.5" />
            <button
              onClick={() => {
                selectOrganization(null);
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Plus size={14} />
              </div>
              <span className="text-[12px] font-bold">Manage / Create Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Navigation</p>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center gap-3.5 px-4 py-3 rounded-xl
                transition-all duration-200 group
                ${isActive
                  ? 'sidebar-active-item'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              <span className="text-[14px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer">
            <Settings size={20} />
            <span className="text-[14px] font-medium">Settings</span>
          </button>
          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="text-[14px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
