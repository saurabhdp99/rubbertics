import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, ChevronDown, ChevronRight, Check, Plus, Search, X,
  ShoppingBag, ShoppingCart, Package, Boxes,
  TrendingUp, Truck, ArrowDownLeft,
  ClipboardList, BookOpen, AlertTriangle, Sliders, Barcode,
  ContactRound, Settings, Users, Wrench, Beaker, Factory,
  Layers, ShieldCheck, ChevronsUpDown
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';

// ─── ERP Hierarchical Navigation Structure ────────────────────────────────────
export const erpNavSections = [
  {
    id: 'sales',
    title: 'Sales & CRM',
    icon: ShoppingBag,
    color: 'emerald',
    items: [
      { label: 'Sale Orders', path: '/orders', icon: ShoppingBag },
      { label: 'Enquiry Register', path: '/enquiry-register', icon: BookOpen },
      { label: 'Dispatch', path: '/dispatch', icon: Truck },
    ]
  },
  {
    id: 'purchase',
    title: 'Purchase & SCM',
    icon: ShoppingCart,
    color: 'blue',
    items: [
      { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
      { label: 'Inward (GRN)', path: '/inward', icon: ArrowDownLeft },
      { label: 'Requisition Slip', path: '/requisition-slip', icon: ClipboardList },
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory & Stock',
    icon: Boxes,
    color: 'amber',
    items: [
      { label: 'Stock Inventory', path: '/inventory', icon: Boxes },
      { label: 'Lot Details Register', path: '/lot-details-register', icon: Barcode },
    ]
  },
  {
    id: 'production',
    title: 'Production',
    icon: Factory,
    color: 'purple',
    items: [
      { label: 'Bill of Materials (BOM)', path: '/bill-of-materials', icon: Layers },
      { label: 'Work Orders', path: '/work-order', icon: ClipboardList },
      { label: 'Mixing Production', path: '/mixing-production', icon: Factory },
      { label: 'Moulding Production', path: '/moulding-production', icon: Factory },
      { label: 'Daily Finishing Output', path: '/daily-finishing-output', icon: TrendingUp },
    ]
  },
  {
    id: 'quality',
    title: 'Quality & Standards',
    icon: Sliders,
    color: 'teal',
    items: [
      { label: 'Process Control Standard', path: '/process-control-standard', icon: Sliders },
      { label: 'Internal Complain Register', path: '/internal-complain-register', icon: AlertTriangle },
    ]
  },
  {
    id: 'masters',
    title: 'Master Data',
    icon: Layers,
    color: 'indigo',
    items: [
      { label: 'Item Master', path: '/item-master', icon: Package },
      { label: 'Compound Master', path: '/compound-master', icon: Beaker },
      { label: 'Machine Master', path: '/machine-master', icon: Settings },
      { label: 'Tools Master', path: '/tools-master', icon: Wrench },
      { label: 'Party Master', path: '/party-master', icon: ContactRound },
      { label: 'Transport Master', path: '/transport-master', icon: Truck },
      { label: 'Employee Master', path: '/employee-master', icon: Users },
      { label: 'HSN/SAC Master', path: '/hsn-sac-master', icon: Barcode },
    ]
  }
];

// Flat export for backwards compatibility with SettingsPage and permission mapping
export const navItems = erpNavSections.flatMap(section => section.items);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentOrg, organizations, selectOrganization, staffOrgAccessMap } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Determine allowed pages for staff
  const allowedPages = (!isAdmin && currentOrg && staffOrgAccessMap) ? staffOrgAccessMap[currentOrg.id] : null;
  const isPathAllowed = (path) => isAdmin || !allowedPages || allowedPages.includes(path);

  // Map to identify which section contains which path
  const pathToSectionMap = useMemo(() => {
    const map = {};
    erpNavSections.forEach(section => {
      section.items.forEach(item => {
        map[item.path] = section.id;
      });
    });
    return map;
  }, []);

  // State of open sections (accordions)
  const [openSections, setOpenSections] = useState(() => {
    // Initially open the section matching the current URL
    const activeSection = pathToSectionMap[location.pathname] || 'sales';
    return { [activeSection]: true };
  });

  // Automatically expand parent section on route change
  useEffect(() => {
    const activeSection = pathToSectionMap[location.pathname];
    if (activeSection) {
      setOpenSections(prev => ({ ...prev, [activeSection]: true }));
    }
  }, [location.pathname, pathToSectionMap]);

  // When searching, auto-expand sections that have matching items
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    const newOpen = {};
    erpNavSections.forEach(section => {
      const hasMatch = section.items.some(
        item => isPathAllowed(item.path) && item.label.toLowerCase().includes(query)
      );
      if (hasMatch) {
        newOpen[section.id] = true;
      }
    });
    setOpenSections(prev => ({ ...prev, ...newOpen }));
  }, [searchQuery]);

  // Close org dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleExpandAll = () => {
    const all = {};
    erpNavSections.forEach(s => { all[s.id] = true; });
    setOpenSections(all);
  };

  const handleCollapseAll = () => {
    // Keep only the active one open
    const active = pathToSectionMap[location.pathname];
    setOpenSections(active ? { [active]: true } : {});
  };

  const handleSwitchOrg = (org) => {
    selectOrganization(org);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleManageOrgs = () => {
    selectOrganization(null);
    setDropdownOpen(false);
  };

  // Filter sections and their items based on permissions and search query
  const query = searchQuery.toLowerCase().trim();
  const filteredSections = erpNavSections.map(section => {
    const visibleItems = section.items.filter(item => {
      if (!isPathAllowed(item.path)) return false;
      if (!query) return true;
      return item.label.toLowerCase().includes(query);
    });

    const isCurrentActive = section.items.some(item => item.path === location.pathname);

    return {
      ...section,
      visibleItems,
      isCurrentActive,
      hasVisibleItems: visibleItems.length > 0
    };
  }).filter(section => section.hasVisibleItems);

  return (
    <aside className="fixed top-0 left-0 h-screen w-[250px] z-30 flex flex-col bg-white border-r border-slate-200 select-none">

      {/* ─── Org Switcher Header ────────────────────────────────────────── */}
      <div className="relative border-b border-slate-200">
        {isAdmin || organizations.length > 1 ? (
          <div className="flex items-center h-16 px-3.5 justify-between gap-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 text-left truncate hover:bg-slate-50 p-1.5 rounded-xl border border-slate-200/80 transition-all flex-1 min-w-0 group cursor-pointer shadow-xs"
              id="org-selector-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/80">
                <Building2 size={16} className="text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-800 truncate leading-tight uppercase tracking-tight">
                  {currentOrg?.name || 'Select Organisation'}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-0.5">
                  {currentOrg?.industry || 'Workspace'}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        ) : (
          <div className="flex items-center h-16 px-4 gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Building2 size={16} className="text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                {currentOrg?.name || 'Rubbertics Workspace'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-0.5">
                {currentOrg?.industry || 'ERP Module'}
              </p>
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {(isAdmin || organizations.length > 1) && dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1.5 left-3 right-3 bg-white border border-slate-200 rounded-xl z-50 py-1.5 shadow-xl"
          >
            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
              Workspaces
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/50' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold truncate leading-tight ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{org.industry} · {org.size || 'Plant'}</p>
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

      {/* ─── Search & Navigation Header ───────────────────────────────── */}
      <div className="px-3 pt-3 pb-1">
        {/* Quick Search */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menus..."
            className="w-full pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-lg text-[12px] text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Section Actions / Header Controls */}
        <div className="flex items-center justify-between mt-2.5 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {searchQuery ? 'Search Results' : 'ERP Modules'}
          </span>
          {!searchQuery && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <button
                onClick={handleExpandAll}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
                title="Expand all tabs"
              >
                Expand
              </button>
              <span>·</span>
              <button
                onClick={handleCollapseAll}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
                title="Collapse all tabs"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Tabs & Sub-Tabs Navigation ──────────────────────────── */}
      <nav className="flex-1 px-2.5 py-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {filteredSections.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-[12px]">
            No menus match &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredSections.map((section) => {
              const isOpen = !!openSections[section.id];
              const Icon = section.icon;
              const hasActiveChild = section.isCurrentActive;

              return (
                <div key={section.id} className="rounded-xl transition-colors">
                  {/* Main Tab (Module Header) */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`
                      w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left
                      transition-all duration-150 cursor-pointer group
                      ${hasActiveChild
                        ? 'bg-slate-100/80 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`
                        w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors
                        ${hasActiveChild
                          ? 'bg-emerald-100/80 text-emerald-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                        }
                      `}>
                        <Icon size={14} />
                      </div>
                      <span className="text-[13px] truncate">{section.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Active indicator dot */}
                      {hasActiveChild && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {/* Item count badge */}
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors
                        ${hasActiveChild ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                      `}>
                        {section.visibleItems.length}
                      </span>
                      {/* Chevron */}
                      <ChevronDown
                        size={13}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-600' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Sub-Tabs (Children) */}
                  {isOpen && (
                    <div className="relative ml-4 pl-2.5 my-1 border-l-2 border-slate-100 flex flex-col gap-0.5 animate-fadeIn">
                      {section.visibleItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            title={item.label}
                            className={({ isActive }) => `
                              relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px]
                              transition-all duration-150 group
                              ${isActive
                                ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                              }
                            `}
                          >
                            {({ isActive }) => (
                              <>
                                <ItemIcon
                                  size={14}
                                  className={`shrink-0 transition-colors ${
                                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                                  }`}
                                />
                                <span className="truncate flex-1">{item.label}</span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                )}
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* ─── Bottom Footer Info ────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700 truncate">
              {currentOrg?.name ? currentOrg.name : 'Rubbertics'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">v2.4</span>
        </div>
      </div>

    </aside>
  );
}
