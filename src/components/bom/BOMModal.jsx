import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Save, Plus, Trash2, Layers, Package, Beaker, Wrench, Boxes,
  Calculator, CheckCircle2, AlertCircle, RefreshCw, ChevronRight,
  TrendingUp, ArrowRight, DollarSign, Clock, ShieldCheck, FileText
} from 'lucide-react';
import { useBOMStore } from '../../store/bomStore';
import { useItemMasterStore } from '../../store/itemMasterStore';
import { useCompoundMasterStore } from '../../store/compoundMasterStore';
import { useToolsMasterStore } from '../../store/toolsMasterStore';
import { useMachineMasterStore } from '../../store/machineMasterStore';
import {
  DEFAULT_BOM,
  POLYMER_OPTIONS,
  calculateGrossWeight,
  calculateMaterialYield,
  calculateBOMCost
} from '../../data/bomTemplate';

export default function BOMModal() {
  const { isModalOpen, modalMode, selectedBOM, setModalOpen, addBOM, updateBOM } = useBOMStore();
  const { items: masterItems } = useItemMasterStore();
  const { compounds: masterCompounds } = useCompoundMasterStore();
  const { tools: masterTools } = useToolsMasterStore();
  const { machines: masterMachines } = useMachineMasterStore();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...DEFAULT_BOM });
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (selectedBOM) {
        setFormData({
          ...DEFAULT_BOM,
          ...selectedBOM,
          inserts: selectedBOM.inserts ? [...selectedBOM.inserts] : [],
          packaging: selectedBOM.packaging ? [...selectedBOM.packaging] : [],
          routing: selectedBOM.routing ? [...selectedBOM.routing] : [...DEFAULT_BOM.routing],
        });
      } else {
        setFormData({ ...DEFAULT_BOM });
      }
      setActiveTab('general');
      setErrors({});
    }
  }, [isModalOpen, selectedBOM]);

  // Recalculate gross weight whenever net weight or scrap percent changes
  const handleNetWeightChange = (val) => {
    const net = parseFloat(val) || 0;
    const gross = calculateGrossWeight(net, formData.scrapPercent);
    setFormData(prev => ({
      ...prev,
      netWeight: val,
      grossWeight: gross
    }));
  };

  const handleScrapPercentChange = (val) => {
    const scrap = parseFloat(val) || 0;
    const gross = calculateGrossWeight(formData.netWeight, scrap);
    setFormData(prev => ({
      ...prev,
      scrapPercent: val,
      grossWeight: gross
    }));
  };

  // Live calculations
  const costBreakdown = useMemo(() => {
    return calculateBOMCost(formData);
  }, [formData]);

  const materialYield = useMemo(() => {
    return calculateMaterialYield(formData.netWeight, formData.grossWeight);
  }, [formData.netWeight, formData.grossWeight]);

  if (!isModalOpen) return null;

  // Handle Finished Item Selection from Item Master
  const handleItemSelect = (e) => {
    const itemCode = e.target.value;
    const found = masterItems?.find(it => (it.itemCode || it.item_code) === itemCode);
    if (found) {
      setFormData(prev => ({
        ...prev,
        itemCode: found.itemCode || found.item_code || '',
        itemName: found.itemName || found.customerItemName || found.item_name || prev.itemName,
        customerPartNo: found.customerItemCode || found.customer_item_code || prev.customerPartNo,
        drawingNo: found.drawingNo || found.drawing_no || prev.drawingNo,
        revisionNo: found.revisionNo || found.revision_no || prev.revisionNo,
        bomTitle: prev.bomTitle || `${found.itemName || found.itemCode} Standard BOM`,
        netWeight: found.itemNetWeight || found.itemStdWeight || prev.netWeight,
        grossWeight: found.itemNetWeight
          ? calculateGrossWeight(found.itemNetWeight, prev.scrapPercent)
          : prev.grossWeight
      }));
    } else {
      setFormData(prev => ({ ...prev, itemCode }));
    }
  };

  // Handle Compound Selection from Compound Master
  const handleCompoundSelect = (e) => {
    const compoundCode = e.target.value;
    const found = masterCompounds?.find(c => (c.compoundCode || c.compound_code) === compoundCode);
    if (found) {
      setFormData(prev => ({
        ...prev,
        compoundCode: found.compoundCode || found.compound_code || '',
        compoundName: found.compoundName || found.compound_name || prev.compoundName,
        colour: found.compoundColour || found.compound_colour || prev.colour,
        hardness: found.hardnessShoreA || found.hardness || prev.hardness,
        specificGravity: found.specificGravity || found.specific_gravity || prev.specificGravity,
      }));
    } else {
      setFormData(prev => ({ ...prev, compoundCode }));
    }
  };

  // Handle Tool / Mould Selection from Tools Master
  const handleToolSelect = (e) => {
    const toolCode = e.target.value;
    const found = masterTools?.find(t => (t.toolCode || t.tool_code) === toolCode);
    if (found) {
      setFormData(prev => ({
        ...prev,
        mouldCode: found.toolCode || found.tool_code || '',
        cavities: found.numberOfCavities || found.number_of_cavities || prev.cavities,
        cycleTimeSec: found.cycleTime ? (parseFloat(found.cycleTime) || prev.cycleTimeSec) : prev.cycleTimeSec,
      }));
    } else {
      setFormData(prev => ({ ...prev, mouldCode: toolCode }));
    }
  };

  // Inserts array helpers
  const addInsertRow = () => {
    const newInsert = {
      id: `ins-${Date.now()}`,
      partName: '',
      material: '',
      qty: 1,
      surfaceTreatment: 'Degreased & Grit Blasted',
      primer: 'Chemlok 205 / 6125',
      unitCost: 0
    };
    setFormData(prev => ({ ...prev, inserts: [...(prev.inserts || []), newInsert] }));
  };

  const updateInsertRow = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      inserts: (prev.inserts || []).map(ins => ins.id === id ? { ...ins, [field]: value } : ins)
    }));
  };

  const removeInsertRow = (id) => {
    setFormData(prev => ({
      ...prev,
      inserts: (prev.inserts || []).filter(ins => ins.id !== id)
    }));
  };

  // Packaging array helpers
  const addPackagingRow = () => {
    const newPkg = {
      id: `pkg-${Date.now()}`,
      materialName: '',
      packQty: 100,
      costPerPack: 0
    };
    setFormData(prev => ({ ...prev, packaging: [...(prev.packaging || []), newPkg] }));
  };

  const updatePackagingRow = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      packaging: (prev.packaging || []).map(pkg => pkg.id === id ? { ...pkg, [field]: value } : pkg)
    }));
  };

  const removePackagingRow = (id) => {
    setFormData(prev => ({
      ...prev,
      packaging: (prev.packaging || []).filter(pkg => pkg.id !== id)
    }));
  };

  // Routing array helpers
  const addRoutingStep = () => {
    const steps = formData.routing || [];
    const nextStepNo = (steps.length + 1) * 10;
    const newStep = {
      stepNo: nextStepNo,
      operation: '',
      workCenter: 'Production Floor',
      cycleTimeMin: 1,
      notes: ''
    };
    setFormData(prev => ({ ...prev, routing: [...steps, newStep] }));
  };

  const updateRoutingStep = (idx, field, value) => {
    const steps = [...(formData.routing || [])];
    steps[idx] = { ...steps[idx], [field]: value };
    setFormData(prev => ({ ...prev, routing: steps }));
  };

  const removeRoutingStep = (idx) => {
    const steps = [...(formData.routing || [])];
    steps.splice(idx, 1);
    setFormData(prev => ({ ...prev, routing: steps }));
  };

  // Submit validation & action
  const handleSave = () => {
    const newErrors = {};
    if (!formData.itemName?.trim()) newErrors.itemName = 'Finished Item Name is required';
    if (!formData.compoundCode?.trim() && !formData.compoundName?.trim()) {
      newErrors.compound = 'Rubber Compound is required';
    }
    if (!formData.netWeight || parseFloat(formData.netWeight) <= 0) {
      newErrors.netWeight = 'Valid Net Weight is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Switch to relevant tab
      if (newErrors.itemName) setActiveTab('general');
      else if (newErrors.compound || newErrors.netWeight) setActiveTab('compound');
      return;
    }

    if (modalMode === 'edit') {
      updateBOM(formData.id, formData);
    } else {
      addBOM(formData);
    }
  };

  const tabs = [
    { id: 'general', label: '1. General & Item', icon: Package },
    { id: 'compound', label: '2. Rubber Compound', icon: Beaker },
    { id: 'inserts', label: `3. Inserts (${formData.inserts?.length || 0})`, icon: Layers },
    { id: 'packaging', label: `4. Packaging (${formData.packaging?.length || 0})`, icon: Boxes },
    { id: 'routing', label: `5. Routing (${formData.routing?.length || 0})`, icon: Clock },
    { id: 'costing', label: '6. Costing & Yield', icon: Calculator },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-slate-900">
                  {modalMode === 'edit' ? 'Edit Bill of Materials' : modalMode === 'duplicate' ? 'Duplicate / Revise BOM' : 'Create Bill of Materials (BOM)'}
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  formData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  formData.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {formData.status}
                </span>
              </div>
              <p className="text-[12px] text-slate-500">
                {formData.bomNo ? `${formData.bomNo} · ${formData.revisionNo || 'Rev 1.0'}` : 'Define compound recipe, inserts, routing & standard costing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. Unit Cost</div>
              <div className="text-[16px] font-extrabold text-emerald-600">
                ₹{costBreakdown.totalUnitCost.toFixed(2)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 font-semibold bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">

          {/* ─── TAB 1: General & Product Details ──────────────────────────── */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    BOM Number <span className="text-slate-400 font-normal">(Leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bomNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, bomNo: e.target.value }))}
                    placeholder="e.g. BOM-26-005"
                    className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    BOM Title / Assembly Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bomTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, bomTitle: e.target.value }))}
                    placeholder="e.g. Heavy Duty Engine Mounting Bushing Assembly"
                    className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Finished Product Link */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package size={14} className="text-emerald-600" />
                  Finished Item Specification (From Item Master)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Select Item Code
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.itemCode}
                        onChange={handleItemSelect}
                        className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                      >
                        <option value="">-- Choose or type below --</option>
                        {masterItems?.map(it => (
                          <option key={it.id || it.itemCode} value={it.itemCode || it.item_code}>
                            {it.itemCode || it.item_code} - {it.itemName || it.customerItemName || it.item_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Finished Part Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="e.g. Engine Mounting Bush Type-A"
                      className={`w-full px-3 py-2 text-[13px] border rounded-xl focus:outline-none ${
                        errors.itemName ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {errors.itemName && <p className="text-[11px] text-red-500 mt-1">{errors.itemName}</p>}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Customer Part No
                    </label>
                    <input
                      type="text"
                      value={formData.customerPartNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPartNo: e.target.value }))}
                      placeholder="e.g. HY-ENG-98442"
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Drawing No
                    </label>
                    <input
                      type="text"
                      value={formData.drawingNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, drawingNo: e.target.value }))}
                      placeholder="e.g. DWG-ENG-MNT-01"
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      BOM Revision & Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.revisionNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, revisionNo: e.target.value }))}
                        placeholder="Rev 1.0"
                        className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-2 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Obsolete">Obsolete</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooling & Machine Context */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Wrench size={14} className="text-emerald-600" />
                  Moulding Tool & Press Allocation
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Mould / Die Code
                    </label>
                    <select
                      value={formData.mouldCode}
                      onChange={handleToolSelect}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Select Mould --</option>
                      {masterTools?.map(t => (
                        <option key={t.id || t.toolCode} value={t.toolCode || t.tool_code}>
                          {t.toolCode || t.tool_code} ({t.numberOfCavities || 1} Cav)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      No. of Cavities
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cavities}
                      onChange={(e) => setFormData(prev => ({ ...prev, cavities: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Cycle Time (Seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cycleTimeSec}
                      onChange={(e) => setFormData(prev => ({ ...prev, cycleTimeSec: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Target Press / Machine
                    </label>
                    <select
                      value={formData.machinePress}
                      onChange={(e) => setFormData(prev => ({ ...prev, machinePress: e.target.value }))}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Choose Machine --</option>
                      {masterMachines?.map(m => (
                        <option key={m.id || m.machineCode} value={m.machineCode || m.machine_code}>
                          {m.machineCode || m.machine_code} - {m.machineName || m.machine_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: Rubber Compound & Weights ───────────────────────────── */}
          {activeTab === 'compound' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Beaker size={16} className="text-emerald-600" />
                    <span className="text-[13px] font-bold text-slate-800">
                      Rubber Compound Specification
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Base Material
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Select Compound Master
                    </label>
                    <select
                      value={formData.compoundCode}
                      onChange={handleCompoundSelect}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Choose Compound --</option>
                      {masterCompounds?.map(c => (
                        <option key={c.id || c.compoundCode} value={c.compoundCode || c.compound_code}>
                          {c.compoundCode || c.compound_code} - {c.compoundName || c.compound_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Compound Name / Grade
                    </label>
                    <input
                      type="text"
                      value={formData.compoundName}
                      onChange={(e) => setFormData(prev => ({ ...prev, compoundName: e.target.value }))}
                      placeholder="e.g. Natural Rubber 65 Black"
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Base Polymer Family
                    </label>
                    <select
                      value={formData.polymer}
                      onChange={(e) => setFormData(prev => ({ ...prev, polymer: e.target.value }))}
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
                    >
                      {POLYMER_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Compound Colour
                    </label>
                    <input
                      type="text"
                      value={formData.colour}
                      onChange={(e) => setFormData(prev => ({ ...prev, colour: e.target.value }))}
                      placeholder="Black, Red, Brown..."
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Hardness (Shore A)
                    </label>
                    <input
                      type="text"
                      value={formData.hardness}
                      onChange={(e) => setFormData(prev => ({ ...prev, hardness: e.target.value }))}
                      placeholder="e.g. 65 ± 5"
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Specific Gravity (g/cc)
                    </label>
                    <input
                      type="text"
                      value={formData.specificGravity}
                      onChange={(e) => setFormData(prev => ({ ...prev, specificGravity: e.target.value }))}
                      placeholder="e.g. 1.18"
                      className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Weight & Scrap Calculation Engine */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator size={15} className="text-emerald-600" />
                    Weight & Flash Scrap Calculations
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    <span>Material Yield: {materialYield}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Net Part Weight (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.netWeight}
                      onChange={(e) => handleNetWeightChange(e.target.value)}
                      placeholder="e.g. 84.50"
                      className={`w-full px-3 py-2 text-[14px] font-bold border rounded-xl focus:outline-none ${
                        errors.netWeight ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Finished trimmed weight</p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Flash / Scrap Allowance (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.scrapPercent}
                      onChange={(e) => handleScrapPercentChange(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 text-[14px] font-bold border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Runner, overflow & flash</p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Gross Weight per Piece (g)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={formData.grossWeight || ''}
                      className="w-full px-3 py-2 text-[14px] font-extrabold text-slate-800 border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-emerald-600 mt-1">Auto-calculated: Net + Scrap</p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Compound Rate (₹ / kg)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.compoundRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, compoundRate: e.target.value }))}
                      placeholder="e.g. 180"
                      className="w-full px-3 py-2 text-[14px] font-bold border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Standard raw compound price</p>
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[14px]">
                      ₹
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Rubber Cost per Piece</div>
                      <div className="text-[15px] font-extrabold text-slate-800">
                        ₹{costBreakdown.rubberCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-500">For Batch of {formData.batchQty || 100} Pcs</div>
                    <div className="text-[14px] font-bold text-emerald-700">
                      {((formData.grossWeight * (formData.batchQty || 100)) / 1000).toFixed(2)} Kg Rubber Required
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: Inserts & Sub-Components ───────────────────────────── */}
          {activeTab === 'inserts' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">
                    Inserts & Sub-Components (Rubber-to-Metal Bonding)
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Define metal plates, bushes, washers, springs, and Chemlok bonding primers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addInsertRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  Add Insert Row
                </button>
              </div>

              {(!formData.inserts || formData.inserts.length === 0) ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <Layers size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[13px] font-medium text-slate-600">No inserts or sub-components added</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    If this part is pure rubber (e.g. O-Ring or Extruded Seal), you can leave this empty. If it is bonded to metal, click &quot;Add Insert Row&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={addInsertRow}
                    className="mt-3 text-[12px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    + Add Metal Bush / Insert
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="p-3">Insert Name / Description</th>
                        <th className="p-3 w-32">Material Spec</th>
                        <th className="p-3 w-20 text-center">Qty/Pc</th>
                        <th className="p-3 w-40">Surface Prep / Primer</th>
                        <th className="p-3 w-28 text-right">Unit Cost (₹)</th>
                        <th className="p-3 w-28 text-right">Subtotal</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.inserts.map((ins) => {
                        const subtotal = (parseFloat(ins.qty) || 0) * (parseFloat(ins.unitCost) || 0);
                        return (
                          <tr key={ins.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={ins.partName}
                                onChange={(e) => updateInsertRow(ins.id, 'partName', e.target.value)}
                                placeholder="e.g. Inner MS Bush OD 22mm"
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={ins.material}
                                onChange={(e) => updateInsertRow(ins.id, 'material', e.target.value)}
                                placeholder="e.g. EN1A / SS304"
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="1"
                                value={ins.qty}
                                onChange={(e) => updateInsertRow(ins.id, 'qty', e.target.value)}
                                className="w-full px-2 py-1.5 text-center border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={ins.primer}
                                onChange={(e) => updateInsertRow(ins.id, 'primer', e.target.value)}
                                placeholder="e.g. Chemlok 205 + 6125"
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.5"
                                value={ins.unitCost}
                                onChange={(e) => updateInsertRow(ins.id, 'unitCost', e.target.value)}
                                className="w-full px-2 py-1.5 text-right border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-800">
                              ₹{subtotal.toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeInsertRow(ins.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 flex justify-between items-center text-[12px] font-bold text-slate-700">
                    <span>Total Inserts & Sub-Components:</span>
                    <span className="text-emerald-700 text-[14px]">₹{costBreakdown.insertsCost.toFixed(2)} / piece</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: Packaging & Consumables ────────────────────────────── */}
          {activeTab === 'packaging' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">
                    Packaging Materials & Consumables
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Specify corrugated boxes, poly liner bags, and shipping labels
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPackagingRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  Add Packaging Row
                </button>
              </div>

              {(!formData.packaging || formData.packaging.length === 0) ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <Boxes size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[13px] font-medium text-slate-600">No packaging items specified</p>
                  <button
                    type="button"
                    onClick={addPackagingRow}
                    className="mt-3 text-[12px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    + Add Master Box / Polybag
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="p-3">Packaging Description</th>
                        <th className="p-3 w-32 text-center">Pieces per Pack</th>
                        <th className="p-3 w-36 text-right">Cost per Pack (₹)</th>
                        <th className="p-3 w-36 text-right">Cost / Piece (₹)</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.packaging.map((pkg) => {
                        const packQty = parseFloat(pkg.packQty) || 1;
                        const costPerPack = parseFloat(pkg.costPerPack) || 0;
                        const perPiece = packQty > 0 ? (costPerPack / packQty) : 0;
                        return (
                          <tr key={pkg.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={pkg.materialName}
                                onChange={(e) => updatePackagingRow(pkg.id, 'materialName', e.target.value)}
                                placeholder="e.g. 5-Ply Corrugated Carton Box (400x300x200mm)"
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="1"
                                value={pkg.packQty}
                                onChange={(e) => updatePackagingRow(pkg.id, 'packQty', e.target.value)}
                                className="w-full px-2 py-1.5 text-center border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.5"
                                value={pkg.costPerPack}
                                onChange={(e) => updatePackagingRow(pkg.id, 'costPerPack', e.target.value)}
                                className="w-full px-2 py-1.5 text-right border border-slate-200 rounded-lg text-[12px] focus:border-emerald-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-800">
                              ₹{perPiece.toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removePackagingRow(pkg.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 flex justify-between items-center text-[12px] font-bold text-slate-700">
                    <span>Total Packaging Cost per Piece:</span>
                    <span className="text-emerald-700 text-[14px]">₹{costBreakdown.packagingCost.toFixed(2)} / piece</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 5: Manufacturing Process Routing ───────────────────────── */}
          {activeTab === 'routing' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">
                    Standard Manufacturing Process Sequence
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Define operational routing sequence from raw blank preparation to final QC
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addRoutingStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  Add Process Step
                </button>
              </div>

              <div className="space-y-2.5">
                {(formData.routing || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[12px] flex items-center justify-center shrink-0 mt-1">
                      {step.stepNo || (idx + 1) * 10}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Operation / Step Name
                        </label>
                        <input
                          type="text"
                          value={step.operation}
                          onChange={(e) => updateRoutingStep(idx, 'operation', e.target.value)}
                          placeholder="e.g. Compression Moulding Cycle"
                          className="w-full px-2.5 py-1.5 text-[12.5px] border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Work Center / Station
                        </label>
                        <input
                          type="text"
                          value={step.workCenter}
                          onChange={(e) => updateRoutingStep(idx, 'workCenter', e.target.value)}
                          placeholder="e.g. Press Shop #2"
                          className="w-full px-2.5 py-1.5 text-[12.5px] border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Standard Time (Mins)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={step.cycleTimeMin}
                          onChange={(e) => updateRoutingStep(idx, 'cycleTimeMin', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-[12.5px] border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={step.notes || ''}
                          onChange={(e) => updateRoutingStep(idx, 'notes', e.target.value)}
                          placeholder="Operating parameters, cure temperature, safety instructions..."
                          className="w-full px-2.5 py-1 text-[11.5px] text-slate-600 border border-slate-100 rounded-md focus:border-emerald-500 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRoutingStep(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1.5 mt-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 6: Costing & Analytics Summary ─────────────────────────── */}
          {activeTab === 'costing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rubber Cost</div>
                  <div className="text-[20px] font-extrabold text-slate-800 mt-1">
                    ₹{costBreakdown.rubberCost.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formData.grossWeight || 0}g @ ₹{formData.compoundRate || 0}/kg
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inserts & Bonding</div>
                  <div className="text-[20px] font-extrabold text-slate-800 mt-1">
                    ₹{costBreakdown.insertsCost.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formData.inserts?.length || 0} components
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Packaging Cost</div>
                  <div className="text-[20px] font-extrabold text-slate-800 mt-1">
                    ₹{costBreakdown.packagingCost.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Boxes & liners per pc
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Total Est. Unit Cost</div>
                  <div className="text-[22px] font-black text-emerald-700 mt-1">
                    ₹{costBreakdown.totalUnitCost.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Per finished {formData.outputUom || 'piece'}
                  </div>
                </div>
              </div>

              {/* Labor & Machine Overhead Setting */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800">
                      Machine & Labor Overhead Allowance (₹ / Piece)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Standard press machine hour rate, electricity, and operator cost
                    </p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      step="0.5"
                      value={formData.overheadCost || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, overheadCost: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 text-right font-bold text-[14px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Yield & Cost Share Visual Breakdown */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-[13px] font-bold text-slate-800 mb-3">
                  Cost Component Breakdown (% of Total Unit Cost)
                </h4>
                {costBreakdown.totalUnitCost > 0 ? (
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
                      <div
                        style={{ width: `${(costBreakdown.rubberCost / costBreakdown.totalUnitCost) * 100}%` }}
                        className="bg-emerald-500"
                        title={`Rubber: ${((costBreakdown.rubberCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${(costBreakdown.insertsCost / costBreakdown.totalUnitCost) * 100}%` }}
                        className="bg-blue-500"
                        title={`Inserts: ${((costBreakdown.insertsCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${(costBreakdown.packagingCost / costBreakdown.totalUnitCost) * 100}%` }}
                        className="bg-amber-500"
                        title={`Packaging: ${((costBreakdown.packagingCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${(costBreakdown.laborOverhead / costBreakdown.totalUnitCost) * 100}%` }}
                        className="bg-purple-500"
                        title={`Overheads: ${((costBreakdown.laborOverhead / costBreakdown.totalUnitCost) * 100).toFixed(1)}%`}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Rubber: {((costBreakdown.rubberCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-slate-600">Inserts: {((costBreakdown.insertsCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Packaging: {((costBreakdown.packagingCost / costBreakdown.totalUnitCost) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-slate-600">Overheads: {((costBreakdown.laborOverhead / costBreakdown.totalUnitCost) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-slate-400">Enter material rates to view cost percentage split</p>
                )}
              </div>

              {/* Engineering Remarks */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Engineering Notes & Approval Remarks
                </label>
                <textarea
                  rows="3"
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. Pre-production sampling approved. Pull-off test mandatory."
                  className="w-full px-3 py-2 text-[12.5px] border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'general' && (
              <button
                type="button"
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  if (idx > 0) setActiveTab(tabs[idx - 1].id);
                }}
                className="px-3 py-2 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}

            {activeTab !== 'costing' ? (
              <button
                type="button"
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                }}
                className="flex items-center gap-1 px-4 py-2 text-[12.5px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Save size={15} />
              <span>{modalMode === 'edit' ? 'Update BOM' : 'Save Bill of Materials'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
