import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, ChevronDown, Check, Plus,
  ShoppingBag, Package, Boxes, CalendarDays, CalendarRange,
  FileText, Layers, TrendingUp, Truck, ArrowDownLeft,
  ClipboardList, BookOpen, AlertTriangle, Sliders, Barcode, ContactRound, Settings, Users, Wrench, Beaker
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';

export const navItems = [
  { label: 'Sale Orders', path: '/orders', icon: ShoppingBag },
  { label: 'Item Master', path: '/item-master', icon: Package },
  { label: 'HSN/SAC Master', path: '/hsn-sac-master', icon: Barcode },
  { label: 'Machine Master', path: '/machine-master', icon: Settings },
  { label: 'Tools Master', path: '/tools-master', icon: Wrench },
  { label: 'Compound Master', path: '/compound-master', icon: Beaker },
  { label: 'Party Master', path: '/party-master', icon: ContactRound },
  { label: 'Transport Master', path: '/transport-master', icon: Truck },
  { label: 'Employee Master', path: '/employee-master', icon: Users },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Mixing/Molding Plan', path: '/mixing-molding-plan', icon: CalendarDays },
  { label: 'Weekly Moulding Plan', path: '/weekly-moulding-plan', icon: CalendarRange },
  { label: 'Work Order Sheet', path: '/work-order-sheet', icon: FileText },
  { label: 'Work Order Master', path: '/work-order-details', icon: Layers },
  { label: 'Daily Finishing Output', path: '/daily-finishing-output', icon: TrendingUp },
  { label: 'Dispatch', path: '/dispatch', icon: Truck },
  { label: 'Inward', path: '/inward', icon: ArrowDownLeft },
  { label: 'Requisition Slip', path: '/requisition-slip', icon: ClipboardList },
  { label: 'Enquiry Register', path: '/enquiry-register', icon: BookOpen },
  { label: 'Internal Complain Register', path: '/internal-complain-register', icon: AlertTriangle },
  { label: 'Process Control Standard', path: '/process-control-standard', icon: Sliders },
  { label: 'Lot Details Register', path: '/lot-details-register', icon: Barcode },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, currentOrg, organizations, selectOrganization, logout, staffOrgAccessMap } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  const handleSwitchOrg = (org) => {
    selectOrganization(org);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleManageOrgs = () => {
    selectOrganization(null); // Clear current org → redirects to OrgSelectPage
    setDropdownOpen(false);
  };

  const allowedPages = (!isAdmin && currentOrg && staffOrgAccessMap) ? staffOrgAccessMap[currentOrg.id] : null;

  return (
    <aside className="fixed top-0 left-0 h-screen w-[230px] z-30 flex flex-col bg-white border-r border-slate-200">

      {/* Org Switcher Header (Admin or Staff with multiple orgs) */}
      <div className="relative border-b border-slate-200">
        {isAdmin || organizations.length > 1 ? (
          /* Clickable org switcher */
          <div className="flex items-center h-16 px-4 justify-between gap-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-left truncate hover:bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 transition-all flex-1 min-w-0 group cursor-pointer"
              id="org-selector-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-800 truncate leading-tight uppercase">
                  {currentOrg?.name || 'Select Organisation'}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-0.5">
                  {currentOrg?.industry || 'No workspace'}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        ) : (
          /* Staff with 1 org: read-only brand header showing current org */
          <div className="flex items-center h-16 px-4 gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                {currentOrg?.name || 'Loading Workspace...'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-0.5">
                {currentOrg?.industry || 'No workspace'}
              </p>
            </div>
          </div>
        )}

        {/* Org Switcher Dropdown */}
        {(isAdmin || organizations.length > 1) && dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1.5 left-4 right-4 bg-white border border-slate-200 rounded-xl z-50 py-1.5"
          >
            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
              Organisations
            </div>
            <div className="max-h-52 overflow-y-auto custom-scrollbar">
              {organizations.length === 0 && (
                <div className="px-3 py-3 text-[12px] text-slate-400 text-center">
                  No organisations yet
                </div>
              )}
              {organizations.map((org) => {
                const isSelected = org.id === currentOrg?.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => handleSwitchOrg(org)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold truncate leading-tight ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{org.industry} · {org.size} emp</p>
                    </div>
                    {isSelected && <Check size={14} className="text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-slate-100 my-1.5" />
            <button
              onClick={handleManageOrgs}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer group"
              id="manage-orgs-btn"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                {isAdmin ? <Plus size={14} /> : <Building2 size={14} />}
              </div>
              <span className="text-[12px] font-bold">{isAdmin ? 'Manage / Create Workspace' : 'Switch Workspace'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className="flex flex-col gap-1.5">
          {navItems.filter(item => isAdmin || !allowedPages || allowedPages.includes(item.path)).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${isActive ? 'sidebar-active-item' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                {Icon && <Icon size={16} className="shrink-0 transition-colors" />}
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

    </aside>
  );
}
