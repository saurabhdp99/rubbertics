import React, { useState } from 'react';
import {
  ClipboardCheck,
  Hash,
  Package,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';

const FINISHING_REPORT_DATA = [
  {
    id: 1,
    srNo: 1,
    itemName: 'Rubber Gasket Type A',
    finisherName: 'Ramesh',
    routeCardNo: 'RC-2026-001',
    routeCardDate: '01-05-2026',
    operatorName: 'Suresh',
    productionQty: 500,
    targetQtyIn1Hr: 600,
    acceptedQty: 480,
    rejectionQty: 15,
    shortQty: 5,
    startedTiming: '08:00 AM',
    completionTiming: '16:00 PM',
    qcCheckedBy: 'QC Manager A',
    packedBy: 'Pack Team 1',
    remarks: 'Normal output',
    date: '01-05-2026'
  },
  {
    id: 2,
    srNo: 2,
    itemName: 'Silicon O-Ring 50mm',
    finisherName: 'Mahesh',
    routeCardNo: 'RC-2026-002',
    routeCardDate: '01-05-2026',
    operatorName: 'Dinesh',
    productionQty: 350,
    targetQtyIn1Hr: 400,
    acceptedQty: 340,
    rejectionQty: 8,
    shortQty: 2,
    startedTiming: '09:00 AM',
    completionTiming: '17:00 PM',
    qcCheckedBy: 'QC Manager B',
    packedBy: 'Pack Team 2',
    remarks: 'Good quality',
    date: '01-05-2026'
  },
  {
    id: 3,
    srNo: 3,
    itemName: 'EPDM Seal Type C',
    finisherName: 'Ramesh',
    routeCardNo: 'RC-2026-003',
    routeCardDate: '02-05-2026',
    operatorName: 'Anil',
    productionQty: 200,
    targetQtyIn1Hr: 250,
    acceptedQty: 190,
    rejectionQty: 8,
    shortQty: 2,
    startedTiming: '08:30 AM',
    completionTiming: '15:30 PM',
    qcCheckedBy: 'QC Manager A',
    packedBy: 'Pack Team 1',
    remarks: 'Minor delay',
    date: '02-05-2026'
  },
];

export default function DailyFinishingOutputReportPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalEntries = FINISHING_REPORT_DATA.length;
  const totalProduction = FINISHING_REPORT_DATA.reduce((sum, d) => sum + d.productionQty, 0);
  const totalAccepted = FINISHING_REPORT_DATA.reduce((sum, d) => sum + d.acceptedQty, 0);
  const totalRejected = FINISHING_REPORT_DATA.reduce((sum, d) => sum + d.rejectionQty, 0);

  const columns = [
    { header: 'Sr No.', accessor: 'srNo', icon: Hash, width: 'w-[60px]', align: 'center' },
    {
      header: 'ITEM NAME', accessor: 'itemName', icon: Package, width: 'w-[200px]', render: (value) => (
        <span className="font-semibold text-slate-700">{value}</span>
      )
    },
    {
      header: 'FINISHER NAME', accessor: 'finisherName', icon: User, width: 'w-[140px]', render: (value) => (
        <span className="font-medium text-slate-700">{value}</span>
      )
    },
    {
      header: 'ROUTE CARD No.', accessor: 'routeCardNo', icon: Hash, width: 'w-[140px]', render: (value) => (
        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span>
      )
    },
    {
      header: 'FINISHING OR ROUTE CARD DATE', accessor: 'routeCardDate', icon: Calendar, width: 'w-[220px]', render: (value) => (
        <span className="font-mono text-[12px] text-slate-500">{value}</span>
      )
    },
    {
      header: 'OPERATOR NAME', accessor: 'operatorName', icon: User, width: 'w-[140px]', render: (value) => (
        <span className="font-medium text-slate-700">{value}</span>
      )
    },
    {
      header: 'PRODUCTION QTY', accessor: 'productionQty', icon: CheckCircle2, width: 'w-[150px]', align: 'right', render: (value) => (
        <span className="font-bold text-emerald-600">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'TARGET QTY IN 1 HRS.', accessor: 'targetQtyIn1Hr', width: 'w-[160px]', align: 'right', render: (value) => (
        <span className="font-bold text-slate-700">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'ACCEPTED QTY', accessor: 'acceptedQty', icon: CheckCircle2, width: 'w-[130px]', align: 'right', render: (value) => (
        <span className="font-bold text-emerald-600">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'REJECTION QTY', accessor: 'rejectionQty', icon: AlertCircle, width: 'w-[130px]', align: 'right', render: (value) => (
        <span className="font-bold text-red-500">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'SHORT QTY', accessor: 'shortQty', width: 'w-[100px]', align: 'right', render: (value) => (
        <span className="font-bold text-amber-500">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'STARTED TIMING', accessor: 'startedTiming', icon: Clock, width: 'w-[130px]', align: 'center', render: (value) => (
        <span className="font-mono text-[12px] text-slate-600">{value}</span>
      )
    },
    {
      header: 'COMPLETION TIMING', accessor: 'completionTiming', icon: CheckCircle2, width: 'w-[160px]', align: 'center', render: (value) => (
        <span className="font-mono text-[12px] text-slate-600">{value}</span>
      )
    },
    {
      header: 'QC CHECKED BY', accessor: 'qcCheckedBy', icon: User, width: 'w-[140px]', render: (value) => (
        <span className="font-medium text-slate-700">{value}</span>
      )
    },
    {
      header: 'PACKED BY', accessor: 'packedBy', icon: Package, width: 'w-[140px]', render: (value) => (
        <span className="font-medium text-slate-700">{value}</span>
      )
    },
    {
      header: 'REMARKS', accessor: 'remarks', width: 'w-[150px]', render: (value) => (
        <span className="text-slate-600 text-xs">{value}</span>
      )
    },
    {
      header: 'DATE', accessor: 'date', icon: Calendar, width: 'w-[110px]', render: (value) => (
        <span className="font-mono text-[12px] text-slate-500">{value}</span>
      )
    },
  ];

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up p-3">

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Entries"
          value={totalEntries}
          icon={Package}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label="Total Production"
          value={totalProduction.toLocaleString()}
          icon={CheckCircle2}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label="Accepted Qty"
          value={totalAccepted.toLocaleString()}
          icon={CheckCircle2}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label="Rejected Qty"
          value={totalRejected.toLocaleString()}
          icon={AlertCircle}
          color="#ef4444"
          bg="rgba(239,68,68,0.12)"
          border="rgba(239,68,68,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-6 animate-slide-up">
        {/* Toolbar */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by Item Name, Finisher, Route Card..."
          theme="emerald"
          showFilter={true}
          addButtonText="Add Report"
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={FINISHING_REPORT_DATA}
          minWidth="2200px"
        />
        <TableFooter
          totalEntries={FINISHING_REPORT_DATA.length}
        />
      </div>
    </div>
  );
}
