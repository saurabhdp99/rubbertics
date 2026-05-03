import React from 'react';
import PageHeader from '../components/common/PageHeader';
import StatsBar from '../components/StatsBar';
import OrdersTable from '../components/OrdersTable';
import OrderModal from '../components/OrderModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ShoppingCart } from 'lucide-react';

export default function PurchaseOrdersPage() {
  return (
    <div className="p-6 max-w-[1920px] mx-auto animate-slide-up">
      {/* Page Header */}
      <PageHeader
        icon={ShoppingCart}
        title="Purchase Orders"
        description="Manage and track all enterprise orders efficiently"
        showLiveSync={true}
        theme="emerald"
      />

      {/* Stats */}
      <StatsBar />

      {/* Main Table */}
      <OrdersTable />

      {/* Modals */}
      <OrderModal />
      <DeleteConfirmModal />
    </div>
  );
}
