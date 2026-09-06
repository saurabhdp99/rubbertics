import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers, Plus, Search, Filter, Download, Eye, Edit, Copy, Trash2,
  RefreshCw, CheckCircle2, Clock, AlertCircle, FileText, Printer,
  ArrowLeft, X, Save, Package, Beaker, Wrench, Boxes, Calculator,
  ShieldCheck, FileSpreadsheet, Building2, Factory
} from 'lucide-react';
import { Input, Spinner, Select } from '@heroui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import TableToolbar from '../components/common/TableToolbar';
import DataTable from '../components/common/DataTable';
import TableFooter from '../components/common/TableFooter';
import StatsCard from '../components/common/StatsCard';
import { useAuthStore } from '../store/authStore';
import { useBOMStore } from '../store/bomStore';
import { useItemMasterStore } from '../store/itemMasterStore';
import { useCompoundMasterStore } from '../store/compoundMasterStore';
import { useToolsMasterStore } from '../store/toolsMasterStore';
import { useMachineMasterStore } from '../store/machineMasterStore';
import { useEmployeeMasterStore } from '../store/employeeMasterStore';
import {
  DEFAULT_BOM,
  POLYMER_OPTIONS,
  calculateGrossWeight,
  calculateMaterialYield,
  calculateBOMCost
} from '../data/bomTemplate';

// ─── Styling Constants ────────────────────────────────────────────────────────
const baseInputClass =
  'w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px] cursor-pointer`;

// ─── Reusable Form Sub-Components ─────────────────────────────────────────────
function Section({ title, icon: Icon, children, subtitle }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 pb-7 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon size={15} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, required, error, colClass = 'col-span-1' }) {
  return (
    <label className={`flex flex-col gap-2 relative ${colClass}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </label>
  );
}

// ─── Validation Schema ────────────────────────────────────────────────────────
const bomSchema = z.object({
  bomNo: z.string().optional(),
  bomTitle: z.string().optional(),
  itemCode: z.string().optional(),
  itemName: z.string().min(1, 'Finished Part Name is required'),
  customerPartNo: z.string().optional(),
  drawingNo: z.string().optional(),
  revisionNo: z.string().optional(),
  effectiveDate: z.string().optional(),
  status: z.string().optional(),
  outputUom: z.string().optional(),
  batchQty: z.any().optional(),

  mouldCode: z.string().optional(),
  cavities: z.any().optional(),
  cycleTimeSec: z.any().optional(),
  machinePress: z.string().optional(),

  compoundCode: z.string().optional(),
  compoundName: z.string().optional(),
  polymer: z.string().optional(),
  colour: z.string().optional(),
  hardness: z.string().optional(),
  specificGravity: z.string().optional(),
  netWeight: z.any().optional(),
  scrapPercent: z.any().optional(),
  grossWeight: z.any().optional(),
  compoundRate: z.any().optional(),

  overheadCost: z.any().optional(),
  remarks: z.string().optional(),

  prepared_by: z.string().optional(),
  checked_by: z.string().optional(),
  approved_by: z.string().optional(),
});

// ─── Full-Page BOM Form Component ─────────────────────────────────────────────
function BOMForm({ mode, bom, onBack }) {
  const isView = mode === 'view';
  const { currentOrg } = useAuthStore();
  const { addBOM, updateBOM } = useBOMStore();
  const { items: masterItems, fetchItems, isLoading: isItemsLoading } = useItemMasterStore();
  const { compounds: masterCompounds, fetchCompounds, isLoading: isCompoundsLoading } = useCompoundMasterStore();
  const { tools: masterTools, fetchTools, isLoading: isToolsLoading } = useToolsMasterStore();
  const { machines: masterMachines, fetchMachines, isLoading: isMachinesLoading } = useMachineMasterStore();
  const { employees, fetchEmployees, isLoading: isEmployeesLoading } = useEmployeeMasterStore();

  useEffect(() => {
    const orgId = currentOrg?.id || (() => {
      try {
        const raw = localStorage.getItem('rubbertics_current_org');
        return raw ? JSON.parse(raw)?.id : null;
      } catch (e) {
        return null;
      }
    })();

    if (orgId) {
      if (!masterItems || masterItems.length === 0) fetchItems(orgId);
      if (!masterCompounds || masterCompounds.length === 0) fetchCompounds(orgId);
      if (!masterTools || masterTools.length === 0) fetchTools(orgId);
      if (!masterMachines || masterMachines.length === 0) fetchMachines(orgId);
      if (!employees || employees.length === 0) fetchEmployees(orgId);
    }
  }, [currentOrg?.id, fetchItems, fetchCompounds, fetchTools, fetchMachines, fetchEmployees, masterItems?.length, masterCompounds?.length, masterTools?.length, masterMachines?.length, employees?.length]);

  const [inserts, setInserts] = useState(bom?.inserts ? [...bom.inserts] : []);
  const [packaging, setPackaging] = useState(bom?.packaging ? [...bom.packaging] : []);
  const [routing, setRouting] = useState(bom?.routing ? [...bom.routing] : [...DEFAULT_BOM.routing]);

  const defaultVals = useMemo(() => {
    if (!bom) {
      const yearCode = String(new Date().getFullYear()).slice(-2);
      return {
        ...DEFAULT_BOM,
        bomNo: `BOM-${yearCode}-${String(Date.now()).slice(-3)}`,
      };
    }
    return {
      ...DEFAULT_BOM,
      ...bom,
      batchQty: bom.batchQty?.toString() || '100',
      cavities: bom.cavities?.toString() || '1',
      cycleTimeSec: bom.cycleTimeSec?.toString() || '180',
      netWeight: bom.netWeight?.toString() || '',
      scrapPercent: bom.scrapPercent?.toString() || '10',
      grossWeight: bom.grossWeight?.toString() || '',
      compoundRate: bom.compoundRate?.toString() || '',
      overheadCost: bom.overheadCost?.toString() || '0',
    };
  }, [bom]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bomSchema),
    defaultValues: defaultVals,
  });

  const watchAll = watch();

  // Auto Calculations for Gross Weight & Rubber Cost
  useEffect(() => {
    if (isView) return;
    const net = parseFloat(watchAll.netWeight) || 0;
    const scrap = parseFloat(watchAll.scrapPercent) || 0;
    if (net > 0) {
      const gross = calculateGrossWeight(net, scrap);
      if (watchAll.grossWeight !== gross.toString()) {
        setValue('grossWeight', gross.toString());
      }
    }
  }, [watchAll.netWeight, watchAll.scrapPercent, isView, setValue, watchAll.grossWeight]);

  // Handle Finished Item Selection
  const handleItemSelect = (e, fieldOnChange) => {
    fieldOnChange?.(e);
    const itemCode = e.target.value;
    setValue('itemCode', itemCode, { shouldValidate: true, shouldDirty: true });
    const found = masterItems?.find(it => (it.itemCode || it.item_code) === itemCode);
    if (found) {
      const itName = found.itemName || found.customerItemName || found.item_name || '';
      setValue('itemName', itName, { shouldValidate: true, shouldDirty: true });
      setValue('customerPartNo', found.customerItemCode || found.customer_item_code || '', { shouldDirty: true });
      setValue('drawingNo', found.drawingNo || found.drawing_no || '', { shouldDirty: true });
      if (found.revisionNo || found.revision_no) setValue('revisionNo', found.revisionNo || found.revision_no, { shouldDirty: true });
      if (found.itemNetWeight || found.net_weight) {
        setValue('netWeight', String(found.itemNetWeight || found.net_weight), { shouldValidate: true, shouldDirty: true });
      }
      if (!watchAll.bomTitle) {
        setValue('bomTitle', `${itName || itemCode} Standard BOM`, { shouldDirty: true });
      }
    }
  };

  // Handle Compound Selection
  const handleCompoundSelect = (e, fieldOnChange) => {
    fieldOnChange?.(e);
    const compoundCode = e.target.value;
    setValue('compoundCode', compoundCode, { shouldValidate: true, shouldDirty: true });
    const found = masterCompounds?.find(c => (c.compoundCode || c.compound_code) === compoundCode);
    if (found) {
      setValue('compoundName', found.compoundName || found.compound_name || '', { shouldValidate: true, shouldDirty: true });
      if (found.polymer) setValue('polymer', found.polymer, { shouldDirty: true });
      if (found.compoundColour || found.compound_colour) setValue('colour', found.compoundColour || found.compound_colour, { shouldDirty: true });
      if (found.hardnessShoreA || found.hardness) setValue('hardness', String(found.hardnessShoreA || found.hardness), { shouldDirty: true });
      if (found.specificGravity || found.specific_gravity) setValue('specificGravity', String(found.specificGravity || found.specific_gravity), { shouldDirty: true });
    }
  };

  // Handle Tool / Mould Selection
  const handleToolSelect = (e, fieldOnChange) => {
    fieldOnChange?.(e);
    const toolCode = e.target.value;
    setValue('mouldCode', toolCode, { shouldValidate: true, shouldDirty: true });
    const found = masterTools?.find(t => (t.toolCode || t.tool_code) === toolCode);
    if (found) {
      if (found.numberOfCavities || found.number_of_cavities) {
        setValue('cavities', String(found.numberOfCavities || found.number_of_cavities), { shouldDirty: true });
      }
      if (found.cycleTime) {
        setValue('cycleTimeSec', String(parseFloat(found.cycleTime) || 180), { shouldDirty: true });
      }
    }
  };

  // Dynamic Inserts Helpers
  const addInsertRow = () => {
    setInserts(prev => [
      ...prev,
      { id: `ins-${Date.now()}`, partName: '', material: '', qty: 1, surfaceTreatment: 'Degreased', primer: 'Chemlok 205 + 6125', unitCost: 0 }
    ]);
  };
  const updateInsert = (id, field, val) => {
    setInserts(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };
  const removeInsert = (id) => {
    setInserts(prev => prev.filter(item => item.id !== id));
  };

  // Dynamic Packaging Helpers
  const addPackagingRow = () => {
    setPackaging(prev => [
      ...prev,
      { id: `pkg-${Date.now()}`, materialName: '', packQty: 100, costPerPack: 0 }
    ]);
  };
  const updatePackaging = (id, field, val) => {
    setPackaging(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };
  const removePackaging = (id) => {
    setPackaging(prev => prev.filter(item => item.id !== id));
  };

  // Dynamic Routing Helpers
  const addRoutingStep = () => {
    const nextNo = (routing.length + 1) * 10;
    setRouting(prev => [
      ...prev,
      { stepNo: nextNo, operation: '', workCenter: 'Production Floor', cycleTimeMin: 2, notes: '' }
    ]);
  };
  const updateRouting = (idx, field, val) => {
    const copy = [...routing];
    copy[idx] = { ...copy[idx], [field]: val };
    setRouting(copy);
  };
  const removeRouting = (idx) => {
    const copy = [...routing];
    copy.splice(idx, 1);
    setRouting(copy);
  };

  // Live Costing Engine
  const liveCost = useMemo(() => {
    const grossGrams = parseFloat(watchAll.grossWeight) || 0;
    const ratePerKg = parseFloat(watchAll.compoundRate) || 0;
    const rubberCost = (grossGrams / 1000) * ratePerKg;

    const insertsCost = inserts.reduce((acc, ins) => {
      const q = parseFloat(ins.qty) || 0;
      const c = parseFloat(ins.unitCost) || 0;
      return acc + (q * c);
    }, 0);

    const packagingCost = packaging.reduce((acc, pkg) => {
      const pq = parseFloat(pkg.packQty) || 1;
      const cp = parseFloat(pkg.costPerPack) || 0;
      return acc + (pq > 0 ? cp / pq : 0);
    }, 0);

    const overhead = parseFloat(watchAll.overheadCost) || 0;
    const totalUnit = rubberCost + insertsCost + packagingCost + overhead;
    const batchQ = parseFloat(watchAll.batchQty) || 100;

    return {
      rubberCost: Math.round(rubberCost * 100) / 100,
      insertsCost: Math.round(insertsCost * 100) / 100,
      packagingCost: Math.round(packagingCost * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      totalUnitCost: Math.round(totalUnit * 100) / 100,
      totalBatchCost: Math.round((totalUnit * batchQ) * 100) / 100,
    };
  }, [watchAll.grossWeight, watchAll.compoundRate, watchAll.overheadCost, watchAll.batchQty, inserts, packaging]);

  const yieldPct = useMemo(() => {
    return calculateMaterialYield(watchAll.netWeight, watchAll.grossWeight);
  }, [watchAll.netWeight, watchAll.grossWeight]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      inserts,
      packaging,
      routing,
      netWeight: parseFloat(data.netWeight) || 0,
      scrapPercent: parseFloat(data.scrapPercent) || 0,
      grossWeight: parseFloat(data.grossWeight) || 0,
      compoundRate: parseFloat(data.compoundRate) || 0,
      batchQty: parseInt(data.batchQty) || 100,
      cavities: parseInt(data.cavities) || 1,
      cycleTimeSec: parseFloat(data.cycleTimeSec) || 180,
      overheadCost: parseFloat(data.overheadCost) || 0,
    };

    if (mode === 'edit') {
      updateBOM(bom.id, payload);
    } else {
      addBOM(payload);
    }
    onBack();
  };

  return (
    <div className="animate-slide-up">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        
        {/* Form Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 flex items-center justify-center transition-all cursor-pointer"
              title="Back to table"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-200 shadow-lg shadow-emerald-500/10">
              {isView ? <Eye size={24} className="text-emerald-600" /> : <Layers size={24} className="text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView ? 'View Bill of Materials' : mode === 'add' ? 'New Bill of Materials' : 'Edit Bill of Materials'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watchAll.bomNo ? `BOM No: ${watchAll.bomNo} · ${watchAll.revisionNo || 'Rev 1.0'}` : 'Fill the compound and production specifications'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X size={16} />
              Back
            </button>

            {isView && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Printer size={16} />
                Print Spec Sheet
              </button>
            )}

            {!isView && (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <Save size={16} />
                {mode === 'add' ? 'Create BOM' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form className="p-6 md:p-8 space-y-8 bg-white">

          {/* 1. GENERAL & FINISHED ITEM DETAILS */}
          <Section title="1. GENERAL & FINISHED ITEM DETAILS" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <Controller name="bomNo" control={control} render={({ field }) => (
                <Field label="BOM Number">
                  <input {...field} disabled={isView} className={inputCls} placeholder="Auto-generated if blank" />
                </Field>
              )} />

              <Controller name="bomTitle" control={control} render={({ field }) => (
                <Field label="BOM Description / Title" colClass="md:col-span-2 xl:col-span-2">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. Engine Mounting Bush Assembly" />
                </Field>
              )} />

              <Controller name="status" control={control} render={({ field }) => (
                <Field label="Status">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                </Field>
              )} />

              {/* Finished Item link */}
              <Controller name="itemCode" control={control} render={({ field }) => (
                <Field label="Finished Item Code (Item Master)">
                  <select
                    {...field}
                    onChange={(e) => handleItemSelect(e, field.onChange)}
                    disabled={isView}
                    className={selectCls}
                  >
                    <option value="">{isItemsLoading ? 'Loading items...' : 'Select Item from Master'}</option>
                    {field.value && !masterItems?.some(it => (it.itemCode || it.item_code) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {masterItems?.map(it => {
                      const code = it.itemCode || it.item_code;
                      const name = it.itemName || it.customerItemName || it.item_name || '';
                      return (
                        <option key={it.id || code} value={code}>
                          {code} - {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />

              <Controller name="itemName" control={control} render={({ field }) => (
                <Field label="Finished Part Name" required error={errors.itemName?.message}>
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. Engine Mounting Bush Type-A" />
                </Field>
              )} />

              <Controller name="customerPartNo" control={control} render={({ field }) => (
                <Field label="Customer Part No.">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. HY-ENG-98442" />
                </Field>
              )} />

              <Controller name="drawingNo" control={control} render={({ field }) => (
                <Field label="Drawing No.">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. DWG-ENG-MNT-01" />
                </Field>
              )} />

              <Controller name="revisionNo" control={control} render={({ field }) => (
                <Field label="Revision No.">
                  <input {...field} disabled={isView} className={inputCls} placeholder="Rev 1.0" />
                </Field>
              )} />

              <Controller name="outputUom" control={control} render={({ field }) => (
                <Field label="Output UOM">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="Pcs">Pcs</option>
                    <option value="Kgs">Kgs</option>
                    <option value="Mtrs">Mtrs</option>
                    <option value="Sets">Sets</option>
                  </select>
                </Field>
              )} />

              <Controller name="batchQty" control={control} render={({ field }) => (
                <Field label="Standard Batch Qty">
                  <input {...field} disabled={isView} type="number" className={inputCls} placeholder="100" />
                </Field>
              )} />

              <Controller name="effectiveDate" control={control} render={({ field }) => (
                <Field label="Effective Date">
                  <input {...field} disabled={isView} type="date" className={inputCls} />
                </Field>
              )} />
            </div>

            {/* Tooling & Press */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-4 pt-4 border-t border-slate-100">
              <Controller name="mouldCode" control={control} render={({ field }) => (
                <Field label="Mould / Tool No. (Tools Master)">
                  <select
                    {...field}
                    onChange={(e) => handleToolSelect(e, field.onChange)}
                    disabled={isView}
                    className={selectCls}
                  >
                    <option value="">{isToolsLoading ? 'Loading tools...' : 'Select Tool / Mould'}</option>
                    {field.value && !masterTools?.some(t => (t.toolCode || t.tool_code) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {masterTools?.map(t => {
                      const code = t.toolCode || t.tool_code;
                      const name = t.toolName || t.tool_name;
                      const cav = t.numberOfCavities || t.number_of_cavities || 1;
                      return (
                        <option key={t.id || code} value={code}>
                          {code} {name ? `- ${name}` : ''} ({cav} Cav)
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />

              <Controller name="cavities" control={control} render={({ field }) => (
                <Field label="No. of Cavities">
                  <input {...field} disabled={isView} type="number" className={inputCls} placeholder="1" />
                </Field>
              )} />

              <Controller name="cycleTimeSec" control={control} render={({ field }) => (
                <Field label="Cycle Time (Seconds)">
                  <input {...field} disabled={isView} type="number" className={inputCls} placeholder="180" />
                </Field>
              )} />

              <Controller name="machinePress" control={control} render={({ field }) => (
                <Field label="Machine / Press (Machine Master)">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="">{isMachinesLoading ? 'Loading machines...' : 'Select Press / Extruder'}</option>
                    {field.value && !masterMachines?.some(m => (m.machineCode || m.machine_code) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {masterMachines?.map(m => {
                      const code = m.machineCode || m.machine_code;
                      const name = m.machineName || m.machine_name;
                      return (
                        <option key={m.id || code} value={code}>
                          {code} - {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />
            </div>
          </Section>

          {/* 2. RUBBER COMPOUND & WEIGHT CALCULATIONS */}
          <Section title="2. RUBBER COMPOUND & WEIGHT CALCULATIONS" icon={Beaker} subtitle="Gross weight and rubber cost are auto-calculated from net weight and scrap allowance">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <Controller name="compoundCode" control={control} render={({ field }) => (
                <Field label="Compound Code (Compound Master)">
                  <select
                    {...field}
                    onChange={(e) => handleCompoundSelect(e, field.onChange)}
                    disabled={isView}
                    className={selectCls}
                  >
                    <option value="">{isCompoundsLoading ? 'Loading compounds...' : 'Select Compound'}</option>
                    {field.value && !masterCompounds?.some(c => (c.compoundCode || c.compound_code) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {masterCompounds?.map(c => {
                      const code = c.compoundCode || c.compound_code;
                      const name = c.compoundName || c.compound_name;
                      return (
                        <option key={c.id || code} value={code}>
                          {code} - {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />

              <Controller name="compoundName" control={control} render={({ field }) => (
                <Field label="Compound Name / Grade">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. High Resilient NR-65" />
                </Field>
              )} />

              <Controller name="polymer" control={control} render={({ field }) => (
                <Field label="Base Polymer">
                  <select {...field} disabled={isView} className={selectCls}>
                    {POLYMER_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              )} />

              <Controller name="colour" control={control} render={({ field }) => (
                <Field label="Colour">
                  <input {...field} disabled={isView} className={inputCls} placeholder="Black, Red, Brown..." />
                </Field>
              )} />

              <Controller name="hardness" control={control} render={({ field }) => (
                <Field label="Hardness (Shore A)">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. 65 ± 5" />
                </Field>
              )} />

              <Controller name="netWeight" control={control} render={({ field }) => (
                <Field label="Net Rubber Weight (g)">
                  <input {...field} disabled={isView} type="number" step="0.01" className={inputCls} placeholder="0.00" />
                </Field>
              )} />

              <Controller name="scrapPercent" control={control} render={({ field }) => (
                <Field label="Flash / Scrap Allowance (%)">
                  <input {...field} disabled={isView} type="number" step="0.5" className={inputCls} placeholder="10" />
                </Field>
              )} />

              <Controller name="grossWeight" control={control} render={({ field }) => (
                <Field label="Gross Weight per Piece (g)">
                  <input {...field} disabled readOnly className={`${inputCls} bg-emerald-50 text-emerald-800 font-extrabold`} placeholder="Auto calculated" />
                </Field>
              )} />

              <Controller name="compoundRate" control={control} render={({ field }) => (
                <Field label="Compound Rate (₹ / kg)">
                  <input {...field} disabled={isView} type="number" step="1" className={inputCls} placeholder="e.g. 180" />
                </Field>
              )} />

              <Field label="Rubber Cost per Piece (₹)">
                <input
                  value={`₹${liveCost.rubberCost.toFixed(2)}`}
                  disabled
                  readOnly
                  className={`${inputCls} bg-emerald-50 text-emerald-800 font-extrabold`}
                />
              </Field>

              <Field label="Material Yield (%)">
                <input
                  value={`${yieldPct}%`}
                  disabled
                  readOnly
                  className={`${inputCls} bg-emerald-50 text-emerald-800 font-extrabold`}
                />
              </Field>
            </div>
          </Section>

          {/* 3. INSERTS & SUB-COMPONENTS (RUBBER-TO-METAL BONDING) */}
          <Section title="3. INSERTS & SUB-COMPONENTS (RUBBER-TO-METAL BONDING)" icon={Layers} subtitle="Add metal bushes, sleeves, stamping plates, springs and Chemlok bonding primers">
            <div className="space-y-3">
              {!isView && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addInsertRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Insert Row
                  </button>
                </div>
              )}

              {inserts.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  No metal inserts or sub-components added for this part.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-bold">
                      <tr>
                        <th className="p-3">Insert Name / Description</th>
                        <th className="p-3 w-36">Material</th>
                        <th className="p-3 w-20 text-center">Qty/Pc</th>
                        <th className="p-3 w-48">Bonding Primer (Chemlok)</th>
                        <th className="p-3 w-28 text-right">Unit Cost (₹)</th>
                        <th className="p-3 w-28 text-right">Total (₹)</th>
                        {!isView && <th className="p-3 w-12 text-center"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inserts.map(ins => {
                        const sub = (parseFloat(ins.qty) || 0) * (parseFloat(ins.unitCost) || 0);
                        return (
                          <tr key={ins.id} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <input
                                disabled={isView}
                                value={ins.partName}
                                onChange={(e) => updateInsert(ins.id, 'partName', e.target.value)}
                                placeholder="e.g. Inner MS Bush OD 22mm"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                value={ins.material}
                                onChange={(e) => updateInsert(ins.id, 'material', e.target.value)}
                                placeholder="e.g. EN1A"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                type="number"
                                min="1"
                                value={ins.qty}
                                onChange={(e) => updateInsert(ins.id, 'qty', e.target.value)}
                                className="w-full px-2 py-1.5 text-center border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                value={ins.primer}
                                onChange={(e) => updateInsert(ins.id, 'primer', e.target.value)}
                                placeholder="e.g. Chemlok 205 + 6125"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                type="number"
                                step="0.5"
                                value={ins.unitCost}
                                onChange={(e) => updateInsert(ins.id, 'unitCost', e.target.value)}
                                className="w-full px-2 py-1.5 text-right border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-800">
                              ₹{sub.toFixed(2)}
                            </td>
                            {!isView && (
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeInsert(ins.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Total Inserts & Bonding Cost:</span>
                    <span className="text-emerald-700 text-sm">₹{liveCost.insertsCost.toFixed(2)} / piece</span>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* 4. PACKAGING MATERIALS */}
          <Section title="4. PACKAGING MATERIALS" icon={Boxes} subtitle="Corrugated boxes, poly liner bags, and barcode shipping labels">
            <div className="space-y-3">
              {!isView && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addPackagingRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Packaging Row
                  </button>
                </div>
              )}

              {packaging.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  No packaging materials specified.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-bold">
                      <tr>
                        <th className="p-3">Packaging Material</th>
                        <th className="p-3 w-32 text-center">Standard Pack Qty</th>
                        <th className="p-3 w-36 text-right">Cost per Pack (₹)</th>
                        <th className="p-3 w-36 text-right">Cost / Piece (₹)</th>
                        {!isView && <th className="p-3 w-12 text-center"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packaging.map(pkg => {
                        const pq = parseFloat(pkg.packQty) || 1;
                        const cp = parseFloat(pkg.costPerPack) || 0;
                        const perPc = pq > 0 ? cp / pq : 0;
                        return (
                          <tr key={pkg.id} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <input
                                disabled={isView}
                                value={pkg.materialName}
                                onChange={(e) => updatePackaging(pkg.id, 'materialName', e.target.value)}
                                placeholder="e.g. 5-Ply Corrugated Box (400x300x200mm)"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                type="number"
                                min="1"
                                value={pkg.packQty}
                                onChange={(e) => updatePackaging(pkg.id, 'packQty', e.target.value)}
                                className="w-full px-2 py-1.5 text-center border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                disabled={isView}
                                type="number"
                                step="0.5"
                                value={pkg.costPerPack}
                                onChange={(e) => updatePackaging(pkg.id, 'costPerPack', e.target.value)}
                                className="w-full px-2 py-1.5 text-right border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-800">
                              ₹{perPc.toFixed(2)}
                            </td>
                            {!isView && (
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removePackaging(pkg.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Total Packaging Cost:</span>
                    <span className="text-emerald-700 text-sm">₹{liveCost.packagingCost.toFixed(2)} / piece</span>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* 5. MANUFACTURING PROCESS ROUTING */}
          <Section title="5. MANUFACTURING PROCESS ROUTING" icon={Clock} subtitle="Sequential shop-floor operations from slug preparation to 100% final QC">
            <div className="space-y-3">
              {!isView && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addRoutingStep}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Operation Step
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {routing.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-1">
                      {step.stepNo || (idx + 1) * 10}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operation</label>
                        <input
                          disabled={isView}
                          value={step.operation}
                          onChange={(e) => updateRouting(idx, 'operation', e.target.value)}
                          placeholder="e.g. Moulding Press Cycle"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Work Center</label>
                        <input
                          disabled={isView}
                          value={step.workCenter}
                          onChange={(e) => updateRouting(idx, 'workCenter', e.target.value)}
                          placeholder="e.g. Press Shop"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cycle Time (Mins)</label>
                        <input
                          disabled={isView}
                          type="number"
                          step="0.5"
                          value={step.cycleTimeMin}
                          onChange={(e) => updateRouting(idx, 'cycleTimeMin', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <input
                          disabled={isView}
                          value={step.notes || ''}
                          onChange={(e) => updateRouting(idx, 'notes', e.target.value)}
                          placeholder="Special instructions, cure temp, inspection criteria..."
                          className="w-full px-3 py-1 text-xs text-slate-600 border border-slate-100 rounded-md outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {!isView && (
                      <button
                        type="button"
                        onClick={() => removeRouting(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 mt-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 6. STANDARD COST & YIELD ANALYSIS */}
          <Section title="6. STANDARD COST & YIELD ANALYSIS" icon={Calculator} subtitle="Reconciliation of material, inserts, packaging, and factory machine overhead">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rubber Material</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">₹{liveCost.rubberCost.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{watchAll.grossWeight || 0}g @ ₹{watchAll.compoundRate || 0}/kg</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inserts & Bonding</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">₹{liveCost.insertsCost.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{inserts.length} components</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Packaging Cost</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">₹{liveCost.packagingCost.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Box & bags per pc</span>
              </div>

              <Controller name="overheadCost" control={control} render={({ field }) => (
                <Field label="Overhead Cost (₹/pc)">
                  <input {...field} disabled={isView} type="number" step="0.5" className={inputCls} placeholder="0.00" />
                </Field>
              )} />

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Total Est. Unit Cost</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">₹{liveCost.totalUnitCost.toFixed(2)}</span>
                <span className="text-[11px] text-emerald-600 mt-0.5 block">Per finished {watchAll.outputUom || 'piece'}</span>
              </div>
            </div>
          </Section>

          {/* 7. AUTHORIZATION & REMARKS */}
          <Section title="7. AUTHORIZATION & REMARKS" icon={ShieldCheck}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <Controller name="prepared_by" control={control} render={({ field }) => (
                <Field label="Prepared By">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="">{isEmployeesLoading ? 'Loading employees...' : 'Select Employee'}</option>
                    {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {employees?.map(e => {
                      const name = e.employeeName || e.employee_name;
                      return (
                        <option key={e.id || e.employeeId || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />

              <Controller name="checked_by" control={control} render={({ field }) => (
                <Field label="Checked By (QA)">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="">{isEmployeesLoading ? 'Loading employees...' : 'Select Employee'}</option>
                    {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {employees?.map(e => {
                      const name = e.employeeName || e.employee_name;
                      return (
                        <option key={e.id || e.employeeId || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />

              <Controller name="approved_by" control={control} render={({ field }) => (
                <Field label="Approved By (Plant Lead)">
                  <select {...field} disabled={isView} className={selectCls}>
                    <option value="">{isEmployeesLoading ? 'Loading employees...' : 'Select Employee'}</option>
                    {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                      <option value={field.value}>{field.value} (Current)</option>
                    )}
                    {employees?.map(e => {
                      const name = e.employeeName || e.employee_name;
                      return (
                        <option key={e.id || e.employeeId || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              )} />
            </div>

            <Controller name="remarks" control={control} render={({ field }) => (
              <Field label="Engineering Remarks / Special Instructions">
                <textarea
                  {...field}
                  disabled={isView}
                  className={`${baseInputClass} px-4 py-3 min-h-[90px] resize-y`}
                  placeholder="Enter any engineering instructions, quality notes, or OEM compliance remarks..."
                />
              </Field>
            )} />
          </Section>

        </form>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function BillOfMaterialsPage() {
  const { currentOrg } = useAuthStore();
  const { fetchItems } = useItemMasterStore();
  const { fetchCompounds } = useCompoundMasterStore();
  const { fetchTools } = useToolsMasterStore();
  const { fetchMachines } = useMachineMasterStore();
  const { fetchEmployees } = useEmployeeMasterStore();

  useEffect(() => {
    const orgId = currentOrg?.id || (() => {
      try {
        const raw = localStorage.getItem('rubbertics_current_org');
        return raw ? JSON.parse(raw)?.id : null;
      } catch (e) {
        return null;
      }
    })();

    if (orgId) {
      fetchItems(orgId);
      fetchCompounds(orgId);
      fetchTools(orgId);
      fetchMachines(orgId);
      fetchEmployees(orgId);
    }
  }, [currentOrg?.id, fetchItems, fetchCompounds, fetchTools, fetchMachines, fetchEmployees]);

  const {
    boms,
    notifications,
    deleteBOM,
    duplicateBOM,
    exportToCSV,
  } = useBOMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bomToDelete, setBomToDelete] = useState(null);

  // Filter BOMs by search term
  const filteredBOMs = useMemo(() => {
    if (!searchTerm.trim()) return boms;
    const q = searchTerm.toLowerCase().trim();
    return boms.filter(b =>
      b.bomNo?.toLowerCase().includes(q) ||
      b.bomTitle?.toLowerCase().includes(q) ||
      b.itemName?.toLowerCase().includes(q) ||
      b.itemCode?.toLowerCase().includes(q) ||
      b.customerPartNo?.toLowerCase().includes(q) ||
      b.compoundName?.toLowerCase().includes(q) ||
      b.compoundCode?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  }, [boms, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = boms.length;
    const active = boms.filter(b => b.status === 'Active').length;
    const drafts = boms.filter(b => b.status === 'Draft' || b.status === 'Under Review').length;

    let totalYield = 0;
    let count = 0;
    boms.forEach(b => {
      const y = calculateMaterialYield(b.netWeight, b.grossWeight);
      if (y > 0 && y <= 100) {
        totalYield += y;
        count++;
      }
    });

    const avgYield = count > 0 ? (totalYield / count).toFixed(1) : 0;
    return { total, active, drafts, avgYield };
  }, [boms]);

  const handleAdd = () => {
    setSelectedBOM(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleEdit = (entry) => {
    setSelectedBOM(entry);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleView = (entry) => {
    setSelectedBOM(entry);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleDuplicate = (entry) => {
    duplicateBOM(entry.id);
  };

  const handleDelete = () => {
    if (bomToDelete) {
      deleteBOM(bomToDelete.id);
      setDeleteConfirmOpen(false);
      setBomToDelete(null);
    }
  };

  // DataTable Columns matching exact Rubbertics layout
  const columns = [
    {
      accessor: 'bomNo',
      header: 'BOM No.',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-emerald-700 uppercase font-mono">{val}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
            {row.revisionNo || 'Rev 1.0'}
          </span>
        </div>
      ),
    },
    {
      accessor: 'itemName',
      header: 'Finished Product',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-800 block">{val}</span>
          <span className="text-[11px] text-slate-500 font-mono">{row.itemCode || '-'} {row.customerPartNo ? `· ${row.customerPartNo}` : ''}</span>
        </div>
      ),
    },
    {
      accessor: 'compoundCode',
      header: 'Compound & Polymer',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{val || row.compoundName || '-'}</span>
          <span className="text-[11px] text-slate-500">{row.polymer} · {row.colour}</span>
        </div>
      ),
    },
    {
      accessor: 'netWeight',
      header: 'Net / Gross Wt (g)',
      align: 'right',
      render: (_, row) => (
        <div className="text-right font-medium">
          <span className="font-bold text-slate-900">{row.netWeight}g</span>
          <span className="text-slate-400 text-[11px] block">Gross: {row.grossWeight}g</span>
        </div>
      ),
    },
    {
      accessor: 'mouldCode',
      header: 'Mould / Cavities',
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-700 block">{val || 'Standard Mould'}</span>
          <span className="text-[11px] text-slate-500">{row.cavities || 1} Cav · {row.cycleTimeSec || 180}s</span>
        </div>
      ),
    },
    {
      accessor: 'unitCost',
      header: 'Est. Unit Cost',
      align: 'right',
      render: (_, row) => {
        const cost = calculateBOMCost(row);
        return (
          <div className="text-right">
            <span className="font-extrabold text-emerald-700 block">₹{cost.totalUnitCost.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">per {row.outputUom || 'pc'}</span>
          </div>
        );
      },
    },
    {
      accessor: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => {
        const badgeClass =
          val === 'Active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : val === 'Under Review'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : val === 'Obsolete'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badgeClass}`}>
            {val || 'Draft'}
          </span>
        );
      },
    },
    {
      accessor: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, entry) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleView(entry)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(entry)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit BOM"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDuplicate(entry)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Duplicate as new revision"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => { setBomToDelete(entry); setDeleteConfirmOpen(true); }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-[1600px] mx-auto min-h-screen">

      {/* Notifications Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-semibold text-white pointer-events-auto transition-all animate-fadeIn ${
                n.type === 'error' ? 'bg-red-600' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}
            >
              {n.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Page Title & Stats (Only shown when not in form mode) */}
      {!isFormOpen && (
        <>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bill of Materials</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 sm:mt-1.5">Manage compound formulations, inserts, packaging and process routing</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Total BOMs" value={stats.total.toString()} color="#10b981" />
            <StatsCard label="Active BOMs" value={stats.active.toString()} color="#6366f1" />
            <StatsCard label="Under Review / Draft" value={stats.drafts.toString()} color="#f59e0b" />
            <StatsCard label="Avg Yield %" value={`${stats.avgYield}%`} color="#14b8a6" />
          </div>
        </>
      )}

      {/* View Switcher: Table View vs Full-Page Form View */}
      {isFormOpen ? (
        <BOMForm
          mode={formMode}
          bom={selectedBOM}
          onBack={() => { setIsFormOpen(false); setSelectedBOM(null); }}
        />
      ) : (
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col pb-4 mt-2">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by BOM no, finished item, compound..."
            onAdd={handleAdd}
            onExport={exportToCSV}
            addButtonText="Add BOM"
            theme="emerald"
          />

          <div className="flex-1 overflow-hidden">
            {filteredBOMs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-base font-semibold text-slate-600">No BOM entries found</p>
                <p className="text-sm mt-1">Try adjusting your search or add a new bill of materials.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredBOMs} keyField="id" />
            )}
          </div>

          <TableFooter totalEntries={filteredBOMs.length} additionalInfo="RUBBERTICS BOM REGISTRY" />
        </div>
      )}

      {/* Standard Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Bill of Materials</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete <span className="font-bold text-slate-800">{bomToDelete?.bomNo}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete BOM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
