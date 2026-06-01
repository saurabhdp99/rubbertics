import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Factory,
  FileText,
  Layers,
  ClipboardCheck,
  ClipboardList,
  NotebookText,
  AlertCircle,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Purchase Orders', path: '/orders' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Layers, label: 'Mixing/Molding Plan', path: '/mixing-molding-plan' },
  { icon: Layers, label: 'Weekly Moulding Plan', path: '/weekly-moulding-plan' },
  { icon: FileText, label: 'Work Order Sheet', path: '/work-order-sheet' },
  { icon: FileText, label: 'Work Order Master', path: '/work-order-details' },
  { icon: ClipboardCheck, label: 'Daily Finishing Output', path: '/daily-finishing-output' },
  { icon: Truck, label: 'Dispatch', path: '/dispatch' },
  { icon: FileText, label: 'Inward', path: '/inward' },
  { icon: ClipboardList, label: 'Requisition Slip', path: '/requisition-slip' },
  { icon: NotebookText, label: 'Enquiry Register', path: '/enquiry-register' },
  { icon: AlertCircle, label: 'Internal Complain Register', path: '/internal-complain-register' },
  { icon: ClipboardList, label: 'Process Control Standard', path: '/process-control-standard' },
  { icon: ClipboardList, label: 'Lot Details Register', path: '/lot-details-register' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { currentOrg, currentUser, logout, selectOrganization } = useAuthStore();

  const handleSwitchOrg = () => {
    selectOrganization(null);
  };
  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-30 flex flex-col
        transition-all duration-300 ease-in-out bg-white
        ${collapsed ? 'w-20' : 'w-56'}
        border-r border-slate-200
      `}
    >
      {/* Logo Section */}
      <div className={`flex items-center h-20 px-6 border-b border-slate-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-600 shadow-lg shadow-emerald-500/20">
              <Factory size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900 tracking-tight leading-none">NISARG ERP</p>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-1">Enterprise</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-600 shadow-lg shadow-emerald-500/20">
            <Factory size={20} className="text-white" />
          </div>
        )}

        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-100"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {!collapsed && (
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Navigation</p>
        )}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center gap-3.5 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive
                    ? 'sidebar-active-item'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }
                  ${collapsed ? 'justify-center px-0' : 'px-4'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={`${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!collapsed && (
                      <span className="text-[14px] font-medium">{item.label}</span>
                    )}

                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 pt-0">
        {/* Org name chip */}
        {!collapsed && currentOrg && (
          <button
            onClick={handleSwitchOrg}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 mb-2 hover:bg-emerald-100 transition-all group"
            title="Switch organisation"
            id="switch-org-btn"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <Building2 size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-semibold text-emerald-700 truncate leading-tight">{currentOrg.name}</p>
              <p className="text-[10px] text-emerald-500 truncate">{currentUser?.name}</p>
            </div>
            <ChevronDown size={14} className="text-emerald-500 shrink-0 group-hover:text-emerald-700" />
          </button>
        )}

        <div className="flex flex-col gap-1">
          {collapsed && (
            <>
              <button
                onClick={handleSwitchOrg}
                className="flex items-center justify-center p-3 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all mb-1 border border-emerald-100"
                title="Switch organisation"
                id="switch-org-btn-collapsed"
              >
                <Building2 size={20} />
              </button>
              <button
                onClick={onToggle}
                className="flex items-center justify-center p-3 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all mb-2 border border-slate-100"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <button className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Settings size={20} />
            {!collapsed && <span className="text-[14px] font-medium">Settings</span>}
          </button>
          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-[14px] font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
