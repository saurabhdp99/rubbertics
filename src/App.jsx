import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import InventoryPage from './pages/InventoryPage';
import ItemMasterPage from './pages/ItemMasterPage';
import InwardPage from './pages/InwardPage';
import MixingMoldingPlanPage from './pages/MixingMoldingPlanPage';
import DailyFinishingOutputReportPage from './pages/DailyFinishingOutputReportPage';
import DispatchPage from './pages/DispatchPage';
import RequisitionSlipPage from './pages/RequisitionSlipPage';
import EnquiryRegisterPage from './pages/EnquiryRegisterPage';
import InternalComplainRegisterPage from './pages/InternalComplainRegisterPage';
import ProcessControlStandardPage from './pages/ProcessControlStandardPage';
import LotDetailsRegisterPage from './pages/LotDetailsRegisterPage';
import WeeklyMouldingPlanPage from './pages/WeeklyMouldingPlanPage';
import WorkOrderSheetPage from './pages/WorkOrderSheetPage';
import WorkOrderDetailsPage from './pages/WorkOrderDetailsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OrgSelectPage from './pages/OrgSelectPage';
import { useAuthStore } from './store/authStore';

// ─── ERP Shell (authenticated, org selected) ────────────────────────────────
function ERPApp() {
  const { currentUser, currentOrg, staffOrgAccessMap } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const allowedPages = (!isAdmin && currentOrg && staffOrgAccessMap) ? staffOrgAccessMap[currentOrg.id] : null;

  const canAccess = (path) => isAdmin || !allowedPages || allowedPages.includes(path);
  const defaultPath = allowedPages && allowedPages.length > 0 ? allowedPages[0] : '/orders';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main
        className="transition-all duration-300 ease-in-out ml-[230px] min-h-screen pt-16"
      >
        <div className="px-1">
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            {canAccess('/orders') && <Route path="/orders" element={<PurchaseOrdersPage />} />}
            {canAccess('/inventory') && <Route path="/inventory" element={<InventoryPage />} />}
            {canAccess('/item-master') && <Route path="/item-master" element={<ItemMasterPage />} />}
            {canAccess('/inward') && <Route path="/inward" element={<InwardPage />} />}
            {canAccess('/mixing-molding-plan') && <Route path="/mixing-molding-plan" element={<MixingMoldingPlanPage />} />}
            {canAccess('/daily-finishing-output') && <Route path="/daily-finishing-output" element={<DailyFinishingOutputReportPage />} />}
            {canAccess('/dispatch') && <Route path="/dispatch" element={<DispatchPage />} />}
            {canAccess('/requisition-slip') && <Route path="/requisition-slip" element={<RequisitionSlipPage />} />}
            {canAccess('/enquiry-register') && <Route path="/enquiry-register" element={<EnquiryRegisterPage />} />}
            {canAccess('/internal-complain-register') && <Route path="/internal-complain-register" element={<InternalComplainRegisterPage />} />}
            {canAccess('/process-control-standard') && <Route path="/process-control-standard" element={<ProcessControlStandardPage />} />}
            {canAccess('/lot-details-register') && <Route path="/lot-details-register" element={<LotDetailsRegisterPage />} />}
            {canAccess('/weekly-moulding-plan') && <Route path="/weekly-moulding-plan" element={<WeeklyMouldingPlanPage />} />}
            {canAccess('/work-order-sheet') && <Route path="/work-order-sheet" element={<WorkOrderSheetPage />} />}
            {canAccess('/work-order-details') && <Route path="/work-order-details" element={<WorkOrderDetailsPage />} />}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
        <div className="text-slate-400 text-[0.9rem]">Loading Rubbertics…</div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isInitialized, currentUser, currentOrg, initialize } = useAuthStore();

  useEffect(() => { initialize(); }, []);

  if (!isInitialized) return <AppLoader />;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <Router>
      <Routes>
        {/* Always-public routes */}
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />
        } />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Org select — admin only, no org selected */}
        <Route path="/select-org" element={
          !isAuthenticated
            ? <Navigate to="/" replace />
            : isAdmin
              ? <OrgSelectPage />
              : <Navigate to="/" replace />
        } />

        {/* Settings — authenticated, no org needed, but usually accessed with org or as admin */}
        <Route path="/settings" element={
          !isAuthenticated
            ? <Navigate to="/" replace />
            : <div className="min-h-screen bg-slate-50"><SettingsPage /></div>
        } />

        {/* All other routes */}
        <Route path="/*" element={
          !isAuthenticated
            ? <LoginPage />
            : isAdmin && !currentOrg
              ? <OrgSelectPage />          // Admin must pick an org first
              : <ERPApp />                 // Staff OR admin with org → ERP
        } />
      </Routes>
    </Router>
  );
}
