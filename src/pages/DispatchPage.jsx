import React, { useState, useMemo } from 'react';
import {
  Truck,
  Calendar,
  Hash,
  FileText,
  Building2,
  PackageSearch,
  Boxes,
  Scale,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';

const DUMMY_DISPATCH_DATA = [
  { id: 1, srNo: 1, invDate: '2/1/2026', invoiceNo: 'NP/25-26/2068', purchaseOrderNo: 'P20260034385', partyName: 'RAYCHEM RPG PVT LTD', partNo: 'OS D4B4001209', materialDescription: 'LABOUR CHARG.MOULD ELASTOMER 2T SQ', quantity: 42, transport: 'TEMPO DELIVERY', lrNo: '', noOfBags: '' },
  { id: 2, srNo: 2, invDate: '2/1/2026', invoiceNo: 'NP/25-26/2069', purchaseOrderNo: 'P20260033827', partyName: 'RAYCHEM RPG PVT LTD', partNo: 'OS D4B4000802', materialDescription: 'LABOUR CHARG. RUBBER ELASTOMER 4.7T', quantity: 36, transport: 'TEMPO DELIVERY', lrNo: '', noOfBags: '' },
  { id: 3, srNo: 3, invDate: '3/1/2026', invoiceNo: 'NP/25-26/2070', purchaseOrderNo: '42873', partyName: 'JYOTI WORLD PRIVATE LIMITED', partNo: '1008000076', materialDescription: 'PTRB63H O-RING', quantity: 90000, transport: 'NANDWANA CARRIER', lrNo: '12345', noOfBags: '10' },
];

export default function DispatchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalQuantity = useMemo(
    () => DUMMY_DISPATCH_DATA.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
    []
  );

  const totalDispatches = DUMMY_DISPATCH_DATA.length;
  const uniqueTransporters = [...new Set(DUMMY_DISPATCH_DATA.map(d => d.transport))].length;

  const filteredData = useMemo(() => {
    if (!searchTerm) return DUMMY_DISPATCH_DATA;
    const q = searchTerm.toLowerCase();
    return DUMMY_DISPATCH_DATA.filter(row =>
      row.invoiceNo.toLowerCase().includes(q) ||
      row.purchaseOrderNo.toLowerCase().includes(q) ||
      row.partyName.toLowerCase().includes(q) ||
      row.partNo.toLowerCase().includes(q) ||
      row.materialDescription.toLowerCase().includes(q) ||
      row.transport.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const columns = [
    { header: 'SR.NO', accessor: 'srNo', icon: Hash, width: 'w-[70px]', align: 'center', render: (value) => (
      <span className="font-bold text-slate-700">{value}</span>
    )},
    { header: 'INV DATE', accessor: 'invDate', icon: Calendar, width: 'w-[100px]', render: (value) => (
      <span className="font-mono text-[12px] text-slate-500">{value}</span>
    )},
    { header: 'INVOICE NO', accessor: 'invoiceNo', icon: FileText, width: 'w-[140px]', render: (value) => (
      <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 whitespace-nowrap">{value}</span>
    )},
    { header: 'PURCHASE ORDER NO', accessor: 'purchaseOrderNo', icon: ClipboardList, width: 'w-[170px]', render: (value) => (
      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 whitespace-nowrap">{value}</span>
    )},
    { header: 'PARTY NAME', accessor: 'partyName', icon: Building2, width: 'w-[220px]', render: (value) => (
      <span className="font-bold text-slate-800 uppercase tracking-tight">{value}</span>
    )},
    { header: 'PART NO', accessor: 'partNo', icon: Hash, width: 'w-[140px]', render: (value) => (
      <span className="font-mono text-[12px] text-slate-600 font-semibold whitespace-nowrap">{value}</span>
    )},
    { header: 'MATERIAL DESCRIPTION', accessor: 'materialDescription', icon: PackageSearch, width: 'w-[280px]', render: (value) => (
      <span className="font-semibold text-slate-700 uppercase tracking-tight">{value}</span>
    )},
    { header: 'QUANTITY', accessor: 'quantity', icon: Scale, width: 'w-[100px]', align: 'right', render: (value) => (
      <span className="font-extrabold text-emerald-600">{Number(value).toLocaleString()}</span>
    )},
    { header: 'TRANSPORT', accessor: 'transport', icon: Truck, width: 'w-[160px]', render: (value) => (
      <span className="font-medium text-slate-600">{value}</span>
    )},
    { header: 'LR.NO', accessor: 'lrNo', icon: MapPin, width: 'w-[100px]', render: (value) => (
      <span className="font-mono text-[12px] text-slate-500">{value || '—'}</span>
    )},
    { header: 'No. Of BAGS', accessor: 'noOfBags', icon: Boxes, width: 'w-[110px]', align: 'center', render: (value) => (
      <span className="font-bold text-slate-700">{value || '—'}</span>
    )},
  ];

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up py-8 px-6">

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Dispatches"
          value={totalDispatches}
          icon={Truck}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label="Total Quantity"
          value={totalQuantity.toLocaleString()}
          icon={Scale}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label="Active Transporters"
          value={uniqueTransporters}
          icon={Building2}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label="Pending LR Entry"
          value="2"
          icon={MapPin}
          color="#ef4444"
          bg="rgba(239,68,68,0.12)"
          border="rgba(239,68,68,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by Invoice No, PO No, Party Name, Part No..."
          theme="emerald"
          showFilter={true}
          addButtonText="New Dispatch"
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          minWidth="1600px"
        />
        <TableFooter
          totalEntries={filteredData.length}
          additionalInfo="Dispatch register maintained as per screenshot format"
        />
      </div>
    </div>
  );
}
