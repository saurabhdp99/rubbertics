import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, FileText, Package, CheckCircle, FileSpreadsheet, ShieldCheck, Tag, X, Save, Edit, Trash2, Eye } from 'lucide-react';
import { Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import toast from 'react-hot-toast';

import { useMixingProductionStore } from '../store/mixingProductionStore';
import { useAuthStore } from '../store/authStore';
import { useEmployeeMasterStore } from '../store/employeeMasterStore';
import { useCompoundMasterStore } from '../store/compoundMasterStore';

import DataTable from '../components/common/DataTable';
import TableToolbar from '../components/common/TableToolbar';
import CustomDatePicker from '../components/common/CustomDatePicker';

// ----- UTILS & CONSTANTS -----
const todayIsoDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const EMPTY_ENTRY = {
  production_date: todayIsoDate(),
  sr_no: "",
  operator_name: "",
  lot_no: "",
  batch_no: "",
  batch_status: "",
  compound_code: "",
  compound_name: "",
  colour: "",
  standard_sheet_size: "",
  batch_standard_weight: "",
  master_batch_weight: "",
  final_batch_weight: "",
  actual_hardness: "",
  final_weight_variance: "",
  status_verification: "",
  remarks: "",
  operator_signature: "",
  checked_by: "",
  approved_by: "",
};

const entrySchema = z.object({
  production_date: z.any(),
  sr_no: z.string().optional(),
  operator_name: z.string().optional(),
  lot_no: z.string().optional(),
  batch_no: z.string().optional(),
  batch_status: z.string().optional(),
  compound_code: z.string().optional(),
  compound_name: z.string().optional(),
  colour: z.string().optional(),
  standard_sheet_size: z.string().optional(),
  batch_standard_weight: z.string().optional(),
  master_batch_weight: z.string().optional(),
  final_batch_weight: z.string().optional(),
  actual_hardness: z.string().optional(),
  final_weight_variance: z.string().optional(),
  status_verification: z.string().optional(),
  remarks: z.string().optional(),
  operator_signature: z.string().optional(),
  checked_by: z.string().optional(),
  approved_by: z.string().optional(),
});

const baseInputClass = "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px]`;

function Section({ title, icon: Icon, children }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon size={15} className="text-emerald-600" />
        </div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, required, error, colClass = "col-span-1" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${colClass}`}>
      <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
}

const Input = React.forwardRef((props, ref) => <input ref={ref} {...props} />);

function CustomSelect({ field, isView, options, placeholder = "Select..." }) {
  return (
    <select {...field} disabled={isView} className={`${selectCls} appearance-none cursor-pointer disabled:cursor-not-allowed`}>
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((opt, i) => (
        <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  );
}

// ----- FORM COMPONENT -----
function MixingProductionForm({ mode, entry, onBack }) {
  const { currentOrg } = useAuthStore();
  const { addEntry, updateEntry } = useMixingProductionStore();
  
  const { employees, fetchEmployees } = useEmployeeMasterStore();
  const { compounds, fetchCompounds } = useCompoundMasterStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEmployees(currentOrg.id);
      fetchCompounds(currentOrg.id);
    }
  }, [currentOrg]);

  const isView = mode === "view";

  const getInitialValues = () => {
    if (!entry) return EMPTY_ENTRY;
    const sanitized = { ...entry };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null) {
        sanitized[key] = "";
      } else if (typeof sanitized[key] === "number") {
        sanitized[key] = sanitized[key].toString();
      }
    });
    return sanitized;
  };

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: getInitialValues(),
  });

  const onSubmit = async (data) => {
    if (!currentOrg?.id) {
      toast.error("No active organization found");
      return;
    }

    const payload = { ...data };
    const numericFields = [
      'batch_standard_weight', 'master_batch_weight', 'final_batch_weight', 
      'actual_hardness', 'final_weight_variance'
    ];
    
    numericFields.forEach(field => {
      if (payload[field] === "") {
        payload[field] = null;
      } else if (payload[field] !== null && payload[field] !== undefined) {
        payload[field] = parseFloat(payload[field]);
      }
    });

    try {
      let success = false;
      if (mode === 'add') {
        success = await addEntry(payload, currentOrg.id);
      } else if (mode === 'edit') {
        success = await updateEntry(entry.id, payload);
      }
      if (success) {
        onBack();
      }
    } catch (err) {
      toast.error(`Failed to save entry: ${err.message}`);
    }
  };

  const employeeOptions = employees.map(e => e.name);
  const compoundOptions = compounds.map(c => c.name);
  const statusOptions = ["Approved", "Reject", "Hold"];

  return (
    <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100/50 flex items-center justify-center border border-emerald-200/50 text-emerald-600">
            {mode === 'add' ? <Plus size={20} /> : mode === 'edit' ? <Edit size={20} /> : <Eye size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              {mode === 'add' ? 'New Mixing Production Entry' : mode === 'edit' ? 'Edit Mixing Production Entry' : 'View Mixing Production Entry'}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {mode === 'view' ? 'Read-only view' : 'Fill the details below'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <X size={16} /> Back
          </button>
          {!isView && (
            <button
              onClick={handleSubmit(onSubmit)}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <Save size={16} />
              {mode === 'add' ? 'Create Entry' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <form id="mixing-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="flex flex-col gap-7">
          <Section title="1. GENERAL INFORMATION" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Controller name="sr_no" control={control} render={({ field }) => (
                <Field label="SR NO"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter SR NO" /></Field>
              )} />
              <Controller name="production_date" control={control} render={({ field }) => (
                <Field label="Date" error={errors.production_date?.message}><CustomDatePicker field={field} isView={isView} label="Date" /></Field>
              )} />
              <Controller name="operator_name" control={control} render={({ field }) => (
                <Field label="Operator Name"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Operator Name" /></Field>
              )} />
              <Controller name="lot_no" control={control} render={({ field }) => (
                <Field label="Lot No."><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Lot No." /></Field>
              )} />
              <Controller name="batch_no" control={control} render={({ field }) => (
                <Field label="Batch No."><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Batch No." /></Field>
              )} />
              <Controller name="batch_status" control={control} render={({ field }) => (
                <Field label="Batch Status"><CustomSelect field={field} isView={isView} options={statusOptions} placeholder="Select Status" /></Field>
              )} />
            </div>
          </Section>

          <Section title="2. COMPOUND DETAILS" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Controller name="compound_code" control={control} render={({ field }) => (
                <Field label="Compound Code"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Compound Code" /></Field>
              )} />
              <Controller name="compound_name" control={control} render={({ field }) => (
                <Field label="Compound Name"><CustomSelect field={field} isView={isView} options={compoundOptions} placeholder="Select Compound" /></Field>
              )} />
              <Controller name="colour" control={control} render={({ field }) => (
                <Field label="Colour"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Colour" /></Field>
              )} />
              <Controller name="standard_sheet_size" control={control} render={({ field }) => (
                <Field label="Standard Sheet Size"><Input {...field} disabled={isView} className={inputCls} placeholder="Enter Size" /></Field>
              )} />
            </div>
          </Section>

          <Section title="3. BATCH WEIGHT & QUALITY DETAILS" icon={CheckCircle}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Controller name="batch_standard_weight" control={control} render={({ field }) => (
                <Field label="Batch Standard Weight"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
              )} />
              <Controller name="master_batch_weight" control={control} render={({ field }) => (
                <Field label="Master Batch Weight"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
              )} />
              <Controller name="final_batch_weight" control={control} render={({ field }) => (
                <Field label="Final Batch Weight"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
              )} />
              <Controller name="actual_hardness" control={control} render={({ field }) => (
                <Field label="Actual Hardness"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
              )} />
              <Controller name="final_weight_variance" control={control} render={({ field }) => (
                <Field label="Final Weight Variance"><Input {...field} disabled={isView} type="number" className={inputCls} placeholder="0" /></Field>
              )} />
              <Controller name="status_verification" control={control} render={({ field }) => (
                <Field label="Status Verification"><CustomSelect field={field} isView={isView} options={statusOptions} placeholder="Select Status" /></Field>
              )} />
            </div>
          </Section>

          <Section title="4. REMARKS / OBSERVATIONS" icon={FileSpreadsheet}>
            <Controller name="remarks" control={control} render={({ field }) => (
              <Field label="Remarks" colClass="col-span-full">
                <textarea {...field} disabled={isView} className={`${inputCls} px-4 py-3 min-h-[100px] resize-y`} placeholder="Enter any comments or observations..." />
              </Field>
            )} />
          </Section>

          <Section title="5. AUTHORIZATION" icon={ShieldCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Operator Signature</h4>
                <Controller name="operator_signature" control={control} render={({ field }) => (
                  <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                )} />
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Checked By</h4>
                <Controller name="checked_by" control={control} render={({ field }) => (
                  <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                )} />
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><span className="text-emerald-500 mr-1.5 text-lg leading-none mb-0.5">•</span> Approved By</h4>
                <Controller name="approved_by" control={control} render={({ field }) => (
                  <Field label="Name"><CustomSelect field={field} isView={isView} options={employeeOptions} placeholder="Select Employee" /></Field>
                )} />
              </div>
            </div>
          </Section>
        </div>
      </form>
    </div>
  );
}

// ----- PAGE COMPONENT -----
export default function MixingProductionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const { currentOrg } = useAuthStore();
  const { entries, isLoading, fetchEntries, deleteEntry } = useMixingProductionStore();

  useEffect(() => {
    if (currentOrg?.id) fetchEntries(currentOrg.id);
  }, [currentOrg, fetchEntries]);

  const filteredEntries = entries.filter((e) =>
    Object.values(e).some((val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { accessor: "production_date", header: "Date", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
    { accessor: "sr_no", header: "SR NO" },
    { accessor: "batch_no", header: "Batch No." },
    { accessor: "compound_name", header: "Compound" },
    { accessor: "operator_name", header: "Operator" },
    { accessor: "batch_status", header: "Status" },
    {
      accessor: "actions",
      header: "Actions",
      align: "right",
      render: (_, entry) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => { setSelectedEntry(entry); setModalMode("view"); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View">
            <Eye size={16} />
          </button>
          <button onClick={() => { setSelectedEntry(entry); setModalMode("edit"); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => { setEntryToDelete(entry); setDeleteConfirmOpen(true); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-[1600px] mx-auto min-h-screen">
      {!isModalOpen && (
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mixing Production</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 sm:mt-1.5">Manage and track mixing production details</p>
          </div>
        </div>
      )}

      {isModalOpen ? (
        <MixingProductionForm mode={modalMode} entry={selectedEntry} onBack={() => { setModalOpen(false); setSelectedEntry(null); }} />
      ) : (
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pb-4 mt-2">
          <TableToolbar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            searchPlaceholder="Search mixing entries..." 
            onAdd={() => { setSelectedEntry(null); setModalMode("add"); setModalOpen(true); }}
            onExport={() => {}}
          />

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Spinner size="lg" color="success" />
                <p className="mt-4 text-sm font-medium">Loading entries...</p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredEntries} minWidth="1200px" emptyMessage="No mixing production entries found" />
            )}
          </div>
        </div>
      )}

      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-slate-600">
                  Are you sure you want to delete this mixing production entry? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="font-bold">
                  Cancel
                </Button>
                <Button color="danger" onPress={async () => {
                  if (entryToDelete) {
                    await deleteEntry(entryToDelete.id);
                    setDeleteConfirmOpen(false);
                    setEntryToDelete(null);
                  }
                }} className="font-bold shadow-lg shadow-red-500/30">
                  Delete Entry
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
