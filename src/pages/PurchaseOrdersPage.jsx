import React from 'react';
import StatsBar from '../components/StatsBar';
import OrdersTable from '../components/OrdersTable';
import OrderModal from '../components/OrderModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function PurchaseOrdersPage() {
  return (
    <div className="p-3 max-w-[1920px] mx-auto animate-slide-up">

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
