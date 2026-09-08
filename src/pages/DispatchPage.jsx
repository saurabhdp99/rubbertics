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
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Clock,
  Car,
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';
import DispatchForm from '../components/dispatch/DispatchForm';
import { useDispatchStore } from '../store/dispatchStore';

export default function DispatchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    dispatches,
    isFormOpen,
    formMode,
    selectedDispatch,
    openForm,
    closeForm,
    isDeleteConfirmOpen,
    dispatchToDelete,
    setDeleteConfirmOpen,
    deleteDispatch,
    notifications,
  } = useDispatchStore();

  // Dynamic statistics
  const totalQuantity = useMemo(
    () => dispatches.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
    [dispatches]
  );

  const totalDispatches = dispatches.length;
  const uniqueTransporters = useMemo(
    () => [...new Set(dispatches.map((d) => d.transport).filter(Boolean))].length,
    [dispatches]
  );

  const pendingLrCount = useMemo(
    () => dispatches.filter((d) => !d.lrNo || d.dispatchStatus === 'Pending LR Entry').length,
    [dispatches]
  );

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dispatches;
    const q = searchTerm.toLowerCase();
    return dispatches.filter(
      (row) =>
        String(row.invoiceNo || '').toLowerCase().includes(q) ||
        String(row.saleOrderNo || '').toLowerCase().includes(q) ||
        String(row.partyName || '').toLowerCase().includes(q) ||
        String(row.partNo || '').toLowerCase().includes(q) ||
        String(row.materialDescription || '').toLowerCase().includes(q) ||
        String(row.transport || '').toLowerCase().includes(q) ||
        String(row.lrNo || '').toLowerCase().includes(q) ||
        String(row.vehicleNo || '').toLowerCase().includes(q)
    );
  }, [dispatches, searchTerm]);

  // Export to CSV
  const handleExport = () => {
    if (filteredData.length === 0) return;
    const headers = [
      'SR.NO',
      'INV DATE',
      'DELIVERY CHALLAN NO.',
      'SALE ORDER NO',
      'PARTY NAME',
      'PART NO',
      'MATERIAL DESCRIPTION',
      'QUANTITY',
      'TRANSPORT',
      'VEHICLE NO',
      'LR NO',
      'LR DATE',
      'NO OF BAGS',
      'STATUS',
      'DRIVER NAME',
      'DRIVER PHONE',
      'REMARKS',
    ];

    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      const values = [
        row.srNo ?? '',
        `"${row.invDate || ''}"`,
        `"${row.invoiceNo || ''}"`,
        `"${row.saleOrderNo || ''}"`,
        `"${(row.partyName || '').replace(/"/g, '""')}"`,
        `"${row.partNo || ''}"`,
        `"${(row.materialDescription || '').replace(/"/g, '""')}"`,
        row.quantity ?? 0,
        `"${(row.transport || '').replace(/"/g, '""')}"`,
        `"${row.vehicleNo || ''}"`,
        `"${row.lrNo || ''}"`,
        `"${row.lrDate || ''}"`,
        `"${row.noOfBags || ''}"`,
        `"${row.dispatchStatus || ''}"`,
        `"${(row.driverName || '').replace(/"/g, '""')}"`,
        `"${row.driverPhone || ''}"`,
        `"${(row.remarks || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dispatch_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dispatched':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partial Dispatch':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Transit':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Delivered':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Pending LR Entry':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const columns = [
    {
      header: 'SR.NO',
      accessor: 'srNo',
      icon: Hash,
      width: 'w-[70px]',
      align: 'center',
      render: (value) => <span className="font-bold text-slate-700">{value}</span>,
    },
    {
      header: 'INV DATE',
      accessor: 'invDate',
      icon: Calendar,
      width: 'w-[110px]',
      render: (value) => <span className="font-mono text-[12px] text-slate-500">{value}</span>,
    },
    {
      header: 'DELIVERY CHALLAN NO.',
      accessor: 'invoiceNo',
      icon: FileText,
      width: 'w-[150px]',
      render: (value) => (
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'SALE ORDER NO',
      accessor: 'saleOrderNo',
      icon: ClipboardList,
      width: 'w-[160px]',
      render: (value) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 whitespace-nowrap font-mono">
          {value}
        </span>
      ),
    },
    {
      header: 'PARTY NAME',
      accessor: 'partyName',
      icon: Building2,
      width: 'w-[230px]',
      render: (value) => (
        <span className="font-bold text-slate-800 uppercase tracking-tight line-clamp-1" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'PART NO',
      accessor: 'partNo',
      icon: Hash,
      width: 'w-[140px]',
      render: (value) => (
        <span className="font-mono text-[12px] text-slate-600 font-semibold whitespace-nowrap">
          {value || '—'}
        </span>
      ),
    },
    {
      header: 'MATERIAL DESCRIPTION',
      accessor: 'materialDescription',
      icon: PackageSearch,
      width: 'w-[260px]',
      render: (value) => (
        <span className="font-semibold text-slate-700 uppercase tracking-tight line-clamp-1" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      icon: Scale,
      width: 'w-[110px]',
      align: 'right',
      render: (value) => (
        <span className="font-extrabold text-emerald-600 font-mono">
          {Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'TRANSPORT',
      accessor: 'transport',
      icon: Truck,
      width: 'w-[160px]',
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-700 block">{value}</span>
          {row.vehicleNo && (
            <span className="text-[11px] font-mono text-slate-400 block">{row.vehicleNo}</span>
          )}
        </div>
      ),
    },
    {
      header: 'LR.NO',
      accessor: 'lrNo',
      icon: MapPin,
      width: 'w-[110px]',
      render: (value) => (
        <span className="font-mono text-[12px] text-slate-600 font-bold">{value || '—'}</span>
      ),
    },
    {
      header: 'No. Of BAGS',
      accessor: 'noOfBags',
      icon: Boxes,
      width: 'w-[100px]',
      align: 'center',
      render: (value) => <span className="font-bold text-slate-700">{value || '—'}</span>,
    },
    {
      header: 'STATUS',
      accessor: 'dispatchStatus',
      icon: CheckCircle,
      width: 'w-[130px]',
      align: 'center',
      render: (value) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
            value
          )}`}
        >
          {value || 'Dispatched'}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      width: 'w-[120px]',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openForm('view', row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openForm('edit', row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Edit Dispatch"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true, row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Delete Dispatch"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up py-8 px-3 relative min-h-screen">
      {/* Toast Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-6 z-[120] flex flex-col gap-2 pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-[13px] font-semibold text-white pointer-events-auto transition-all animate-fadeIn ${
                n.type === 'error'
                  ? 'bg-red-600'
                  : n.type === 'info'
                  ? 'bg-slate-800'
                  : 'bg-emerald-600'
              }`}
            >
              {n.type === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Conditionally Render Form or Table */}
      {isFormOpen ? (
        <DispatchForm
          mode={formMode}
          dispatch={selectedDispatch}
          onBack={closeForm}
        />
      ) : (
        <>
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
              value={pendingLrCount}
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
              searchPlaceholder="Search by Delivery Challan No., SO No, Party Name, Part No, Transporter..."
              theme="emerald"
              showFilter={false}
              addButtonText="New Dispatch"
              onAdd={() => openForm('add')}
              onExport={handleExport}
            />

            {/* Table */}
            <DataTable
              columns={columns}
              data={filteredData}
              minWidth="1750px"
              emptyMessage="No dispatch records found"
            />

            <TableFooter
              totalEntries={filteredData.length}
              additionalInfo="Dispatch register maintained frontend-side with persistent storage"
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Dispatch Entry</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete invoice{' '}
                <span className="font-bold text-slate-900">
                  {dispatchToDelete?.invoiceNo || 'this entry'}
                </span>{' '}
                for <span className="font-bold text-slate-900">{dispatchToDelete?.partyName || 'the party'}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteDispatch(dispatchToDelete.id)}
                className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
