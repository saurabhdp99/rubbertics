import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import InventoryPage from './pages/InventoryPage';
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

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50" style={{ background: '#f8fafc' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />

        {/* Main content */}
        <main
          className="transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarCollapsed ? '80px' : '220px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'px-0' : 'px-1'}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/orders" replace />} />
              <Route path="/orders" element={<PurchaseOrdersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
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
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/orders" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
