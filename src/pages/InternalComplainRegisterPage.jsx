import { useState } from 'react';
import { Search, Plus, Trash2, Edit2, X, Save, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { Table } from '@heroui/react';

const initialComplaints = [
  {
    id: 1,
    date: '10.04.206',
    partName: 'Red Grommet',
    improvementPerson: 'AKASH R',
    checkedPersonName: 'Vidnyesh V',
    department: 'Moulding',
    routeCardNo: '--',
    shift: 'Day',
    responsibility: 'Akash R',
    issue: 'In tool all cavity rusty obs.',
    rootCause: 'Tool maintanance not done timly',
    action: '1)Tool cleaning proparly done .\n2)After 10,000 Shot to be maintanance',
  },
];

const emptyForm = {
  date: '',
  partName: '',
  improvementPerson: '',
  checkedPersonName: '',
  department: '',
  routeCardNo: '',
  shift: '',
  responsibility: '',
  issue: '',
  rootCause: '',
  action: '',
};

export default function InternalComplainRegisterPage() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.partName.toLowerCase().includes(q) ||
      c.improvementPerson.toLowerCase().includes(q) ||
      c.issue.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this complaint record?')) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setComplaints((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...form } : item))
      );
    } else {
      const newId = complaints.length ? Math.max(...complaints.map((c) => c.id)) + 1 : 1;
      setComplaints((prev) => [...prev, { id: newId, ...form }]);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800';
  const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1';

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Internal Complain Register</h1>
              <p className="text-xs text-slate-500 font-medium">Manage and track internal quality complaints</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all w-72"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Plus size={16} />
              New Complaint
            </button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Internal complaint register table" className="min-w-[1800px]">
              <Table.Header>
                <Table.Column className="w-16 whitespace-nowrap">SR.NO</Table.Column>
                <Table.Column className="w-28 whitespace-nowrap">DATE</Table.Column>
                <Table.Column className="whitespace-nowrap">PART NAME</Table.Column>
                <Table.Column className="whitespace-nowrap">IMPROVEMENT PERSON</Table.Column>
                <Table.Column className="whitespace-nowrap">CHECKED PERSON</Table.Column>
                <Table.Column className="whitespace-nowrap">DEPARTMENT</Table.Column>
                <Table.Column className="whitespace-nowrap">ROUTE CARD</Table.Column>
                <Table.Column className="w-20 whitespace-nowrap">SHIFT</Table.Column>
                <Table.Column className="whitespace-nowrap">RESPONSIBILITY</Table.Column>
                <Table.Column className="whitespace-nowrap" style={{ minWidth: '220px' }}>ISSUE</Table.Column>
                <Table.Column className="whitespace-nowrap" style={{ minWidth: '220px' }}>ROOT CAUSE</Table.Column>
                <Table.Column className="whitespace-nowrap" style={{ minWidth: '260px' }}>ACTION</Table.Column>
                <Table.Column className="w-24 text-center whitespace-nowrap">ACTIONS</Table.Column>
              </Table.Header>
              <Table.Body items={filtered} renderEmptyState={() => (
                <div className="py-24 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-slate-50 border border-slate-200">
                      <SlidersHorizontal size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium">No complaint records found. Try adjusting your search.</p>
                  </div>
                </div>
              )}>
                {(item) => {
                  const index = filtered.findIndex((entry) => entry.id === item.id);

                  return (
                    <Table.Row key={item.id} className="group">
                      <Table.Cell className="text-slate-500 font-medium">{index + 1}</Table.Cell>
                      <Table.Cell className="text-slate-700 whitespace-nowrap">{item.date}</Table.Cell>
                      <Table.Cell className="font-semibold text-slate-900">{item.partName}</Table.Cell>
                      <Table.Cell className="text-slate-700">{item.improvementPerson}</Table.Cell>
                      <Table.Cell className="text-slate-700">{item.checkedPersonName}</Table.Cell>
                      <Table.Cell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {item.department}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-slate-600 whitespace-nowrap">{item.routeCardNo || '-'}</Table.Cell>
                      <Table.Cell className="text-slate-600 whitespace-nowrap">{item.shift || '-'}</Table.Cell>
                      <Table.Cell className="text-slate-700">{item.responsibility || '-'}</Table.Cell>
                      <Table.Cell className="text-slate-700 leading-relaxed">{item.issue || '-'}</Table.Cell>
                      <Table.Cell className="text-slate-700 leading-relaxed">{item.rootCause || '-'}</Table.Cell>
                      <Table.Cell className="text-slate-700 leading-relaxed whitespace-pre-line">{item.action || '-'}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-center gap-1.5 opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Edit Complaint Record' : 'Add New Complaint Record'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="complaintForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <div>
                    <label className={labelClass}>Date</label>
                    <input name="date" type="text" value={form.date} onChange={handleChange} placeholder="DD.MM.YYYY" className={inputClass} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Part Name</label>
                    <input name="partName" value={form.partName} onChange={handleChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Improvement Person</label>
                    <input name="improvementPerson" value={form.improvementPerson} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Checked Person Name</label>
                    <input name="checkedPersonName" value={form.checkedPersonName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input name="department" value={form.department} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Route Card / Challan No.</label>
                    <input name="routeCardNo" value={form.routeCardNo} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shift</label>
                    <select name="shift" value={form.shift} onChange={handleChange} className={inputClass}>
                      <option value="">Select Shift</option>
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Responsibility</label>
                    <input name="responsibility" value={form.responsibility} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>Issue</label>
                    <textarea
                      name="issue"
                      rows={2}
                      value={form.issue}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>Root Cause</label>
                    <textarea
                      name="rootCause"
                      rows={2}
                      value={form.rootCause}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>Action</label>
                    <textarea
                      name="action"
                      rows={3}
                      value={form.action}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="complaintForm"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Save size={18} />
                {editingId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
