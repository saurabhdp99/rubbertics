import React, { useState } from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Calendar,
  User,
  Hash,
  Activity,
  ClipboardList,
  FileText,
  Layers,
  MapPin,
  Tag
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';

const RUBBER_STOCK_DATA = [
  { id: 1, date: '08/09/2025', compoundName: 'silicon transparent 60', operator: 'OPENING STOCK', lotNo: '-', batchNo: '-', addition: 0, routeCard: '-', deduction: 0, balance: 0 },
  { id: 2, date: '09/09/2025', compoundName: 'silicon transparent 60', operator: 'Anurag', lotNo: '-', batchNo: '4', addition: 36.3, routeCard: '-', deduction: 0, balance: 36.30 },
  { id: 3, date: '09/09/2025', compoundName: 'silicon transparent 60', operator: 'Anurag', lotNo: '-', batchNo: '5', addition: 36.3, routeCard: '-', deduction: 0, balance: 72.60 },
  { id: 4, date: '09/09/2025', compoundName: 'silicon transparent 60', operator: 'Babaji', lotNo: '-', batchNo: '-', addition: 0, routeCard: '347', deduction: 19.70, balance: 52.90 },
  { id: 5, date: '09/09/2025', compoundName: 'silicon transparent 60', operator: 'Ajay', lotNo: '-', batchNo: '-', addition: 0, routeCard: '350', deduction: 37.35, balance: 15.55 },
];

const FINISH_GOODS_DATA = [
  { id: 1, date: '4/28/2025', partName: '-', packingPerson: 'OPENING STOCK', lotNo: '-', routeCard: '-', addition: 0, invoiceNo: '-', deduction: 0, balance: 6.8 },
  { id: 2, date: '30.04.2025', partName: '-', packingPerson: 'Anurag', lotNo: '-', routeCard: '15', addition: 20.54, invoiceNo: '-', deduction: 0, balance: 27.34 },
  { id: 3, date: '30.04.2025', partName: '-', packingPerson: 'Anurag', lotNo: '-', routeCard: '16', addition: 20.6, invoiceNo: '-', deduction: 0, balance: 47.94 },
  { id: 4, date: '30.04.2025', partName: '-', packingPerson: 'Anurag', lotNo: '-', routeCard: '-', addition: 20.6, invoiceNo: '-', deduction: 0, balance: 68.54 },
  { id: 5, date: '30.04.2025', partName: '-', packingPerson: 'Montu', lotNo: '-', routeCard: '17', addition: 0, invoiceNo: '366', deduction: 30.31, balance: 38.23 },
];

const RM_STOCK_DATA = [
  { id: 1, rmName: 'EPDM K-6405H', rmCode: 'RM-01', location: '12', uom: 'KG', openingStock: 1155.000, total: 1155.000, totalIssue: 0.000, totalReceived: 0.000, actualBalance: 1155.000, invoiceNo: '-', reqSlipNo: '-' },
  { id: 2, rmName: 'EPDM-5469', rmCode: 'RM-02', location: '-', uom: 'KG', openingStock: 0.000, total: 0.000, totalIssue: 0.000, totalReceived: 0.000, actualBalance: 0.000, invoiceNo: '-', reqSlipNo: '-' },
  { id: 3, rmName: 'Neoprene Rubber', rmCode: 'RM-03', location: '4', uom: 'KG', openingStock: 20.280, total: 20.280, totalIssue: 0.000, totalReceived: 0.000, actualBalance: 20.280, invoiceNo: '-', reqSlipNo: '-' },
  { id: 4, rmName: 'SILICON Rubber 40 Hardness', rmCode: 'RM-04', location: '4', uom: 'KG', openingStock: 876.000, total: 876.000, totalIssue: 0.000, totalReceived: 0.000, actualBalance: 876.000, invoiceNo: '-', reqSlipNo: '-' },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('rm_stock');

  const currentData = activeTab === 'rubber_stock' ? RUBBER_STOCK_DATA : activeTab === 'finish_goods' ? FINISH_GOODS_DATA : RM_STOCK_DATA;

  // Simple stats calculation for the active tab
  let totalAdditions = 0;
  let totalDeductions = 0;
  let currentStock = 0;
  let lastTransaction = '-';

  if (activeTab === 'rm_stock') {
    totalAdditions = currentData.reduce((sum, row) => sum + row.totalReceived, 0);
    totalDeductions = currentData.reduce((sum, row) => sum + row.totalIssue, 0);
    currentStock = currentData.reduce((sum, row) => sum + row.actualBalance, 0);
    lastTransaction = currentData.length > 0 ? currentData[currentData.length - 1].rmCode : '-';
  } else {
    totalAdditions = currentData.reduce((sum, row) => sum + row.addition, 0);
    totalDeductions = currentData.reduce((sum, row) => sum + row.deduction, 0);
    currentStock = currentData.length > 0 ? currentData[currentData.length - 1].balance : 0;
    lastTransaction = currentData.length > 0 ? (activeTab === 'rubber_stock' ? currentData[currentData.length - 1].operator : currentData[currentData.length - 1].packingPerson) : '-';
  }

  const getSearchPlaceholder = () => {
    if (activeTab === 'rubber_stock') return "Search by Operator, Compound Name, Batch No...";
    if (activeTab === 'finish_goods') return "Search by Packing Person, Part Name, Invoice No...";
    return "Search by RM Name, RM Code, Location...";
  };

  const getColumns = (tab) => {
    if (tab === 'rm_stock') {
      return [
        { header: 'Sr.No', accessor: 'id', width: 'w-[80px]' },
        { header: 'RM Name', accessor: 'rmName' },
        { header: 'RM CODE', accessor: 'rmCode', icon: Tag, width: 'w-[120px]', render: (value) => (
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">{value}</span>
        )},
        { header: 'Location', accessor: 'location', icon: MapPin, width: 'w-[100px]', align: 'center', render: (value) => (
          value !== '-' ? value : <span className="text-slate-300">-</span>
        )},
        { header: 'UOM', accessor: 'uom', width: 'w-[80px]', align: 'center' },
        { header: 'Opening Stock', accessor: 'openingStock', width: 'w-[120px]', align: 'right', render: (value) => value.toFixed(3) },
        { header: 'Total', accessor: 'total', width: 'w-[120px]', align: 'right', render: (value) => value.toFixed(3) },
        { header: 'Total Issue', accessor: 'totalIssue', icon: ArrowDownRight, width: 'w-[120px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-rose-600">{value.toFixed(3)}</span> : <span className="text-slate-300">0.000</span>
        )},
        { header: 'Total Received', accessor: 'totalReceived', icon: ArrowUpRight, width: 'w-[140px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-emerald-600">{value.toFixed(3)}</span> : <span className="text-slate-300">0.000</span>
        )},
        { header: 'Actual Balance', accessor: 'actualBalance', icon: Activity, width: 'w-[140px]', align: 'right', render: (value) => (
          <span className={`inline-flex items-center justify-end gap-1 px-2.5 py-1 rounded-md font-bold text-[12px] shadow-sm ${
            value > 500 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            value > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
            'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>{value.toFixed(3)}</span>
        )},
        { header: 'Invoice No.', accessor: 'invoiceNo', icon: FileText, width: 'w-[120px]', render: (value) => (
          value !== '-' ? <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">{value}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Req. Slip No.', accessor: 'reqSlipNo', icon: ClipboardList, width: 'w-[160px]', render: (value) => (
          value !== '-' ? <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span> : <span className="text-slate-300">-</span>
        )},
      ];
    } else if (tab === 'rubber_stock') {
      return [
        { header: 'Date', accessor: 'date', icon: Calendar, width: 'w-[100px]', render: (value) => (
          <span className="font-mono text-[12px] text-slate-500">{value}</span>
        )},
        { header: 'Compound Name', accessor: 'compoundName', render: (value) => (
          <span className="font-semibold text-slate-700 uppercase tracking-tight">{value}</span>
        )},
        { header: 'Operator', accessor: 'operator', icon: User, render: (value, row) => (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
              value === 'OPENING STOCK' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>{value.charAt(0)}</div>
            <span className={value === 'OPENING STOCK' ? 'font-bold text-slate-400 text-xs' : 'font-bold text-slate-800'}>{value}</span>
          </div>
        )},
        { header: 'Lot No', accessor: 'lotNo', icon: Hash, width: 'w-[100px]' },
        { header: 'Batch No', accessor: 'batchNo', icon: Hash, width: 'w-[100px]', render: (value) => (
          value !== '-' ? <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">#{value}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Addition', accessor: 'addition', icon: ArrowUpRight, width: 'w-[140px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-emerald-600">+{value.toFixed(2)}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Route Card', accessor: 'routeCard', icon: ClipboardList, width: 'w-[120px]', render: (value) => (
          value !== '-' ? <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Deduction', accessor: 'deduction', icon: ArrowDownRight, width: 'w-[140px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-rose-600">-{value.toFixed(2)}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Balance', accessor: 'balance', icon: Activity, width: 'w-[140px]', align: 'right', render: (value) => (
          <span className={`inline-flex items-center justify-end gap-1 px-2.5 py-1 rounded-md font-bold text-[12px] shadow-sm ${
            value > 50 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            value > 20 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
            'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>{value.toFixed(2)}</span>
        )},
      ];
    } else {
      return [
        { header: 'Date', accessor: 'date', icon: Calendar, width: 'w-[100px]', render: (value) => (
          <span className="font-mono text-[12px] text-slate-500">{value}</span>
        )},
        { header: 'Part Name', accessor: 'partName', render: (value) => (
          <span className="font-semibold text-slate-700 uppercase tracking-tight">{value}</span>
        )},
        { header: 'Packing Person', accessor: 'packingPerson', icon: User, render: (value, row) => (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
              value === 'OPENING STOCK' ? 'bg-slate-100 text-slate-500' : 'bg-purple-50 text-purple-600 border border-purple-100'
            }`}>{value.charAt(0)}</div>
            <span className={value === 'OPENING STOCK' ? 'font-bold text-slate-400 text-xs' : 'font-bold text-slate-800'}>{value}</span>
          </div>
        )},
        { header: 'Lot No', accessor: 'lotNo', icon: Hash, width: 'w-[100px]' },
        { header: 'Route Card No', accessor: 'routeCard', icon: ClipboardList, width: 'w-[140px]', render: (value) => (
          value !== '-' ? <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Addition (In)', accessor: 'addition', icon: ArrowUpRight, width: 'w-[150px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-emerald-600">+{value.toFixed(2)}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Invoice No', accessor: 'invoiceNo', icon: FileText, width: 'w-[120px]', render: (value) => (
          value !== '-' ? <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">INV-{value}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Deduction (Dispatch)', accessor: 'deduction', icon: ArrowDownRight, width: 'w-[160px]', align: 'right', render: (value) => (
          value > 0 ? <span className="text-rose-600">-{value.toFixed(2)}</span> : <span className="text-slate-300">-</span>
        )},
        { header: 'Available Stock', accessor: 'balance', icon: Activity, width: 'w-[140px]', align: 'right', render: (value) => (
          <span className={`inline-flex items-center justify-end gap-1 px-2.5 py-1 rounded-md font-bold text-[12px] shadow-sm ${
            value > 40 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            value > 10 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
            'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>{value.toFixed(2)}</span>
        )},
      ];
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up p-6">
      {/* Page Header */}
      <PageHeader
        icon={Package}
        title="Inventory Ledger"
        description="Track material movement and stock balance"
        showLiveSync={true}
        theme="emerald"
      />

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label={activeTab === 'rm_stock' ? 'Total Raw Material' : 'Current Stock'}
          value={`${currentStock.toFixed(2)} ${activeTab === 'rm_stock' ? 'KG' : 'kg'}`}
          icon={Package}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label={activeTab === 'rm_stock' ? 'Total Received' : 'Total Additions'}
          value={`${totalAdditions.toFixed(2)} ${activeTab === 'rm_stock' ? 'KG' : 'kg'}`}
          icon={ArrowUpRight}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label={activeTab === 'rm_stock' ? 'Total Issued' : 'Total Deductions'}
          value={`${totalDeductions.toFixed(2)} ${activeTab === 'rm_stock' ? 'KG' : 'kg'}`}
          icon={ArrowDownRight}
          color="#ef4444"
          bg="rgba(239,68,68,0.12)"
          border="rgba(239,68,68,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label={activeTab === 'rm_stock' ? 'Last RM Code' : 'Last Transaction'}
          value={lastTransaction}
          icon={History}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6 px-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('rm_stock')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'rm_stock' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <Layers size={16} />
          RM Stock
        </button>
        <button
          onClick={() => setActiveTab('rubber_stock')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'rubber_stock' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <Package size={16} />
          Rubber Stock
        </button>
        <button
          onClick={() => setActiveTab('finish_goods')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'finish_goods' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <ClipboardList size={16} />
          Finish Goods Stock
        </button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-6 animate-slide-up" key={activeTab}>
        {/* Toolbar */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={getSearchPlaceholder()}
          theme="emerald"
          addButtonText="Add Entry"
        />

        {/* Table */}
        <DataTable
          columns={getColumns(activeTab)}
          data={currentData}
          minWidth={activeTab === 'rm_stock' ? '1400px' : '1200px'}
        />
        <TableFooter
          totalEntries={currentData.length}
          additionalInfo={`* Measurements in ${activeTab === 'rm_stock' ? 'KG' : 'kg'}`}
        />
      </div>
    </div>
  );
}
