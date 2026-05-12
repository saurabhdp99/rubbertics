import React from 'react';
import { useERPStore } from '../store/erpStore';
import {
  Search, Plus, Filter, Download, Trash2, Eye, Edit, ChevronUp, ChevronDown,
  ChevronsUpDown, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import { Table, Checkbox, Input, Select, Button } from '@heroui/react';

const PRIORITY_STYLES = {
  Urgent: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', dot: '#ef4444' },
  High:   { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', dot: '#f97316' },
  Medium: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', dot: '#f59e0b' },
  Normal: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', dot: '#10b981' },
  Low:    { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#64748b' },
};

const STATUS_STYLES = {
  'Dispatched':       { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'Partial Dispatch': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Pending Dispatch': { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'In Progress':      { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
};

const MANUAL_STATUS_STYLES = {
  Completed:   { text: '#34d399' },
  'In Progress': { text: '#a5b4fc' },
  Pending:     { text: '#f87171' },
};

function SortIcon({ sortDirection }) {
  if (!sortDirection) return <ChevronsUpDown size={12} className="text-slate-600" />;
  return sortDirection === 'ascending'
    ? <ChevronUp size={12} className="text-indigo-400" />
    : <ChevronDown size={12} className="text-indigo-400" />;
}

const COLUMNS = [
  { key: 'date', label: 'Date', width: '90px' },
  { key: 'poNo', label: 'PO No', width: '130px' },
  { key: 'poType', label: 'PO Type', width: '100px' },
  { key: 'partyName', label: 'Party Name', width: '160px' },
  { key: 'partNo', label: 'Part No', width: '120px' },
  { key: 'productName', label: 'Product Name', width: '220px' },
  { key: 'orderQty', label: 'Order Qty', width: '90px' },
  { key: 'dispatchQty', label: 'Dispatch', width: '80px' },
  { key: 'balanceQty', label: 'Balance', width: '80px' },
  { key: 'manualStatus', label: 'Manual Status', width: '110px' },
  { key: 'deliveryDate', label: 'Delivery Date', width: '110px' },
  { key: 'daysLeft', label: 'Days Left', width: '80px' },
  { key: 'priority', label: 'Priority', width: '90px' },
  { key: 'remark', label: 'Remark', width: '120px' },
  { key: 'finalStatus', label: 'Final Status', width: '130px' },
];

const ALL_STATUSES = ['All', 'Dispatched', 'Partial Dispatch', 'Pending Dispatch'];
const ALL_PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Normal', 'Low'];
const ALL_PO_TYPES = ['All', 'Purchase', 'Production'];

export default function OrdersTable() {
  const {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterPoType, setFilterPoType,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    sortField, sortDirection, setSortField,
    selectedOrders, toggleSelectOrder, toggleSelectAll, clearSelection,
    openModal, openDeleteConfirm,
    getFilteredOrders, deleteSelectedOrders,
  } = useERPStore();

  const filtered = getFilteredOrders();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageIds = paged.map(o => o.id);
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedOrders.includes(id));

  return (
    <div className="animate-slide-up flex flex-col gap-6">
      {/* Toolbar */}
      <div className="glass-card rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col xl:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full min-w-0 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              id="search-orders"
              type="text"
              placeholder="Search by PO No, Party, Product, Part No..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            <select
              value={filterPoType}
              onChange={e => setFilterPoType(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 focus:border-emerald-500/50 transition-all outline-none cursor-pointer"
            >
              {ALL_PO_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 focus:border-emerald-500/50 transition-all outline-none cursor-pointer"
            >
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 focus:border-emerald-500/50 transition-all outline-none cursor-pointer"
            >
              {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priority' : p}</option>)}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full xl:w-auto shrink-0">
            {selectedOrders.length > 0 && (
              <button
                onClick={deleteSelectedOrders}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex-1 xl:flex-none justify-center"
              >
                <Trash2 size={16} />
                Delete ({selectedOrders.length})
              </button>
            )}
            <button
              onClick={() => openModal('add')}
              id="btn-add-order"
              className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 flex-1 xl:flex-none"
            >
              <Plus size={18} strokeWidth={2.5} />
              New Order
            </button>
          </div>
        </div>

        {/* Active Filters summary */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Showing <span className="text-slate-800 font-bold px-1">{filtered.length}</span> of <span className="text-slate-800 font-bold px-1">{useERPStore.getState().orders.length}</span> orders</span>
          </div>
          {(searchQuery || filterStatus !== 'All' || filterPriority !== 'All' || filterPoType !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
                setFilterPriority('All');
                setFilterPoType('All');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl pb-4">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Orders table"
              className="min-w-[1400px]"
              sortDescriptor={{ column: sortField, direction: sortDirection === 'asc' ? 'ascending' : 'descending' }}
              onSortChange={(descriptor) => {
                setSortField(descriptor.column);
                setSortDirection(descriptor.direction === 'ascending' ? 'asc' : 'desc');
              }}
              selectedKeys={new Set(selectedOrders)}
              selectionMode="multiple"
              onSelectionChange={(keys) => {
                const newSelected = Array.from(keys).map(k => String(k));
                // Update selection in store
                pageIds.forEach(id => {
                  if (!newSelected.includes(String(id)) && selectedOrders.includes(id)) {
                    toggleSelectOrder(id);
                  } else if (newSelected.includes(String(id)) && !selectedOrders.includes(id)) {
                    toggleSelectOrder(id);
                  }
                });
              }}
            >
              <Table.Header>
                <Table.Column className="w-12">
                  <Checkbox aria-label="Select all" slot="selection">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox>
                </Table.Column>
                <Table.Column className="w-28">Actions</Table.Column>
                {COLUMNS.map((col) => (
                  <Table.Column
                    key={col.key}
                    id={col.key}
                    allowsSorting
                    style={{ minWidth: col.width }}
                  >
                    {({ sortDirection }) => (
                      <span className="flex items-center gap-2">
                        {col.label}
                        <SortIcon sortDirection={sortDirection} />
                      </span>
                    )}
                  </Table.Column>
                ))}
              </Table.Header>
              <Table.Body items={paged} renderEmptyState={() => (
                <div className="py-24 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                      <SlidersHorizontal size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium">No orders found. Try adjusting your filters.</p>
                  </div>
                </div>
              )}>
                {(order) => {
                  const priStyle = PRIORITY_STYLES[order.priority] || PRIORITY_STYLES.Normal;
                  const statusStyle = STATUS_STYLES[order.finalStatus] || {};
                  const mStatusStyle = MANUAL_STATUS_STYLES[order.manualStatus] || {};
                  const isSelected = selectedOrders.includes(order.id);

                  return (
                    <Table.Row key={order.id} id={order.id}>
                      <Table.Cell className="pr-0">
                        <Checkbox
                          aria-label={`Select ${order.poNo}`}
                          slot="selection"
                          variant="secondary"
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openModal('view', order)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openModal('edit', order)}
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(order)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-slate-500 whitespace-nowrap font-mono text-[12px]">{order.date}</Table.Cell>
                      <Table.Cell><span className="text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 whitespace-nowrap">{order.poNo}</span></Table.Cell>
                      <Table.Cell>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${order.poType === 'Purchase' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                          {order.poType}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-slate-700 font-semibold truncate max-w-[160px]" title={order.partyName}>
                        {order.partyName}
                      </Table.Cell>
                      <Table.Cell className="text-slate-500 whitespace-nowrap font-mono text-[12px]">{order.partNo}</Table.Cell>
                      <Table.Cell className="text-slate-700 truncate max-w-[220px]" title={order.productName}>
                        {order.productName}
                      </Table.Cell>
                      <Table.Cell className="text-right text-slate-700 font-bold">{order.orderQty.toLocaleString()}</Table.Cell>
                      <Table.Cell className="text-right text-emerald-600 font-bold">{order.dispatchQty.toLocaleString()}</Table.Cell>
                      <Table.Cell className="text-right font-bold" style={{ color: order.balanceQty > 0 ? '#ef4444' : '#10b981' }}>
                        {order.balanceQty.toLocaleString()}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-semibold" style={{ color: mStatusStyle.text || '#64748b' }}>
                        {order.manualStatus}
                      </Table.Cell>
                      <Table.Cell className="text-slate-500 whitespace-nowrap font-mono text-[12px]">{order.deliveryDate}</Table.Cell>
                      <Table.Cell className="text-center">
                        <span className={`font-bold px-2 py-1 rounded-md ${order.daysLeft <= 3 ? 'bg-red-50 text-red-600 border border-red-200' : order.daysLeft <= 10 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-500'}`}>
                          {order.daysLeft === 0 ? '—' : order.daysLeft}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                          style={{ background: priStyle.bg, color: priStyle.text, border: `1px solid ${priStyle.bg.replace('0.15', '0.3')}` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: priStyle.dot }} />
                          {order.priority}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-slate-600 truncate max-w-[120px]" title={order.remark}>
                        {order.remark || '—'}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm"
                          style={{
                            background: statusStyle.bg || 'rgba(100,116,139,0.12)',
                            color: statusStyle.text || '#64748b',
                            border: `1px solid ${statusStyle.border || 'rgba(100,116,139,0.2)'}`,
                          }}
                        >
                          {order.finalStatus}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg text-slate-700 bg-white border border-slate-200 outline-none focus:border-emerald-500/50 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            <div className="flex items-center gap-1 hidden sm:flex">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm rounded-xl transition-all font-bold ${
                      currentPage === page
                        ? 'text-white bg-emerald-600 border border-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Page <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{currentPage}</span> of{' '}
            <span className="text-slate-800">{totalPages || 1}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
