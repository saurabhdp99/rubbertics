import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  Search,
  Package,
  User,
  Calendar,
  Hash,
  Scale,
  Layers,
  Palette,
  CheckCircle2,
  Clock,
  TrendingUp,
  Truck,
  ArrowRight,
  Settings,
  MoreVertical,
  ChevronRight,
  ClipboardList,
  Filter,
  Eye,
  ChevronLeft
} from 'lucide-react';
import { Table } from '@heroui/react';

// --- DATA ---
const WORK_ORDERS = [
  {
    id: 1,
    woNo: 'NPPL-74',
    woDate: '11/10/2025',
    customer: 'SANMINA',
    partName: 'P034 GASKET',
    orderQty: '2000',
    status: 'In Process',
    completion: '45%'
  },
  {
    id: 2,
    woNo: 'NPPL-75',
    woDate: '12/10/2025',
    customer: 'SINDHU TECHNOLOGY',
    partName: 'DRB Port Seal Tube',
    orderQty: '5000',
    status: 'Open',
    completion: '0%'
  },
  {
    id: 3,
    woNo: 'NPPL-76',
    woDate: '15/10/2025',
    customer: 'SABER ELECTRONICS',
    partName: 'Red Grommet',
    orderQty: '10000',
    status: 'Completed',
    completion: '100%'
  }
];

const DUMMY_WORK_ORDER = {
  header: {
    companyName: 'NISARG POLYMERS PVT.LTD',
    title: 'WORK ORDER SHEET',
    formatNo: 'DRP/F/35',
    rev: '0.00',
    date: '00',
    tagline: 'We Deliver Quality.....'
  },
  orderInfo: {
    customerName: 'SANMINA',
    poDate: '11/10/2025',
    poNo: '2000',
    poQty: '2000',
    woDate: '11/10/2025',
    workOrderNo: 'NPPL-74',
    workOrderQty: '2000',
    balanceRubber: '14.444'
  },
  partDetails: {
    partName: 'P034 GASKET',
    partNo: 'N/A',
    noOfCavity: '9',
    mouldNo: '520',
    totalShots: '222'
  },
  rawMaterial: {
    name: 'EPDM 60',
    colour: 'BLACK',
    compoundCode: 'EPDM 60',
    batchWeight: 'N/A',
    totalShotWeight: '0.065'
  },
  calculations: {
    totalRubberRequired: '14.444',
    noOfBatchRequired: '#DIV/0!',
    perShiftProduction: '150',
    totalShiftRequired: '1.48',
    perShiftRawMaterial: '9.75',
    balanceRubberKg: '14.44',
    balanceQtyPcs: '2000',
    rejectionPercent: '0.00'
  }
};

const MIXING_DETAILS = [
  { id: 1, date: '11/10/25', lotNo: 'L-74/1', batchNo: 'B1', operator: 'Anurag', plan: '14.444', prod: '14.500', bal: '14.444' },
  { id: 2, date: '12/10/25', lotNo: 'L-74/2', batchNo: 'B2', operator: 'Anurag', plan: '14.444', prod: '14.400', bal: '14.444' },
  { id: 3, date: '13/10/25', lotNo: 'L-74/3', batchNo: 'B3', operator: 'Babaji', plan: '14.444', prod: '14.450', bal: '14.444' },
  { id: 4, date: '14/10/25', lotNo: 'L-74/4', batchNo: 'B4', operator: 'Babaji', plan: '14.444', prod: '14.444', bal: '14.444' }
];

const ROUTE_CARD_DETAILS = [
  { id: 1, date: '12/10/25', card: 'RC-101', plan: '500', operator: 'Ajay', actual: '510', accpt: '505', rewrk: '2', rej: '3', shrt: '0', bal: '1500' },
  { id: 2, date: '13/10/25', card: 'RC-102', plan: '500', operator: 'Ajay', actual: '490', accpt: '485', rewrk: '3', rej: '2', shrt: '0', bal: '1015' },
  { id: 3, date: '14/10/25', card: 'RC-103', plan: '500', operator: 'Montu', actual: '500', accpt: '495', rewrk: '1', rej: '4', shrt: '0', bal: '520' }
];

const DISPATCH_DETAILS = [
  { id: 1, date: '15/10/25', inv: 'INV-741', po: '2000', qty: '500', stock: '1500' },
  { id: 2, date: '16/10/25', inv: 'INV-742', po: '2000', qty: '800', stock: '700' }
];

// --- SUBCOMPONENTS ---
function DetailTable({ title, columns, data, theme = 'emerald', noHeader = false }) {
  const themeColors = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  return (
    <div className={`bg-white overflow-hidden ${noHeader ? '' : 'rounded-3xl border border-slate-100 shadow-sm'}`}>
      {!noHeader && (
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${themeColors[theme] || 'bg-emerald-500'}`} />
            {title}
          </h3>
        </div>
      )}
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Detail table">
            <Table.Header>
              {columns.map((col, idx) => (
                <Table.Column key={idx} isRowHeader={idx === 0} className="px-2 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">
                  {col}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body items={data}>
              {(row) => (
                <Table.Row key={row.id || JSON.stringify(row)}>
                  {Object.values(row).map((val, vIdx) => (
                    <Table.Cell key={vIdx} className="px-2 py-2 text-[10px] font-semibold text-slate-600 text-center">
                      {val || ''}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function WorkOrderSheetPage() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = WORK_ORDERS.filter(wo =>
    wo.woNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wo.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wo.partName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Process': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Open': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // --- VIEW 1: REGISTER ---
  const renderRegister = () => (
    <div className="animate-slide-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-200">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Work Order Register</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select an order to view full sheet</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search by WO#, Customer..."
              className="pl-11 pr-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 w-80 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Work orders register">
              <Table.Header>
                <Table.Column isRowHeader className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Sr. No</Table.Column>
                <Table.Column className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Order Info</Table.Column>
                <Table.Column className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</Table.Column>
                <Table.Column className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Part & Quantity</Table.Column>
                <Table.Column className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</Table.Column>
                <Table.Column className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</Table.Column>
              </Table.Header>
              <Table.Body items={filtered}>
                {(wo) => (
                  <Table.Row
                    key={wo.id}
                    className="hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <Table.Cell className="px-6 py-6 text-center font-bold text-slate-400 text-sm">{filtered.indexOf(wo) + 1}</Table.Cell>
                    <Table.Cell className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{wo.woNo}</span>
                        <span className="text-[11px] font-bold text-slate-400 mt-1">{wo.woDate}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-6 font-bold text-slate-700 text-sm">{wo.customer}</Table.Cell>
                    <Table.Cell className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{wo.partName}</span>
                        <span className="text-[11px] font-black text-emerald-600 mt-1 uppercase tracking-wider">{wo.orderQty} PCS</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(wo.status)}`}>
                        {wo.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-6 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => navigate('/work-order-details')}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );

  // --- VIEW 2: DETAIL SHEET ---
  const renderSheet = () => (
    <div className="animate-slide-up space-y-8">
      {/* Page Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedOrder(null)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Work Order Sheet</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail View</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{selectedOrder?.woNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all">
            <Printer size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Sheet Content */}
      <div className="glass-card rounded-[32px] p-8 relative overflow-hidden border border-white shadow-xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Settings size={200} className="text-emerald-900" />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
          <div className="flex gap-6 items-start">
            <div className="w-20 h-20 rounded-3xl bg-white p-3 shadow-xl border border-slate-100 flex items-center justify-center">
              <img src="/logo.png" alt="NP" className="w-full h-auto" onError={(e) => e.target.src = "https://via.placeholder.com/80?text=NP"} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{DUMMY_WORK_ORDER.header.companyName}</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Quality Certified</span>
                <p className="text-sm font-bold text-slate-400 italic">"{DUMMY_WORK_ORDER.header.tagline}"</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl mb-4 shadow-lg">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Document Type</h4>
              <span className="text-lg font-black tracking-tight">{DUMMY_WORK_ORDER.header.title}</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Format No</p><p className="text-xs font-bold text-slate-700">{DUMMY_WORK_ORDER.header.formatNo}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Revision</p><p className="text-xs font-bold text-slate-700">{DUMMY_WORK_ORDER.header.rev}</p></div>
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p><p className="text-xs font-bold text-slate-700">{DUMMY_WORK_ORDER.header.date}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Tables */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="w-48 bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Customer Name</td>
              <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.customerName}</td>
              <td className="w-32 bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">PO Date</td>
              <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.poDate}</td>
              <td className="w-32 bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">PO No.</td>
              <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.poNo}</td>
              <td className="w-32 bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">PO Qty</td>
              <td className="p-3 font-bold text-slate-700">{DUMMY_WORK_ORDER.orderInfo.poQty}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Balance Rubber</td>
              <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.balanceRubber}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">WO Date</td>
              <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.woDate}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Work Order No.</td>
              <td className="p-3 font-bold text-emerald-600 border-r border-slate-200">{DUMMY_WORK_ORDER.orderInfo.workOrderNo}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Work Order Qty</td>
              <td className="p-3 font-bold text-slate-700">{DUMMY_WORK_ORDER.orderInfo.workOrderQty}</td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Total Rubber Required</td>
              <td className="p-3 font-bold bg-amber-50 text-amber-700 border-r border-slate-200">{DUMMY_WORK_ORDER.calculations.totalRubberRequired}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">No. Of Batch Req</td>
              <td className="p-3 font-bold bg-amber-50 text-amber-700 border-r border-slate-200">{DUMMY_WORK_ORDER.calculations.noOfBatchRequired}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Total Shift Req</td>
              <td className="p-3 font-bold bg-amber-50 text-amber-700 border-r border-slate-200">{DUMMY_WORK_ORDER.calculations.totalShiftRequired}</td>
              <td className="bg-slate-50 p-3 font-black text-slate-400 uppercase border-r border-slate-200">Balance Qty (Pcs)</td>
              <td className="p-3 font-bold bg-amber-50 text-amber-700">{DUMMY_WORK_ORDER.calculations.balanceQtyPcs}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Multi-section Tables */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-0 min-w-[1500px] border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
          <div className="flex-1 border-r border-slate-200">
            <div className="bg-emerald-500 p-2 text-center border-b border-slate-200 text-white text-[10px] font-black uppercase tracking-widest">Mixing Production</div>
            <DetailTable columns={['SR', 'Date', 'Lot #', 'Batch #', 'Operator', 'Plan', 'Prod', 'Bal']} data={MIXING_DETAILS} noHeader />
          </div>
          <div className="flex-[1.5] border-r border-slate-200">
            <div className="bg-indigo-500 p-2 text-center border-b border-slate-200 text-white text-[10px] font-black uppercase tracking-widest">Route Card Details</div>
            <DetailTable columns={['SR', 'Date', 'Card #', 'Plan', 'Operator', 'Actual', 'Accpt', 'Rewrk', 'Rej', 'Shrt', 'Bal']} data={ROUTE_CARD_DETAILS} noHeader />
          </div>
          <div className="flex-1">
            <div className="bg-rose-500 p-2 text-center border-b border-slate-200 text-white text-[10px] font-black uppercase tracking-widest">Dispatch Details</div>
            <DetailTable columns={['SR', 'Date', 'Inv #', 'PO #', 'Qty', 'Stock']} data={DISPATCH_DETAILS} noHeader />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-3 pb-20">
      {selectedOrder ? renderSheet() : renderRegister()}
    </div>
  );
}
