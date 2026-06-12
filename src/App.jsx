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
  return (
    <div className="min-h-screen bg-slate-50" style={{ background: '#f8fafc' }}>
      <Sidebar />
      <Topbar />
      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: '220px', minHeight: '100vh', paddingTop: '56px' }}
      >
        <div className="px-1">
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<PurchaseOrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/item-master" element={<ItemMasterPage />} />
            <Route path="/inward" element={<InwardPage />} />
            <Route path="/mixing-molding-plan" element={<MixingMoldingPlanPage />} />
            <Route path="/daily-finishing-output" element={<DailyFinishingOutputReportPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/requisition-slip" element={<RequisitionSlipPage />} />
            <Route path="/enquiry-register" element={<EnquiryRegisterPage />} />
            <Route path="/internal-complain-register" element={<InternalComplainRegisterPage />} />
            <Route path="/process-control-standard" element={<ProcessControlStandardPage />} />
            <Route path="/lot-details-register" element={<LotDetailsRegisterPage />} />
            <Route path="/weekly-moulding-plan" element={<WeeklyMouldingPlanPage />} />
            <Route path="/work-order-sheet" element={<WorkOrderSheetPage />} />
            <Route path="/work-order-details" element={<WorkOrderDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────
function AppLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f1117',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid #10b981', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
        }} />
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Rubbertics…</div>
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
