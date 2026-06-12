import React, { useState } from 'react';
import {
  FileDown,
  Calendar,
  Building2,
  PackageSearch,
  Hash,
  Truck,
  CheckCircle2,
  UserCheck,
  FileText,
  User
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';

const DUMMY_GRN_DATA = [
  { id: 1, date: '03-03-2026', grnNo: 'GRN-66', partyName: 'JAYAM INDUSTRIES', description: 'VULKACIT CZ/C (CBS)', quantity: 20, uom: 'KG', invoiceDate: '27-02-2026', invoiceNo: '7656/25-26', transporter: 'GOA EXPRESS', tcReceived: 'YES', qtyVerifiedBy: 'ASHOK', poNo: 'MO/KM01075/25-26', receivedBy: 'ASHOK' },
  { id: 2, date: '03-03-2026', grnNo: 'GRN-66', partyName: 'JAYAM INDUSTRIES', description: 'VULKANOX HS/LG(TQ)', quantity: 25, uom: 'KG', invoiceDate: '27-02-2026', invoiceNo: '7656/25-26', transporter: 'GOA EXPRESS', tcReceived: 'YES', qtyVerifiedBy: 'ASHOK', poNo: 'MO/KM01075/25-26', receivedBy: 'ASHOK' },
  { id: 3, date: '03-03-2026', grnNo: 'GRN-66', partyName: 'JAYAM INDUSTRIES', description: 'CALCIUM CARBONATE', quantity: 1000, uom: 'KG', invoiceDate: '27-02-2026', invoiceNo: '7656/25-26', transporter: 'GOA EXPRESS', tcReceived: 'YES', qtyVerifiedBy: 'ASHOK', poNo: 'MO/KM01075/25-26', receivedBy: 'ASHOK' },
  { id: 4, date: '03-03-2026', grnNo: 'GRN-66', partyName: 'JAYAM INDUSTRIES', description: 'CHINA CLAY POWDER', quantity: 1000, uom: 'KG', invoiceDate: '27-02-2026', invoiceNo: '7656/25-26', transporter: 'GOA EXPRESS', tcReceived: 'YES', qtyVerifiedBy: 'ASHOK', poNo: 'MO/KM01075/25-26', receivedBy: 'ASHOK' },
];

export default function InwardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalQuantity = DUMMY_GRN_DATA.reduce((sum, row) => sum + row.quantity, 0);

  const columns = [
    { header: 'Date', accessor: 'date', icon: Calendar, width: 'w-[110px]', render: (value) => (
      <span className="font-mono text-[12px] text-slate-500">{value}</span>
    )},
    { header: 'GRN NO', accessor: 'grnNo', icon: Hash, width: 'w-[110px]', render: (value) => (
      <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span>
    )},
    { header: 'Party Name', accessor: 'partyName', icon: Building2, width: 'w-[200px]', render: (value) => (
      <span className="font-bold text-slate-800">{value}</span>
    )},
    { header: 'Description of Goods', accessor: 'description', icon: PackageSearch, width: 'w-[220px]', render: (value) => (
      <span className="font-semibold text-slate-700 uppercase tracking-tight">{value}</span>
    )},
    { header: 'Quantity', accessor: 'quantity', width: 'w-[120px]', align: 'right', render: (value) => (
      <span className="font-extrabold text-indigo-600">{value}</span>
    )},
    { header: 'UOM', accessor: 'uom', width: 'w-[80px]', align: 'center', render: (value) => (
      <span className="text-slate-500 font-bold text-[11px]">{value}</span>
    )},
    { header: 'Inv Date', accessor: 'invoiceDate', icon: Calendar, width: 'w-[120px]', render: (value) => (
      <span className="font-mono text-[12px] text-slate-500">{value}</span>
    )},
    { header: 'Invoice No', accessor: 'invoiceNo', icon: FileText, width: 'w-[120px]', render: (value) => (
      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">{value}</span>
    )},
    { header: 'Transporter/LR', accessor: 'transporter', icon: Truck, width: 'w-[180px]', render: (value) => (
      <span className="font-medium text-slate-600">{value}</span>
    )},
    { header: 'T.C Recv', accessor: 'tcReceived', width: 'w-[100px]', align: 'center', render: (value) => (
      value === 'YES' ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={14} />
        </span>
      ) : (
        <span className="text-slate-400 font-bold text-xs">NO</span>
      )
    )},
    { header: 'Qty Verified', accessor: 'qtyVerifiedBy', icon: UserCheck, width: 'w-[140px]', render: (value) => (
      <span className="font-medium text-slate-700">{value}</span>
    )},
    { header: 'PO.NO', accessor: 'poNo', width: 'w-[160px]', render: (value) => (
      <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">{value}</span>
    )},
    { header: 'Received By', accessor: 'receivedBy', icon: User, width: 'w-[140px]', render: (value) => (
      <span className="font-bold text-slate-700">{value}</span>
    )},
  ];

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up py-8 px-6">
      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total GRNs Today"
          value="1"
          icon={FileText}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label="Total Quantity Received"
          value={`${totalQuantity} KG`}
          icon={PackageSearch}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label="Pending Verifications"
          value="0"
          icon={CheckCircle2}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label="Active Transporters"
          value="1"
          icon={Truck}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.12)"
          border="rgba(139,92,246,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by GRN No, Party Name, Material..."
          theme="indigo"
          showFilter={true}
          addButtonText="New GRN"
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={DUMMY_GRN_DATA}
          minWidth="1800px"
        />
        <TableFooter
          totalEntries={DUMMY_GRN_DATA.length}
        />
      </div>
    </div>
  );
}
