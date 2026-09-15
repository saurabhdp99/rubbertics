import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, ChevronDown, ChevronLeft, ChevronRight, Check, Plus,
  ShoppingBag, ShoppingCart, Package, Boxes,
  TrendingUp, Truck, ArrowDownLeft,
  ClipboardList, BookOpen, AlertTriangle, Sliders, Barcode,
  ContactRound, Settings, Users, Wrench, Beaker, Factory,
  Layers
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useSidebarStore } from '../store/sidebarStore';

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

const SECTION_COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-100/80',
    activeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    railActive: 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs shadow-emerald-500/10',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100/90 text-emerald-800',
  },
  blue: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80 group-hover:bg-blue-100/80',
    activeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    railActive: 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs shadow-blue-500/10',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100/90 text-blue-800',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80 group-hover:bg-amber-100/80',
    activeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    railActive: 'bg-amber-50 text-amber-700 border-amber-500 shadow-xs shadow-amber-500/10',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100/90 text-amber-800',
  },
  purple: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200/80 group-hover:bg-purple-100/80',
    activeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    railActive: 'bg-purple-50 text-purple-700 border-purple-500 shadow-xs shadow-purple-500/10',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100/90 text-purple-800',
  },
  teal: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200/80 group-hover:bg-teal-100/80',
    activeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    railActive: 'bg-teal-50 text-teal-700 border-teal-500 shadow-xs shadow-teal-500/10',
    dot: 'bg-teal-500',
    badge: 'bg-teal-100/90 text-teal-800',
  },
  indigo: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 group-hover:bg-indigo-100/80',
    activeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    railActive: 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-xs shadow-indigo-500/10',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100/90 text-indigo-800',
  }
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentOrg, organizations, selectOrganization, staffOrgAccessMap } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const isAdmin = currentUser?.role === 'admin';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Collapsed Mode Floating Elements (using fixed viewport coordinates to prevent CSS overflow clipping)
  const [hoveredTooltip, setHoveredTooltip] = useState(null); // { title, count, top }
  const [activeFlyout, setActiveFlyout] = useState(null);     // { sectionId, section, top }

  const dropdownRef = useRef(null);
  const flyoutRef = useRef(null);

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

  // State of open sections (accordions) in expanded mode
  const [openSections, setOpenSections] = useState(() => {
    const activeSection = pathToSectionMap[location.pathname] || 'sales';
    return { [activeSection]: true };
  });

  // Automatically expand parent section on route change and dismiss flyouts/tooltips
  useEffect(() => {
    const activeSection = pathToSectionMap[location.pathname];
    if (activeSection) {
      setOpenSections(prev => ({ ...prev, [activeSection]: true }));
    }
    setActiveFlyout(null);
    setHoveredTooltip(null);
  }, [location.pathname, pathToSectionMap]);

  // Dismiss flyout and tooltips when sidebar state changes
  useEffect(() => {
    setActiveFlyout(null);
    setHoveredTooltip(null);
  }, [isCollapsed]);

  // Global Keyboard Shortcuts:
  // - 'Ctrl+B' or 'Cmd+B': Toggle single sidebar
  // - 'Escape': Close flyout
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle sidebar shortcut (Ctrl+B or Cmd+B)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (e.key === 'Escape') {
        if (activeFlyout) {
          setActiveFlyout(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, activeFlyout]);

  // Outside click handler for workspace dropdown and collapsed flyout
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (activeFlyout) {
        const isClickInsideFlyout = flyoutRef.current && flyoutRef.current.contains(e.target);
        const isClickOnModuleBtn = e.target.closest('[data-module-btn]');
        if (!isClickInsideFlyout && !isClickOnModuleBtn) {
          setActiveFlyout(null);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen, activeFlyout]);

  // Dismiss tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (hoveredTooltip) setHoveredTooltip(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [hoveredTooltip]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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

  // Filter sections and their items based on permissions
  const filteredSections = erpNavSections.map(section => {
    const visibleItems = section.items.filter(item => isPathAllowed(item.path));
    const isCurrentActive = section.items.some(item => item.path === location.pathname);

    return {
      ...section,
      visibleItems,
      isCurrentActive,
      hasVisibleItems: visibleItems.length > 0
    };
  }).filter(section => section.hasVisibleItems);

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen z-30 flex flex-col bg-white border-r border-slate-200 select-none
          transition-[width] duration-250 ease-in-out
          ${isCollapsed ? 'w-[76px]' : 'w-[272px]'}
        `}
        aria-label="Sidebar Navigation"
      >
        {/* ─── EXACTLY ONE UNIFIED TOGGLE (Modern Dock Tab on Border) ──────── */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-emerald-700 hover:border-emerald-400 hover:shadow-lg flex items-center justify-center cursor-pointer z-40 transition-all duration-150 hover:scale-110 group"
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* ─── Org Switcher & Brand Header ───────────────────────────────── */}
        <div className="relative border-b border-slate-200/90 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center h-16 px-3.5 justify-between gap-2">
              {isAdmin || organizations.length > 1 ? (
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 text-left truncate hover:bg-slate-50 p-2 rounded-xl border border-slate-200/80 transition-all flex-1 min-w-0 group cursor-pointer shadow-xs hover:border-emerald-300"
                  id="org-selector-btn"
                  title="Switch Workspace / Organisation"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Building2 size={18} className="text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-slate-800 truncate leading-tight tracking-tight">
                      {currentOrg?.name || 'Select Organisation'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-1">
                      {currentOrg?.industry || 'Workspace'}
                    </p>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-600'}`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-3 p-1.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                    <Building2 size={18} className="text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-slate-800 truncate leading-tight">
                      {currentOrg?.name || 'Rubbertics Workspace'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider truncate leading-none mt-1">
                      {currentOrg?.industry || 'ERP Module'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed Header Logo View */
            <div className="flex flex-col items-center justify-center h-16 px-2">
              <button
                onClick={() => {
                  if (isAdmin || organizations.length > 1) {
                    setDropdownOpen(!dropdownOpen);
                  }
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredTooltip({
                    title: currentOrg?.name || 'Rubbertics ERP',
                    count: currentOrg?.industry || 'Plant',
                    top: rect.top + rect.height / 2
                  });
                }}
                onMouseLeave={() => setHoveredTooltip(null)}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs hover:scale-105 transition-all cursor-pointer group"
                aria-label={currentOrg?.name || 'Rubbertics ERP'}
              >
                <Building2 size={20} className="text-emerald-700 group-hover:text-emerald-800" />
              </button>
            </div>
          )}

          {/* Dropdown Menu for Workspaces */}
          {(isAdmin || organizations.length > 1) && dropdownOpen && (
            <div
              ref={dropdownRef}
              className={`
                absolute top-full mt-1.5 bg-white border border-slate-200 rounded-2xl z-50 py-2 shadow-2xl animate-fadeIn
                ${isCollapsed ? 'left-3 w-64' : 'left-3.5 right-3.5'}
              `}
            >
              <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                Workspaces & Plants
              </div>
              <div className="max-h-56 overflow-y-auto custom-scrollbar">
                {organizations.length === 0 && (
                  <div className="px-3 py-3 text-[13px] text-slate-400 text-center">
                    No organisations yet
                  </div>
                )}
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSwitchOrg(org)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/70' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold truncate leading-tight ${isSelected ? 'text-emerald-800 font-bold' : 'text-slate-800'}`}>
                          {org.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{org.industry} · {org.size || 'Plant'}</p>
                      </div>
                      {isSelected && <Check size={16} className="text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="h-px bg-slate-100 my-1.5" />
              <button
                onClick={handleManageOrgs}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer group"
                id="manage-orgs-btn"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  {isAdmin ? <Plus size={16} /> : <Building2 size={16} />}
                </div>
                <span className="text-[13px] font-bold">{isAdmin ? 'Manage / Add Workspace' : 'Switch Workspace'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── Main Tabs & Sub-Tabs Navigation ──────────────────────────── */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2 py-3 overflow-x-visible' : 'px-3 pt-3 pb-2 overflow-x-hidden'}`}>
          {filteredSections.length === 0 ? (
            <div className="py-10 text-center px-4 text-slate-400 text-[13px]">
              No accessible modules available
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredSections.map((section) => {
                const isOpen = !!openSections[section.id];
                const Icon = section.icon;
                const hasActiveChild = section.isCurrentActive;
                const colorStyle = SECTION_COLOR_MAP[section.color] || SECTION_COLOR_MAP.emerald;
                const isFlyoutOpen = activeFlyout?.sectionId === section.id;

                if (isCollapsed) {
                  // ─── COLLAPSED RAIL MODE ───
                  // Same icons for all modules
                  // Hover: Sleek Tooltip
                  // Click: Opens ONLY that module's sub-tabs in a floating card popover (does NOT open entire sidebar)
                  return (
                    <div key={section.id} className="relative flex justify-center py-1">
                      <button
                        type="button"
                        data-module-btn
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredTooltip(null);
                          if (activeFlyout?.sectionId === section.id) {
                            setActiveFlyout(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveFlyout({
                              sectionId: section.id,
                              section: section,
                              top: rect.top
                            });
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (activeFlyout?.sectionId === section.id) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredTooltip({
                            title: section.title,
                            count: section.visibleItems.length,
                            top: rect.top + rect.height / 2
                          });
                        }}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className={`
                          w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer relative group border
                          ${isFlyoutOpen
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                            : hasActiveChild
                              ? colorStyle.railActive
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent hover:border-slate-200'
                          }
                        `}
                        aria-label={section.title}
                      >
                        <Icon size={20} className={isFlyoutOpen ? 'text-white' : hasActiveChild ? '' : 'text-slate-600 group-hover:text-slate-900'} />
                        {hasActiveChild && !isFlyoutOpen && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500" />
                        )}
                      </button>
                    </div>
                  );
                }

                // ─── EXPANDED FULL ACCORDION VIEW ───
                return (
                  <div key={section.id} className="rounded-xl transition-colors">
                    {/* Module Header / Accordion Button */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left
                        transition-all duration-150 cursor-pointer group
                        ${hasActiveChild
                          ? 'bg-slate-100/90 text-slate-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-150
                          ${hasActiveChild ? colorStyle.activeBg : colorStyle.bg}
                        `}>
                          <Icon size={17} />
                        </div>
                        <span className="text-[14px] font-semibold tracking-tight truncate leading-snug">
                          {section.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`
                          text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors
                          ${hasActiveChild
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700'}
                        `}>
                          {section.visibleItems.length}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : 'group-hover:text-slate-600'}`}
                        />
                      </div>
                    </button>

                    {/* Sub-Tabs Navigation Links */}
                    {isOpen && (
                      <div className="relative ml-5 pl-3 my-1 border-l-2 border-slate-100 flex flex-col gap-1 animate-fadeIn">
                        {section.visibleItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              end
                              title={item.label}
                              className={({ isActive }) => `
                                relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium
                                transition-all duration-150 group
                                ${isActive
                                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs border-l-3 border-emerald-600 -ml-[14px] pl-[11px]'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5'
                                }
                              `}
                            >
                              {({ isActive }) => (
                                <>
                                  <ItemIcon
                                    size={16}
                                    className={`shrink-0 transition-colors ${
                                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                                    }`}
                                  />
                                  <span className="truncate flex-1 leading-snug">{item.label}</span>
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


      </aside>

      {/* ─── FIXED FLOATING TOOLTIP (Immune to CSS overflow clipping) ─────── */}
      {isCollapsed && hoveredTooltip && !activeFlyout && (
        <div
          className="fixed z-[100] pointer-events-none flex items-center animate-fadeIn"
          style={{
            left: '84px',
            top: `${hoveredTooltip.top}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mr-1.5 z-10 border-l border-b border-slate-700/60 shadow-xs" />
          <div className="bg-slate-900 text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
            <span>{hoveredTooltip.title}</span>
            <span className="text-[10.5px] px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-semibold border border-slate-700/50">
              {hoveredTooltip.count}
            </span>
          </div>
        </div>
      )}

      {/* ─── FIXED FLOATING FLYOUT SUB-TABS (Opens ONLY on Click) ────────── */}
      {isCollapsed && activeFlyout && (
        <div
          ref={flyoutRef}
          data-flyout-panel
          className="fixed z-[100] w-[250px] bg-white border border-slate-200/95 rounded-2xl p-2.5 shadow-2xl animate-fadeIn ring-1 ring-slate-950/10"
          style={{
            left: '84px',
            top: `${Math.max(16, Math.min(activeFlyout.top, window.innerHeight - 390))}px`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100 px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${SECTION_COLOR_MAP[activeFlyout.section.color]?.bg || SECTION_COLOR_MAP.emerald.bg}`}>
                {(() => {
                  const FlyoutIcon = activeFlyout.section.icon;
                  return <FlyoutIcon size={15} />;
                })()}
              </div>
              <span className="text-[13.5px] font-bold text-slate-800 truncate">
                {activeFlyout.section.title}
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SECTION_COLOR_MAP[activeFlyout.section.color]?.badge || SECTION_COLOR_MAP.emerald.badge}`}>
              {activeFlyout.section.visibleItems.length}
            </span>
          </div>

          {/* Sub-Tabs Links (Clicking navigates & closes flyout, keeping sidebar collapsed) */}
          <div className="flex flex-col gap-1 max-h-[340px] overflow-y-auto custom-scrollbar">
            {activeFlyout.section.visibleItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setActiveFlyout(null)}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs border-l-3 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5'
                    }
                  `}
                >
                  <ItemIcon size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="truncate flex-1 leading-snug">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
