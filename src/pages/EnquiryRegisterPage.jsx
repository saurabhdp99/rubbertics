import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const initialEnquiries = [
  {
    id: 1,
    name: 'Vidyansh',
    companyName: 'Amardiu',
    personName: 'Kundan Deepak',
    designation: '',
    mobileNo: '9021413200',
    emailId: '',
    requirement: 'Solution: Vir Singh',
    remark: '',
  },
  {
    id: 2,
    name: 'Vidyansh',
    companyName: 'S.P',
    personName: 'Bajpai Singh',
    designation: '',
    mobileNo: '9839340959',
    emailId: '',
    requirement: '17 X2 oring, 25 X2.5 oring, 1,00,000 nos minimum',
    remark: 'Simple',
  },
  {
    id: 3,
    name: 'Vidyansh',
    companyName: '',
    personName: 'Rahul Kumar',
    designation: '',
    mobileNo: '9811142426',
    emailId: '',
    requirement: 'Jacket hose, Minicase',
    remark: '',
  },
];

const emptyForm = {
  name: '',
  companyName: '',
  personName: '',
  designation: '',
  mobileNo: '',
  emailId: '',
  requirement: '',
  remark: '',
};

export default function EnquiryRegisterPage() {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = enquiries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.companyName.toLowerCase().includes(q) ||
      e.personName.toLowerCase().includes(q) ||
      e.mobileNo.toLowerCase().includes(q) ||
      e.requirement.toLowerCase().includes(q)
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
    if (confirm('Delete this enquiry?')) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setEnquiries((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...form } : item))
      );
    } else {
      const newId = enquiries.length ? Math.max(...enquiries.map((e) => e.id)) + 1 : 1;
      setEnquiries((prev) => [...prev, { id: newId, ...form }]);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Enquiry Register</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all w-64"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Plus size={16} />
              Add Enquiry
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider w-12">Sr.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Company Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Person Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Designation</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Mobile No</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Email ID</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Requirement</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider">Remark</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-700 font-medium">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-700">{item.name}</td>
                    <td className="px-4 py-3 text-slate-700">{item.companyName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.personName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.designation || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.mobileNo}</td>
                    <td className="px-4 py-3 text-slate-700">{item.emailId || '-'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={item.requirement}>{item.requirement}</td>
                    <td className="px-4 py-3 text-slate-700">{item.remark || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Enquiry' : 'Add Enquiry'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                  <label className={labelClass}>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Person Name</label>
                  <input name="personName" value={form.personName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Designation</label>
                  <input name="designation" value={form.designation} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mobile No</label>
                  <input name="mobileNo" value={form.mobileNo} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email ID</label>
                  <input name="emailId" type="email" value={form.emailId} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Requirement</label>
                  <textarea
                    name="requirement"
                    rows={3}
                    value={form.requirement}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Remark</label>
                  <input name="remark" value={form.remark} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <Save size={16} />
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
