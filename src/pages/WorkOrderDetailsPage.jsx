import { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  Filter,
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  Database,
  Plus,
  X,
  Save,
  Trash2,
  Edit2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Info,
  Settings,
  TrendingUp,
  Package,
  Layers,
  ClipboardList,
  SlidersHorizontal
} from 'lucide-react';
import { Table } from '@heroui/react';

const DUMMY_WORK_ORDERS = [
  {
    id: 1,
    woNo: 'NPPL/23-24/W00001',
    woDate: '2023-04-01',
    customer: 'Sindhu Technology',
    poNo: '1290005700-0',
    poDate: '2023-04-10',
    deliveryDate: '2023-05-15',
    prodPlace: 'Mumbai Inhouse',
    partName: 'DRB Port Seal Tube',
    partNo: 'N/A',
    rawMaterial: 'Silicone Translucent 50',
    colour: 'Translucent',
    compoundCode: 'SIL-50-TR',
    noCavities: 9,
    mouldNo: '157',
    shotWeight: 0.01,
    batchWeight: 20.10,
    orderQty: 5000,
    shotsReq: 556,
    rubberReq: 5.56,
    batchesReq: 1,
    shiftTargetPcs: 1500,
    shiftTargetRm: 0.60,
    totalShiftReq: 4,
    producedQty: 5102,
    acceptedQty: 5076,
    reworkQty: 0,
    rejectQty: 26,
    shortQty: 749,
    dispatchedQty: 1400,
    stockBalance: 3676,
    completion: '99.2%',
    materialIssued: 15.00,
    materialBalance: -10.43,
    status: 'In Process',
    preparedBy: 'Rahul Kumar',
    checkedBy: 'Amit Singh',
    approvedBy: 'S.P. Mishra',
    stage: 'Approved',
    remarks: 'Sample approved, continue production'
  }
];

const columns = [
  { header: 'Work Order No', accessor: 'woNo', width: 'min-w-[180px]', sticky: true },
  { header: 'WO Date', accessor: 'woDate', width: 'min-w-[120px]' },
  { header: 'Customer Name', accessor: 'customer', width: 'min-w-[200px]' },
  { header: 'PO No', accessor: 'poNo', width: 'min-w-[140px]' },
  { header: 'PO Date', accessor: 'poDate', width: 'min-w-[120px]' },
  { header: 'Delivery Date', accessor: 'deliveryDate', width: 'min-w-[120px]' },
  { header: 'Production Place', accessor: 'prodPlace', width: 'min-w-[160px]' },
  { header: 'Part Name', accessor: 'partName', width: 'min-w-[220px]' },
  { header: 'Part No', accessor: 'partNo', width: 'min-w-[100px]' },
  { header: 'Approval Stage', accessor: 'stage', width: 'min-w-[140px]', align: 'center' },
  { header: 'Prepared By', accessor: 'preparedBy', width: 'min-w-[150px]' },
  { header: 'Checked By', accessor: 'checkedBy', width: 'min-w-[150px]' },
  { header: 'Approved By', accessor: 'approvedBy', width: 'min-w-[150px]' },
  { header: 'Status', accessor: 'status', width: 'min-w-[120px]' },
  { header: 'Raw Material', accessor: 'rawMaterial', width: 'min-w-[200px]' },
  { header: 'Colour', accessor: 'colour', width: 'min-w-[120px]' },
  { header: 'Compound Code', accessor: 'compoundCode', width: 'min-w-[130px]' },
  { header: 'No. of Cavities', accessor: 'noCavities', width: 'min-w-[100px]', align: 'center' },
  { header: 'Mould No', accessor: 'mouldNo', width: 'min-w-[100px]', align: 'center' },
  { header: 'Shot Weight', accessor: 'shotWeight', width: 'min-w-[100px]', align: 'right' },
  { header: 'Batch Weight (kg)', accessor: 'batchWeight', width: 'min-w-[130px]', align: 'right' },
  { header: 'Total Order Qty (pcs)', accessor: 'orderQty', width: 'min-w-[150px]', align: 'right' },
  { header: 'Total Shots Req', accessor: 'shotsReq', width: 'min-w-[120px]', align: 'right' },
  { header: 'Total Rubber Req (kg)', accessor: 'rubberReq', width: 'min-w-[150px]', align: 'right' },
  { header: 'Batches Req', accessor: 'batchesReq', width: 'min-w-[100px]', align: 'center' },
  { header: 'Shift Target (pcs)', accessor: 'shiftTargetPcs', width: 'min-w-[130px]', align: 'right' },
  { header: 'Shift Target RM (kg)', accessor: 'shiftTargetRm', width: 'min-w-[150px]', align: 'right' },
  { header: 'Total Shift Req', accessor: 'totalShiftReq', width: 'min-w-[120px]', align: 'center' },
  { header: 'Produced Qty', accessor: 'producedQty', width: 'min-w-[120px]', align: 'right' },
  { header: 'Accepted Qty', accessor: 'acceptedQty', width: 'min-w-[120px]', align: 'right' },
  { header: 'Rework Qty', accessor: 'reworkQty', width: 'min-w-[100px]', align: 'right' },
  { header: 'Reject Qty', accessor: 'rejectQty', width: 'min-w-[100px]', align: 'right' },
  { header: 'Short Qty', accessor: 'shortQty', width: 'min-w-[100px]', align: 'right' },
  { header: 'Dispatched Qty', accessor: 'dispatchedQty', width: 'min-w-[130px]', align: 'right' },
  { header: 'Stock Balance', accessor: 'stockBalance', width: 'min-w-[120px]', align: 'right' },
  { header: 'Completion %', accessor: 'completion', width: 'min-w-[110px]', align: 'center' },
  { header: 'Material Issued (kg)', accessor: 'materialIssued', width: 'min-w-[150px]', align: 'right' },
  { header: 'Material Balance (kg)', accessor: 'materialBalance', width: 'min-w-[160px]', align: 'right' },
  { header: 'Remarks', accessor: 'remarks', width: 'min-w-[300px]' },
];

export default function WorkOrderDetailsPage() {
  const [orders, setOrders] = useState(DUMMY_WORK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('identity');

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData(order);
    } else {
      setEditingOrder(null);
      setFormData({
        id: Date.now(),
        woNo: `NPPL/23-24/W0000${orders.length + 1}`,
        woDate: new Date().toISOString().split('T')[0],
        poDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        status: 'Open',
        stage: 'Prepared',
        completion: '0.0%',
        noCavities: 0,
        orderQty: 0,
        shotWeight: 0,
        batchWeight: 0,
        materialIssued: 0,
        producedQty: 0,
        acceptedQty: 0,
        rejectQty: 0,
        reworkQty: 0,
        shortQty: 0,
        dispatchedQty: 0
      });
    }
    setActiveTab('identity');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? formData : o));
    } else {
      setOrders([...orders, formData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this work order master record?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in process': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStageStyle = (stage) => {
    switch (stage) {
      case 'Approved': return 'bg-emerald-600 text-white';
      case 'Checked': return 'bg-indigo-600 text-white';
      case 'Prepared': return 'bg-slate-600 text-white';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const filteredOrders = orders.filter(o =>
    o.woNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.partName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const InputField = ({ label, name, type = 'text', section }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none"
        value={formData[name] || ''}
        onChange={e => setFormData({ ...formData, [name]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
      />
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Header Section */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Work Order Master</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Full CRUD Production Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search master records..."
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 w-64 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus size={18} />
            Add Master Record
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="h-full glass-card rounded-2xl overflow-hidden shadow-2xl pb-4 flex flex-col">
          <div className="flex-1 min-h-0">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Work orders details" className="min-w-[5200px]">
                  <Table.Header>
                    {columns.map((col, idx) => (
                      <Table.Column
                        key={idx}
                        isRowHeader={idx === 0}
                        className="whitespace-nowrap"
                        style={{ minWidth: col.width?.replace('min-w-[', '').replace(']', '') }}
                      >
                        {col.header}
                      </Table.Column>
                    ))}
                    <Table.Column className="w-24 text-center whitespace-nowrap">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body items={filteredOrders} renderEmptyState={() => (
                    <div className="py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                          <SlidersHorizontal size={32} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">No work order records found. Try adjusting your search.</p>
                      </div>
                    </div>
                  )}>
                    {(order) => (
                      <Table.Row key={order.id} className="group">
                        {columns.map((col, colIdx) => {
                          const value = order[col.accessor];
                          const isStatus = col.accessor === 'status';
                          const isWoNo = col.accessor === 'woNo';
                          const isCompletion = col.accessor === 'completion';
                          const isStage = col.accessor === 'stage';
                          return (
                            <Table.Cell key={colIdx} className={`text-[12px] font-semibold text-slate-600 whitespace-nowrap ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}>
                              {isStatus ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getStatusColor(value)}`}>{value?.toUpperCase()}</span>
                              ) : isStage ? (
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getStageStyle(value)}`}>{value || 'PENDING'}</span>
                              ) : isWoNo ? (
                                <span className="text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 whitespace-nowrap">{value}</span>
                              ) : isCompletion ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: value }} />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">{value}</span>
                                </div>
                              ) : (
                                value || '---'
                              )}
                            </Table.Cell>
                          );
                        })}
                        <Table.Cell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                            <button onClick={() => handleOpenModal(order)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all" title="Edit"><Edit2 size={15} /></button>
                            <button onClick={() => handleDelete(order.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all" title="Delete"><Trash2 size={15} /></button>
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
      </div>

      {/* COMPREHENSIVE CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up border border-white">

            {/* Modal Header */}
            <div className="px-8 py-6 bg-slate-900 text-white flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Database size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{editingOrder ? 'Edit Master Record' : 'Add New Master Record'}</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">All 40+ Data Fields Accessible Below</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <TabButton id="identity" label="Identity & PO" icon={Info} />
                <TabButton id="part" label="Part & Mould" icon={Package} />
                <TabButton id="material" label="Material & Comp" icon={Layers} />
                <TabButton id="production" label="Production Targets" icon={TrendingUp} />
                <TabButton id="results" label="Yield & Output" icon={CheckCircle2} />
                <TabButton id="approvals" label="Status & Approvals" icon={ShieldCheck} />
              </div>
            </div>

            {/* Modal Body - Tabbed Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
              {activeTab === 'identity' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <InputField label="Work Order No" name="woNo" />
                  <InputField label="WO Date" name="woDate" type="date" />
                  <InputField label="Customer Name" name="customer" />
                  <InputField label="PO No" name="poNo" />
                  <InputField label="PO Date" name="poDate" type="date" />
                  <InputField label="Delivery Date" name="deliveryDate" type="date" />
                  <InputField label="Production Place" name="prodPlace" />
                </div>
              )}

              {activeTab === 'part' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <InputField label="Part Name" name="partName" />
                  <InputField label="Part No" name="partNo" />
                  <InputField label="No. of Cavities" name="noCavities" type="number" />
                  <InputField label="Mould No" name="mouldNo" />
                  <InputField label="Shot Weight" name="shotWeight" type="number" />
                  <InputField label="Batch Weight (kg)" name="batchWeight" type="number" />
                  <InputField label="Order Qty (pcs)" name="orderQty" type="number" />
                  <InputField label="Total Shots Req" name="shotsReq" type="number" />
                </div>
              )}

              {activeTab === 'material' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <InputField label="Raw Material" name="rawMaterial" />
                  <InputField label="Colour" name="colour" />
                  <InputField label="Compound Code" name="compoundCode" />
                  <InputField label="Total Rubber Req (kg)" name="rubberReq" type="number" />
                  <InputField label="Batches Req" name="batchesReq" type="number" />
                  <InputField label="Material Issued (kg)" name="materialIssued" type="number" />
                  <InputField label="Material Balance (kg)" name="materialBalance" type="number" />
                </div>
              )}

              {activeTab === 'production' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <InputField label="Shift Target (pcs)" name="shiftTargetPcs" type="number" />
                  <InputField label="Shift Target RM (kg)" name="shiftTargetRm" type="number" />
                  <InputField label="Total Shift Required" name="totalShiftReq" type="number" />
                </div>
              )}

              {activeTab === 'results' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <InputField label="Produced Qty" name="producedQty" type="number" />
                  <InputField label="Accepted Qty" name="acceptedQty" type="number" />
                  <InputField label="Rework Qty" name="reworkQty" type="number" />
                  <InputField label="Reject Qty" name="rejectQty" type="number" />
                  <InputField label="Short Qty" name="shortQty" type="number" />
                  <InputField label="Dispatched Qty" name="dispatchedQty" type="number" />
                  <InputField label="Stock Balance" name="stockBalance" type="number" />
                  <InputField label="Completion %" name="completion" />
                </div>
              )}

              {activeTab === 'approvals' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Open">Open</option>
                      <option value="In Process">In Process</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval Stage</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}>
                      <option value="Prepared">Prepared</option>
                      <option value="Checked">Checked</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                  <InputField label="Prepared By" name="preparedBy" />
                  <InputField label="Checked By" name="checkedBy" />
                  <InputField label="Approved By" name="approvedBy" />
                  <div className="col-span-1 md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</label>
                    <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Ensure data accuracy before saving to master registry</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  <Save size={18} />
                  {editingOrder ? 'Update Master' : 'Save to Master'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
