import React, { useState } from 'react';
import {
  Layers,
  Hash,
  Package,
  Palette,
  Scale,
  Maximize,
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

const MIXING_PLAN_DATA = [
  {
    id: 1,
    compoundCode: 'CMP-001',
    compoundName: 'Silicon Transparent 60',
    colour: 'Transparent',
    batchStandardWeight: 36.5,
    standardSheetSize: '300x300',
    lotNo: 'LOT-001',
    batchNo: 'BATCH-001',
    actualBatchWeight: 36.3,
    actualHardness: 60,
    batchStatus: 'Completed',
    operatorName: 'Anurag',
    remarks: 'Quality approved'
  },
  {
    id: 2,
    compoundCode: 'CMP-002',
    compoundName: 'EPDM Black',
    colour: 'Black',
    batchStandardWeight: 40.0,
    standardSheetSize: '300x300',
    lotNo: 'LOT-002',
    batchNo: 'BATCH-002',
    actualBatchWeight: 39.8,
    actualHardness: 65,
    batchStatus: 'In Progress',
    operatorName: 'Babaji',
    remarks: 'Processing'
  },
  {
    id: 3,
    compoundCode: 'CMP-003',
    compoundName: 'Neoprene Red',
    colour: 'Red',
    batchStandardWeight: 35.0,
    standardSheetSize: '250x250',
    lotNo: 'LOT-003',
    batchNo: 'BATCH-003',
    actualBatchWeight: 34.9,
    actualHardness: 55,
    batchStatus: 'Completed',
    operatorName: 'Ajay',
    remarks: 'Test passed'
  },
  {
    id: 4,
    compoundCode: 'CMP-004',
    compoundName: 'Nitrile Blue',
    colour: 'Blue',
    batchStandardWeight: 38.0,
    standardSheetSize: '300x300',
    lotNo: 'LOT-004',
    batchNo: 'BATCH-004',
    actualBatchWeight: 37.5,
    actualHardness: 70,
    batchStatus: 'Pending',
    operatorName: 'Montu',
    remarks: 'Awaiting approval'
  },
  {
    id: 5,
    compoundCode: 'CMP-005',
    compoundName: 'Silicon White',
    colour: 'White',
    batchStandardWeight: 36.5,
    standardSheetSize: '300x300',
    lotNo: 'LOT-005',
    batchNo: 'BATCH-005',
    actualBatchWeight: 36.2,
    actualHardness: 58,
    batchStatus: 'Completed',
    operatorName: 'Anurag',
    remarks: 'Excellent quality'
  },
];

const DAILY_MIXING_PLAN_DATA = [
  {
    id: 1,
    date: '01-05-2026',
    srNo: 1,
    compoundCode: 'CMP-001',
    compoundName: 'Silicon Transparent 60',
    batchStandardWeight: 36.5,
    standardSheetSize: '300x300',
    lotNo: 'LOT-001',
    batchStatus: 'Completed',
    plannedBatches: 5,
    achievedBatches: 5,
    remarks: 'All batches completed on time'
  },
  {
    id: 2,
    date: '01-05-2026',
    srNo: 2,
    compoundCode: 'CMP-002',
    compoundName: 'EPDM Black',
    batchStandardWeight: 40.0,
    standardSheetSize: '300x300',
    lotNo: 'LOT-002',
    batchStatus: 'In Progress',
    plannedBatches: 4,
    achievedBatches: 2,
    remarks: '2 batches remaining'
  },
  {
    id: 3,
    date: '02-05-2026',
    srNo: 3,
    compoundCode: 'CMP-003',
    compoundName: 'Neoprene Red',
    batchStandardWeight: 35.0,
    standardSheetSize: '250x250',
    lotNo: 'LOT-003',
    batchStatus: 'Pending',
    plannedBatches: 3,
    achievedBatches: 0,
    remarks: 'Awaiting material'
  },
];

const MOULDING_PLAN_DATA = [
  {
    id: 1,
    date: '01-05-2026',
    srNo: 1,
    operatorName: 'Anurag',
    itemName: 'Silicon Transparent 60 - Batch 1',
    target: 10
  },
  {
    id: 2,
    date: '01-05-2026',
    srNo: 2,
    operatorName: 'Priya',
    itemName: 'Natural Rubber Black - Batch 2',
    target: 15
  },
  {
    id: 3,
    date: '02-05-2026',
    srNo: 3,
    operatorName: 'Rahul',
    itemName: 'EPDM Red 70 - Batch 1',
    target: 12
  },
];

export default function MixingMoldingPlanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('mixing_plan');

  const currentData =
    activeTab === 'mixing_plan' ? MIXING_PLAN_DATA :
      activeTab === 'daily_mixing_plan' ? DAILY_MIXING_PLAN_DATA :
        MOULDING_PLAN_DATA;

  // Stats calculation based on active tab
  let totalBatches, completedBatches, inProgressBatches, pendingBatches;

  if (activeTab === 'mixing_plan') {
    totalBatches = MIXING_PLAN_DATA.length;
    completedBatches = MIXING_PLAN_DATA.filter(d => d.batchStatus === 'Completed').length;
    inProgressBatches = MIXING_PLAN_DATA.filter(d => d.batchStatus === 'In Progress').length;
    pendingBatches = MIXING_PLAN_DATA.filter(d => d.batchStatus === 'Pending').length;
  } else if (activeTab === 'daily_mixing_plan') {
    totalBatches = DAILY_MIXING_PLAN_DATA.reduce((s, d) => s + (d.plannedBatches || 0), 0);
    completedBatches = DAILY_MIXING_PLAN_DATA.filter(d => d.batchStatus === 'Completed').length;
    inProgressBatches = DAILY_MIXING_PLAN_DATA.filter(d => d.batchStatus === 'In Progress').length;
    pendingBatches = DAILY_MIXING_PLAN_DATA.filter(d => d.batchStatus === 'Pending').length;
  } else {
    totalBatches = MOULDING_PLAN_DATA.length;
    completedBatches = MOULDING_PLAN_DATA.length;
    inProgressBatches = 0;
    pendingBatches = 0;
  }

  const getSearchPlaceholder = () => {
    if (activeTab === 'mixing_plan') return "Search by Compound Code, Name, Operator...";
    if (activeTab === 'daily_mixing_plan') return "Search by Compound Code, Name, Lot No...";
    return "Search by Operator Name, Item Name...";
  };

  const getColumns = (tab) => {
    if (tab === 'mixing_plan') {
      return [
        { header: 'SR NO', accessor: 'id', icon: Hash, width: 'w-[80px]' },
        {
          header: 'COMPOUND CODE', accessor: 'compoundCode', icon: Hash, width: 'w-[130px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span>
          )
        },
        {
          header: 'COMPOUND NAME', accessor: 'compoundName', icon: Package, width: 'w-[200px]', render: (value) => (
            <span className="font-semibold text-slate-700">{value}</span>
          )
        },
        {
          header: 'COLOUR', accessor: 'colour', icon: Palette, width: 'w-[100px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">{value}</span>
          )
        },
        {
          header: 'BATCH STANDARD WEIGHT', accessor: 'batchStandardWeight', icon: Scale, width: 'w-[180px]', align: 'right', render: (value) => (
            <span className="font-bold text-slate-700">{value.toFixed(1)} kg</span>
          )
        },
        {
          header: 'STANDARD SHEET SIZE', accessor: 'standardSheetSize', icon: Maximize, width: 'w-[160px]', render: (value) => (
            <span className="font-mono text-slate-600">{value}</span>
          )
        },
        {
          header: 'LOT No.', accessor: 'lotNo', icon: Hash, width: 'w-[100px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">{value}</span>
          )
        },
        {
          header: 'BATCH No.', accessor: 'batchNo', icon: Hash, width: 'w-[110px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">{value}</span>
          )
        },
        {
          header: 'ACTUAL BATCH WEIGHT', accessor: 'actualBatchWeight', icon: Scale, width: 'w-[180px]', align: 'right', render: (value) => (
            <span className="font-bold text-slate-800">{value.toFixed(1)} kg</span>
          )
        },
        {
          header: 'ACTUAL HARDNESS', accessor: 'actualHardness', width: 'w-[140px]', align: 'center', render: (value) => (
            <span className="font-bold text-slate-700">{value} Shore A</span>
          )
        },
        {
          header: 'BATCH STATUS', accessor: 'batchStatus', width: 'w-[130px]', render: (value) => {
            const statusConfig = {
              'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
              'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
              'Pending': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: AlertCircle },
            };
            const config = statusConfig[value] || statusConfig['Pending'];
            const Icon = config.icon;
            return (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                <Icon size={12} />
                {value}
              </span>
            );
          }
        },
        {
          header: 'OPERATOR NAME', accessor: 'operatorName', icon: User, width: 'w-[140px]', render: (value) => (
            <span className="font-semibold text-slate-700">{value}</span>
          )
        },
        {
          header: 'REMARKS', accessor: 'remarks', width: 'w-[150px]', render: (value) => (
            <span className="text-slate-600 text-xs">{value}</span>
          )
        },
      ];
    } else if (tab === 'daily_mixing_plan') {
      return [
        {
          header: 'DATE', accessor: 'date', icon: Calendar, width: 'w-[110px]', render: (value) => (
            <span className="font-mono text-[12px] text-slate-500">{value}</span>
          )
        },
        {
          header: 'SR NO', accessor: 'srNo', icon: Hash, width: 'w-[70px]', align: 'center', render: (value) => (
            <span className="font-bold text-slate-700">{value}</span>
          )
        },
        {
          header: 'COMPOUND CODE', accessor: 'compoundCode', icon: Hash, width: 'w-[140px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{value}</span>
          )
        },
        {
          header: 'COMPOUND NAME', accessor: 'compoundName', icon: Package, width: 'w-[200px]', render: (value) => (
            <span className="font-semibold text-slate-700">{value}</span>
          )
        },
        {
          header: 'BATCH STANDARD WEIGHT', accessor: 'batchStandardWeight', icon: Scale, width: 'w-[180px]', align: 'right', render: (value) => (
            <span className="font-bold text-slate-700">{value.toFixed(1)} kg</span>
          )
        },
        {
          header: 'STANDARD SHEET SIZE', accessor: 'standardSheetSize', icon: Maximize, width: 'w-[160px]', render: (value) => (
            <span className="font-mono text-slate-600">{value}</span>
          )
        },
        {
          header: 'LOT No.', accessor: 'lotNo', icon: Hash, width: 'w-[110px]', render: (value) => (
            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">{value}</span>
          )
        },
        {
          header: 'BATCH STATUS', accessor: 'batchStatus', width: 'w-[130px]', render: (value) => {
            const statusConfig = {
              'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
              'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
              'Pending': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: AlertCircle },
            };
            const config = statusConfig[value] || statusConfig['Pending'];
            const Icon = config.icon;
            return (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                <Icon size={12} />
                {value}
              </span>
            );
          }
        },
        {
          header: 'PLANNED BATCHES', accessor: 'plannedBatches', width: 'w-[140px]', align: 'center', render: (value) => (
            <span className="font-bold text-indigo-600">{value}</span>
          )
        },
        {
          header: 'ACHIEVED BATCHES', accessor: 'achievedBatches', width: 'w-[150px]', align: 'center', render: (value) => (
            <span className="font-bold text-emerald-600">{value}</span>
          )
        },
        {
          header: 'REMARKS', accessor: 'remarks', width: 'w-[180px]', render: (value) => (
            <span className="text-slate-600 text-xs">{value}</span>
          )
        },
      ];
    } else if (tab === 'moulding_plan') {
      return [
        {
          header: 'DATE', accessor: 'date', icon: Calendar, width: 'w-[110px]', render: (value) => (
            <span className="font-mono text-[12px] text-slate-500">{value}</span>
          )
        },
        { header: 'SR NO', accessor: 'srNo', icon: Hash, width: 'w-[80px]' },
        {
          header: 'OPERATOR NAME', accessor: 'operatorName', icon: User, width: 'w-[150px]', render: (value) => (
            <span className="font-semibold text-slate-700">{value}</span>
          )
        },
        {
          header: 'ITEM NAME', accessor: 'itemName', icon: Package, width: 'w-[300px]', render: (value) => (
            <span className="font-semibold text-slate-700">{value}</span>
          )
        },
        {
          header: 'TARGET', accessor: 'target', icon: CheckCircle2, width: 'w-[100px]', align: 'center', render: (value) => (
            <span className="font-bold text-emerald-600">{value}</span>
          )
        },
      ];
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up p-3">

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label={activeTab === 'mixing_plan' ? 'Total Batches' : activeTab === 'daily_mixing_plan' ? 'Total Planned' : 'Total Plans'}
          value={totalBatches}
          icon={Package}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label={activeTab === 'mixing_plan' ? 'Completed' : activeTab === 'daily_mixing_plan' ? 'Completed' : 'Total Target'}
          value={activeTab === 'moulding_plan' ? currentData.reduce((sum, d) => sum + d.target, 0) : completedBatches}
          icon={CheckCircle2}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label={activeTab === 'mixing_plan' ? 'In Progress' : activeTab === 'daily_mixing_plan' ? 'In Progress' : 'Active Operators'}
          value={activeTab === 'moulding_plan' ? [...new Set(currentData.map(d => d.operatorName))].length : inProgressBatches}
          icon={Clock}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label={activeTab === 'mixing_plan' ? 'Pending' : activeTab === 'daily_mixing_plan' ? 'Pending' : 'Today\'s Plans'}
          value={activeTab === 'moulding_plan' ? currentData.filter(d => d.date === '01-05-2026').length : pendingBatches}
          icon={AlertCircle}
          color="#ef4444"
          bg="rgba(239,68,68,0.12)"
          border="rgba(239,68,68,0.25)"
          animationDelay={150}
        />
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6 px-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('mixing_plan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'mixing_plan' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <Package size={16} />
          Mixing production
        </button>
        <button
          onClick={() => setActiveTab('daily_mixing_plan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'daily_mixing_plan' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <Scale size={16} />
          Daily Mixing Plan
        </button>
        <button
          onClick={() => setActiveTab('moulding_plan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'moulding_plan' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          <Layers size={16} />
          Daily Moulding Plan
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
          showFilter={true}
          addButtonText={activeTab === 'mixing_plan' ? 'Add Batch' : activeTab === 'daily_mixing_plan' ? 'Add Daily Plan' : 'Add Plan'}
        />

        {/* Table */}
        <DataTable
          columns={getColumns(activeTab)}
          data={currentData}
          minWidth={activeTab === 'mixing_plan' || activeTab === 'daily_mixing_plan' ? '1800px' : '900px'}
        />
        <TableFooter
          totalEntries={currentData.length}
        />
      </div>
    </div>
  );
}
