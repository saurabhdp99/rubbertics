import { todayIsoDate } from '../utils/dateFormatter';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers, Plus, Search, Filter, Download, Eye, Edit, Copy, Trash2,
  RefreshCw, CheckCircle2, Clock, AlertCircle, FileText, Printer,
  ArrowLeft, X, Save, Package, Beaker, Wrench, Boxes, Calculator,
  ShieldCheck, FileSpreadsheet, Building2, Factory, Image as ImageIcon,
  UploadCloud, ZoomIn, ExternalLink
} from 'lucide-react';
import { Input, Spinner, Select, ListBox } from '@heroui/react';
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
import { supabase } from '../lib/supabase';
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
  creationDate: z.string().min(1, 'Creation Date is required'),
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
  toolItemNetWeight: z.any().optional(),
  toolSortWeight: z.any().optional(),
  machinePress: z.string().optional(),

  compoundCode: z.string().optional(),
  compoundName: z.string().optional(),
  polymer: z.string().optional(),
  colour: z.string().optional(),
  hardness: z.string().optional(),
  specificGravity: z.string().optional(),
  netCompoundWeight: z.any().optional(),
  netWeight: z.any().optional(),
  weightLossFlyLossPercent: z.any().optional(),
  scrapPercent: z.any().optional(),
  grossWeight: z.any().optional(),
  compoundRate: z.any().optional(),

  overheadCost: z.any().optional(),
  remarks: z.string().optional(),

  images: z.array(z.any()).optional(),

  prepared_by: z.string().optional(),
  checked_by: z.string().optional(),
  approved_by: z.string().optional(),
});

// ─── Full-Page BOM Form Component ─────────────────────────────────────────────
function BOMForm({ mode, bom, onBack }) {
  const isView = mode === 'view';
  const { currentOrg, currentUser } = useAuthStore();
  const { boms, addBOM, updateBOM, fetchBOMs } = useBOMStore();
  const { items: masterItems, fetchItems, isLoading: isItemsLoading } = useItemMasterStore();
  const { compounds: masterCompounds, fetchCompounds, isLoading: isCompoundsLoading } = useCompoundMasterStore();
  const { tools: masterTools, fetchTools } = useToolsMasterStore();
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
      if (!boms || boms.length === 0) fetchBOMs(orgId);
      if (!masterItems || masterItems.length === 0) fetchItems(orgId);
      if (!masterCompounds || masterCompounds.length === 0) fetchCompounds(orgId);
      if (!masterTools || masterTools.length === 0) fetchTools(orgId);
      if (!masterMachines || masterMachines.length === 0) fetchMachines(orgId);
      if (!employees || employees.length === 0) fetchEmployees(orgId);
    }
  }, [currentOrg?.id, fetchBOMs, fetchItems, fetchCompounds, fetchTools, fetchMachines, fetchEmployees, boms?.length, masterItems?.length, masterCompounds?.length, masterTools?.length, masterMachines?.length, employees?.length]);

  const [inserts, setInserts] = useState(bom?.inserts ? [...bom.inserts] : []);
  const [packaging, setPackaging] = useState(bom?.packaging ? [...bom.packaging] : []);
  const [routing, setRouting] = useState(bom?.routing ? [...bom.routing] : [...DEFAULT_BOM.routing]);
  const [images, setImages] = useState(bom?.images ? [...bom.images] : []);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // Dynamic Image Helpers
  const addImageRow = () => {
    setImages(prev => [
      ...prev,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: '',
        name: '',
        fileName: '',
        fileType: '',
        fileData: '',
        url: '',
        fileObject: null,
      }
    ]);
  };

  const updateImage = (id, field, val) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: val, ...(field === 'title' ? { name: val } : {}) } : img));
  };

  const handleImageFileChange = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        return {
          ...img,
          fileObject: file,
          fileName: file.name,
          fileType: file.type,
          fileData: previewUrl,
          url: previewUrl,
          title: img.title || cleanTitle,
          name: img.name || cleanTitle,
        };
      }
      return img;
    }));
    e.target.value = null;
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Compute next sequential BOM Number (e.g. BOM-26-005)
  const nextBomNo = useMemo(() => {
    if (bom?.bomNo) return bom.bomNo;
    const yearCode = String(new Date().getFullYear()).slice(-2);
    const prefix = `BOM-${yearCode}-`;
    let maxNum = 0;
    (boms || []).forEach(b => {
      if (b.bomNo && typeof b.bomNo === 'string' && b.bomNo.startsWith(prefix)) {
        const num = parseInt(b.bomNo.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum > 0 ? maxNum + 1 : (boms?.length || 0) + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }, [bom, boms]);

  const defaultVals = useMemo(() => {
    if (!bom) {
      return {
        ...DEFAULT_BOM,
        creationDate: DEFAULT_BOM.creationDate || todayIsoDate(),
        bomNo: nextBomNo,
        revisionNo: '',
        batchQty: '',
        mouldCode: '',
        cavities: '',
        cycleTimeSec: '',
        toolItemNetWeight: '',
        toolSortWeight: '',
        weightLossFlyLossPercent: '',
        scrapPercent: '',
        grossWeight: '',
        images: [],
      };
    }
    return {
      ...DEFAULT_BOM,
      ...bom,
      creationDate: bom.creationDate || (bom.createdAt ? bom.createdAt.split('T')[0] : (DEFAULT_BOM.creationDate || todayIsoDate())),
      bomNo: bom.bomNo || nextBomNo,
      revisionNo: bom.revisionNo || '',
      batchQty: bom.batchQty?.toString() || '',
      mouldCode: bom.mouldCode || '',
      cavities: bom.cavities?.toString() || '',
      cycleTimeSec: bom.cycleTimeSec?.toString() || '',
      toolItemNetWeight: bom.toolItemNetWeight?.toString() || '',
      toolSortWeight: bom.toolSortWeight?.toString() || '',
      netCompoundWeight: (bom.netCompoundWeight ?? bom.netWeight)?.toString() || '',
      netWeight: (bom.netCompoundWeight ?? bom.netWeight)?.toString() || '',
      weightLossFlyLossPercent: (bom.weightLossFlyLossPercent ?? bom.scrapPercent)?.toString() || '',
      scrapPercent: (bom.weightLossFlyLossPercent ?? bom.scrapPercent)?.toString() || '',
      grossWeight: bom.grossWeight?.toString() || '',
      compoundRate: bom.compoundRate?.toString() || '',
      overheadCost: bom.overheadCost?.toString() || '0',
      images: bom.images || [],
    };
  }, [bom, nextBomNo]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bomSchema),
    defaultValues: defaultVals,
  });

  const watchAll = watch();

  // Auto Calculations for Gross Weight fallback
  useEffect(() => {
    if (isView) return;
    const net = parseFloat(watchAll.netCompoundWeight ?? watchAll.netWeight) || 0;
    const loss = parseFloat(watchAll.weightLossFlyLossPercent ?? watchAll.scrapPercent) || 0;
    const currentGross = parseFloat(watchAll.grossWeight) || 0;
    // Auto-calculate fallback gross weight only if grossWeight is empty or 0
    if (net > 0 && currentGross === 0) {
      const gross = calculateGrossWeight(net, loss);
      if (gross > 0 && watchAll.grossWeight !== gross.toString()) {
        setValue('grossWeight', gross.toString(), { shouldDirty: true });
      }
    }
  }, [watchAll.netCompoundWeight, watchAll.netWeight, watchAll.weightLossFlyLossPercent, watchAll.scrapPercent, isView, setValue, watchAll.grossWeight]);

  // Helper: Find matching tool in Tools Master based on Item details (item name, customer item code/part no, item code, drawing no)
  const findMatchingTool = (item, toolsList) => {
    if (!item || !toolsList || toolsList.length === 0) return null;

    const itName = (item.itemName || item.customerItemName || item.item_name || item.partName || item.part_name || '').trim().toLowerCase();
    const custCode = (item.customerItemCode || item.customer_item_code || item.partNo || item.part_no || item.customerPartNo || '').trim().toLowerCase();
    const itCode = (item.itemCode || item.item_code || '').trim().toLowerCase();
    const dwg = (item.drawingNo || item.drawing_no || '').trim().toLowerCase();

    const getToolProps = (t) => {
      const tName = (t.toolName || t.tool_name || t.linked_part_name || t.linkedPartName || '').trim().toLowerCase();
      const tCode = (t.toolCode || t.tool_code || '').trim().toLowerCase();
      const tRemarks = (t.remarks || '').trim().toLowerCase();
      return { tName, tCode, tRemarks };
    };

    // 1. Exact match on itemName
    if (itName) {
      const match = toolsList.find(t => {
        const { tName } = getToolProps(t);
        return tName && tName === itName;
      });
      if (match) return match;
    }

    // 2. Exact match on customerItemCode / custom item name or code
    if (custCode) {
      const match = toolsList.find(t => {
        const { tName, tCode } = getToolProps(t);
        return (tName && tName === custCode) || (tCode && tCode === custCode);
      });
      if (match) return match;
    }

    // 3. Exact match on itemCode
    if (itCode) {
      const match = toolsList.find(t => {
        const { tName, tCode } = getToolProps(t);
        return (tName && tName === itCode) || (tCode && tCode === itCode);
      });
      if (match) return match;
    }

    // 4. Substring match on itemName (e.g. "Engine Mounting Bush")
    if (itName && itName.length >= 3) {
      const match = toolsList.find(t => {
        const { tName } = getToolProps(t);
        return tName && (itName.includes(tName) || tName.includes(itName));
      });
      if (match) return match;
    }

    // 5. Substring match on customerItemCode
    if (custCode && custCode.length >= 3) {
      const match = toolsList.find(t => {
        const { tName, tCode } = getToolProps(t);
        return (tName && (tName.includes(custCode) || custCode.includes(tName))) ||
          (tCode && (tCode.includes(custCode) || custCode.includes(tCode)));
      });
      if (match) return match;
    }

    // 6. Substring match on drawing number
    if (dwg && dwg.length >= 3) {
      const match = toolsList.find(t => {
        const { tName, tRemarks } = getToolProps(t);
        return (tName && tName.includes(dwg)) || (tRemarks && tRemarks.includes(dwg));
      });
      if (match) return match;
    }

    return null;
  };

  // Helper: Apply matching Tool details (mouldCode, cavities, cycleTimeSec, itemNetWeight, sortWeight)
  const applyMatchingTool = (tool) => {
    if (!tool) {
      setValue('mouldCode', '', { shouldDirty: true });
      setValue('cavities', '', { shouldDirty: true });
      setValue('cycleTimeSec', '', { shouldDirty: true });
      setValue('toolItemNetWeight', '', { shouldDirty: true });
      setValue('toolSortWeight', '', { shouldDirty: true });
      return;
    }
    const code = tool.toolCode || tool.tool_code || '';
    if (code) {
      setValue('mouldCode', code, { shouldValidate: true, shouldDirty: true });
    }
    const cav = tool.numberOfCavities || tool.number_of_cavities;
    if (cav !== undefined && cav !== null && Number(cav) > 0) {
      setValue('cavities', String(cav), { shouldDirty: true });
    }
    const cycle = tool.cycleTime || tool.cycle_time;
    if (cycle) {
      setValue('cycleTimeSec', String(parseFloat(cycle) || 180), { shouldDirty: true });
    }
    const inw = tool.itemNetWeight ?? tool.item_net_weight;
    if (inw !== undefined && inw !== null && inw !== '') {
      setValue('toolItemNetWeight', String(inw), { shouldDirty: true });
    }
    const sw = tool.sortWeight ?? tool.sort_weight;
    if (sw !== undefined && sw !== null && sw !== '') {
      setValue('toolSortWeight', String(sw), { shouldDirty: true });
    }
  };

  // Helper to populate form fields from Item Master & Tools Master
  const applyFinishedItemDetails = (item) => {
    if (!item) return;
    const itName = item.itemName || item.customerItemName || item.item_name || '';
    if (itName) {
      setValue('itemName', itName, { shouldValidate: true, shouldDirty: true });
    }
    const custPart = item.customerItemCode || item.customer_item_code || item.part_no || item.partNo || '';
    setValue('customerPartNo', custPart, { shouldDirty: true });

    const dwg = item.drawingNo || item.drawing_no || '';
    setValue('drawingNo', dwg, { shouldDirty: true });

    // Extract item revision number from item master: if item has revision, set it; if not, empty
    const rawRev = item.revisionNo ?? item.revision_no ?? item.revision ?? item.rev_no ?? item.revNo ?? item.partRevision ?? item.part_revision;
    const rev = (rawRev !== null && rawRev !== undefined && String(rawRev).trim() !== '') ? String(rawRev).trim() : '';
    setValue('revisionNo', rev, { shouldValidate: true, shouldDirty: true });

    // Extract batch quantity from item master
    const rawBatch = item.batchQty ?? item.batch_qty;
    if (rawBatch !== undefined && rawBatch !== null && Number(rawBatch) > 0) {
      setValue('batchQty', String(rawBatch), { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('batchQty', '', { shouldValidate: true, shouldDirty: true });
    }

    const netWt = item.itemNetWeight || item.net_weight || item.netWeight || item.item_std_weight || item.itemStdWeight;
    if (netWt) {
      setValue('netCompoundWeight', String(netWt), { shouldValidate: true, shouldDirty: true });
      setValue('netWeight', String(netWt), { shouldValidate: true, shouldDirty: true });
    }
    if (!watchAll.bomTitle && (itName || item.itemCode || item.item_code)) {
      setValue('bomTitle', `${itName || item.itemCode || item.item_code} Standard BOM`, { shouldDirty: true });
    }

    // Auto-match and populate Tool / Mould from Tools Master
    const matchedTool = findMatchingTool(item, masterTools);
    if (matchedTool) {
      applyMatchingTool(matchedTool);
    } else if (currentOrg?.id) {
      supabase
        .from('tool_master')
        .select('*')
        .eq('org_id', currentOrg.id)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remoteMatch = findMatchingTool(item, data);
            if (remoteMatch) {
              applyMatchingTool(remoteMatch);
            }
          }
        });
    } else {
      applyMatchingTool(null);
    }
  };

  // Auto-fetch revision number, batch qty, tool no, and item details whenever itemCode is selected or loaded
  useEffect(() => {
    const code = watchAll.itemCode;
    if (!code) {
      if (!bom) {
        if (watchAll.revisionNo) setValue('revisionNo', '', { shouldValidate: true, shouldDirty: true });
        if (watchAll.batchQty) setValue('batchQty', '', { shouldValidate: true, shouldDirty: true });
        if (watchAll.mouldCode) setValue('mouldCode', '', { shouldDirty: true });
        if (watchAll.cavities) setValue('cavities', '', { shouldDirty: true });
        if (watchAll.cycleTimeSec) setValue('cycleTimeSec', '', { shouldDirty: true });
      }
      return;
    }

    const found = masterItems?.find(it => (it.itemCode || it.item_code) === code);
    if (found) {
      const rawRev = found.revisionNo ?? found.revision_no ?? found.revision ?? found.rev_no ?? found.revNo ?? found.partRevision ?? found.part_revision;
      const rev = (rawRev !== null && rawRev !== undefined && String(rawRev).trim() !== '') ? String(rawRev).trim() : '';
      if (watchAll.revisionNo !== rev) {
        setValue('revisionNo', rev, { shouldValidate: true, shouldDirty: true });
      }

      const rawBatch = found.batchQty ?? found.batch_qty;
      const batchStr = (rawBatch !== undefined && rawBatch !== null && Number(rawBatch) > 0) ? String(rawBatch) : '';
      if (watchAll.batchQty !== batchStr) {
        setValue('batchQty', batchStr, { shouldValidate: true, shouldDirty: true });
      }

      // Auto-fetch matching tool from Tools Master if mouldCode not set or when syncing
      const matchedTool = findMatchingTool(found, masterTools);
      if (matchedTool) {
        const tCode = matchedTool.toolCode || matchedTool.tool_code;
        if (watchAll.mouldCode !== tCode) {
          applyMatchingTool(matchedTool);
        }
      }
    } else if (currentOrg?.id) {
      supabase
        .from('item_master')
        .select('*')
        .eq('org_id', currentOrg.id)
        .eq('item_code', code)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            applyFinishedItemDetails(data);
          } else if (!bom) {
            setValue('revisionNo', '', { shouldValidate: true, shouldDirty: true });
            setValue('batchQty', '', { shouldValidate: true, shouldDirty: true });
            setValue('mouldCode', '', { shouldDirty: true });
          }
        });
    }
  }, [watchAll.itemCode, masterItems, masterTools, currentOrg?.id, setValue, watchAll.revisionNo, watchAll.batchQty, watchAll.mouldCode, bom]);

  // Handle Finished Item Selection (HeroUI Select passes the item code directly)
  const handleItemSelectByCode = async (itemCode) => {
    if (!itemCode) {
      setValue('itemName', '', { shouldDirty: true });
      setValue('customerPartNo', '', { shouldDirty: true });
      setValue('drawingNo', '', { shouldDirty: true });
      setValue('revisionNo', '', { shouldValidate: true, shouldDirty: true });
      setValue('batchQty', '', { shouldValidate: true, shouldDirty: true });
      setValue('mouldCode', '', { shouldDirty: true });
      setValue('cavities', '', { shouldDirty: true });
      setValue('cycleTimeSec', '', { shouldDirty: true });
      setValue('netCompoundWeight', '', { shouldDirty: true });
      setValue('netWeight', '', { shouldDirty: true });
      return;
    }

    const found = masterItems?.find(it => (it.itemCode || it.item_code) === itemCode);
    if (found) {
      applyFinishedItemDetails(found);
    } else {
      setValue('revisionNo', '', { shouldValidate: true, shouldDirty: true });
      setValue('batchQty', '', { shouldValidate: true, shouldDirty: true });
      setValue('mouldCode', '', { shouldDirty: true });
    }

    // Also query Supabase to ensure freshest revision data from item_master table
    if (currentOrg?.id) {
      try {
        const { data, error } = await supabase
          .from('item_master')
          .select('*')
          .eq('org_id', currentOrg.id)
          .eq('item_code', itemCode)
          .maybeSingle();
        if (!error && data) {
          applyFinishedItemDetails(data);
        }
      } catch (err) {
        console.error('Error fetching item details from Supabase:', err);
      }
    }
  };

  // Helper to populate form fields from Compound Master
  const applyCompoundDetails = (compound) => {
    if (!compound) return;
    const name = compound.compoundName || compound.compound_name || '';
    if (name) setValue('compoundName', name, { shouldValidate: true, shouldDirty: true });

    const polymerVal = compound.basePolymer || compound.base_polymer || compound.polymer || '';
    if (polymerVal) setValue('polymer', polymerVal, { shouldValidate: true, shouldDirty: true });

    const colourVal = compound.compoundColour || compound.compound_colour || '';
    if (colourVal) setValue('colour', colourVal, { shouldDirty: true });

    const hardnessVal = compound.hardnessShoreA || compound.hardness_shore_a || compound.hardness || '';
    if (hardnessVal) setValue('hardness', String(hardnessVal), { shouldDirty: true });

    const sgVal = compound.specificGravity || compound.specific_gravity || '';
    if (sgVal) setValue('specificGravity', String(sgVal), { shouldDirty: true });

    // Auto-fetch Net Weight (kg) from Compound Master
    const rawNet = compound.netWeight ?? compound.net_weight ?? compound.totalOutput ?? compound.total_output;
    const netNum = parseFloat(rawNet);
    if (!isNaN(netNum) && netNum > 0) {
      const netStr = String(netNum);
      setValue('netCompoundWeight', netStr, { shouldValidate: true, shouldDirty: true });
      setValue('netWeight', netStr, { shouldValidate: true, shouldDirty: true });
    }

    // Auto-fetch Weight Loss / Fly Loss (%) from Compound Master
    const rawLoss = compound.lessWeightLoss ?? compound.less_weight_loss;
    if (rawLoss !== undefined && rawLoss !== null && rawLoss !== '') {
      const lossNum = parseFloat(rawLoss);
      if (!isNaN(lossNum)) {
        const lossStr = String(lossNum);
        setValue('weightLossFlyLossPercent', lossStr, { shouldValidate: true, shouldDirty: true });
        setValue('scrapPercent', lossStr, { shouldDirty: true });
      }
    }

    // Auto-fetch Compound Gross Weight (kg) from Compound Master
    const rawGross = compound.grossWeight ?? compound.gross_weight;
    const grossNum = parseFloat(rawGross);
    if (!isNaN(grossNum) && grossNum > 0) {
      setValue('grossWeight', String(grossNum), { shouldValidate: true, shouldDirty: true });
    } else {
      // Fallback: calculate gross weight from net weight and weight loss %
      const net = (!isNaN(netNum) && netNum > 0) ? netNum : (parseFloat(watchAll.netCompoundWeight ?? watchAll.netWeight) || 0);
      const loss = (rawLoss !== undefined && rawLoss !== null && rawLoss !== '') ? parseFloat(rawLoss) : (parseFloat(watchAll.weightLossFlyLossPercent ?? watchAll.scrapPercent) || 0);
      if (net > 0) {
        const calcGross = calculateGrossWeight(net, loss);
        if (calcGross > 0) {
          setValue('grossWeight', String(calcGross), { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  };

  // Auto-fetch compound details whenever compoundCode is selected or loaded
  useEffect(() => {
    const code = watchAll.compoundCode;
    if (!code) return;

    const found = masterCompounds?.find(c => (c.compoundCode || c.compound_code) === code);
    if (found) {
      const pol = found.basePolymer || found.base_polymer || found.polymer;
      if (pol && !watchAll.polymer) {
        setValue('polymer', pol, { shouldValidate: true, shouldDirty: true });
      }
      const cName = found.compoundName || found.compound_name;
      if (cName && !watchAll.compoundName) {
        setValue('compoundName', cName, { shouldValidate: true, shouldDirty: true });
      }
      const col = found.compoundColour || found.compound_colour;
      if (col && !watchAll.colour) {
        setValue('colour', col, { shouldDirty: true });
      }
      const hard = found.hardnessShoreA || found.hardness_shore_a || found.hardness;
      if (hard && !watchAll.hardness) {
        setValue('hardness', String(hard), { shouldDirty: true });
      }
      const sp = found.specificGravity || found.specific_gravity;
      if (sp && !watchAll.specificGravity) {
        setValue('specificGravity', String(sp), { shouldDirty: true });
      }
      // Sync Net Weight (kg) from Compound Master
      const rawNet = found.netWeight ?? found.net_weight;
      const netNum = parseFloat(rawNet);
      if (!isNaN(netNum) && netNum > 0) {
        const netStr = String(netNum);
        if (String(watchAll.netCompoundWeight ?? watchAll.netWeight ?? '') !== netStr && (!watchAll.netCompoundWeight || !bom)) {
          setValue('netCompoundWeight', netStr, { shouldValidate: true, shouldDirty: true });
          setValue('netWeight', netStr, { shouldValidate: true, shouldDirty: true });
        }
      }
      // Sync Weight Loss / Fly Loss (%) from Compound Master
      const rawLoss = found.lessWeightLoss ?? found.less_weight_loss;
      if (rawLoss !== undefined && rawLoss !== null && rawLoss !== '') {
        const lossNum = parseFloat(rawLoss);
        if (!isNaN(lossNum)) {
          const lossStr = String(lossNum);
          if (String(watchAll.weightLossFlyLossPercent ?? watchAll.scrapPercent ?? '') !== lossStr && (!watchAll.weightLossFlyLossPercent || !bom)) {
            setValue('weightLossFlyLossPercent', lossStr, { shouldValidate: true, shouldDirty: true });
            setValue('scrapPercent', lossStr, { shouldDirty: true });
          }
        }
      }
      // Sync Compound Gross Weight (kg) from Compound Master
      const rawGross = found.grossWeight ?? found.gross_weight;
      const grossNum = parseFloat(rawGross);
      if (!isNaN(grossNum) && grossNum > 0) {
        const grossStr = String(grossNum);
        if (String(watchAll.grossWeight ?? '') !== grossStr && (!watchAll.grossWeight || !bom)) {
          setValue('grossWeight', grossStr, { shouldValidate: true, shouldDirty: true });
        }
      }
    } else if (currentOrg?.id) {
      supabase
        .from('compound_master')
        .select('*')
        .eq('org_id', currentOrg.id)
        .eq('compound_code', code)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            applyCompoundDetails(data);
          }
        });
    }
  }, [watchAll.compoundCode, masterCompounds, currentOrg?.id, watchAll.netCompoundWeight, watchAll.netWeight, watchAll.weightLossFlyLossPercent, watchAll.grossWeight, bom]);

  // Handle Compound Selection (HeroUI Select passes the compound code directly)
  const handleCompoundSelectByCode = async (compoundCode) => {
    if (!compoundCode) {
      setValue('compoundName', '', { shouldDirty: true });
      setValue('polymer', '', { shouldDirty: true });
      setValue('colour', '', { shouldDirty: true });
      setValue('hardness', '', { shouldDirty: true });
      setValue('specificGravity', '', { shouldDirty: true });
      setValue('netCompoundWeight', '', { shouldDirty: true });
      setValue('netWeight', '', { shouldDirty: true });
      setValue('weightLossFlyLossPercent', '', { shouldDirty: true });
      setValue('scrapPercent', '', { shouldDirty: true });
      setValue('grossWeight', '', { shouldDirty: true });
      return;
    }

    const found = masterCompounds?.find(c => (c.compoundCode || c.compound_code) === compoundCode);
    if (found) {
      applyCompoundDetails(found);
    }

    // Query Supabase directly to ensure freshest compound data including base_polymer
    if (currentOrg?.id) {
      try {
        const { data, error } = await supabase
          .from('compound_master')
          .select('*')
          .eq('org_id', currentOrg.id)
          .eq('compound_code', compoundCode)
          .maybeSingle();
        if (!error && data) {
          applyCompoundDetails(data);
        }
      } catch (err) {
        console.error('Error fetching compound details from Supabase:', err);
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

  // Live Costing Engine (weights in kg)
  const liveCost = useMemo(() => {
    const grossKg = parseFloat(watchAll.grossWeight) || 0;
    const ratePerKg = parseFloat(watchAll.compoundRate) || 0;
    const rubberCost = grossKg * ratePerKg;

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
    return calculateMaterialYield(watchAll.netCompoundWeight ?? watchAll.netWeight, watchAll.grossWeight);
  }, [watchAll.netCompoundWeight, watchAll.netWeight, watchAll.grossWeight]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      bomNo: data.bomNo || watchAll.bomNo || nextBomNo,
      inserts,
      packaging,
      routing,
      images,
      netCompoundWeight: parseFloat(data.netCompoundWeight ?? data.netWeight) || 0,
      netWeight: parseFloat(data.netCompoundWeight ?? data.netWeight) || 0,
      weightLossFlyLossPercent: parseFloat(data.weightLossFlyLossPercent ?? data.scrapPercent) || 0,
      scrapPercent: parseFloat(data.weightLossFlyLossPercent ?? data.scrapPercent) || 0,
      grossWeight: parseFloat(data.grossWeight) || 0,
      compoundRate: parseFloat(data.compoundRate) || 0,
      batchQty: parseInt(data.batchQty) || 100,
      cavities: parseInt(data.cavities) || 1,
      cycleTimeSec: parseFloat(data.cycleTimeSec) || 180,
      overheadCost: parseFloat(data.overheadCost) || 0,
    };

    const orgId = currentOrg?.id || (() => {
      try {
        const raw = localStorage.getItem('rubbertics_current_org');
        return raw ? JSON.parse(raw)?.id : null;
      } catch (e) {
        return null;
      }
    })();

    if (mode === 'edit') {
      await updateBOM(bom.id, payload, orgId, currentUser?.id);
    } else {
      await addBOM(payload, orgId, currentUser?.id);
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
                {watchAll.bomNo ? `BOM No: ${watchAll.bomNo}${watchAll.revisionNo ? ` · ${watchAll.revisionNo}` : ''}` : 'Fill the compound and production specifications'}
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
              <Controller name="creationDate" control={control} render={({ field }) => (
                <Field label="Creation Date">
                  <div className="relative">
                    <input
                      {...field}
                      disabled
                      readOnly
                      className={`${inputCls} bg-slate-100/80 text-slate-600 font-bold cursor-not-allowed border-slate-200 select-none`}
                    />
                  </div>
                </Field>
              )} />
              <Controller name="bomNo" control={control} render={({ field }) => (
                <Field label="BOM Number">
                  <div className="relative">
                    <input
                      {...field}
                      value={field.value || nextBomNo}
                      disabled
                      readOnly
                      className={`${inputCls} bg-slate-100/80 text-slate-600 font-mono font-bold cursor-not-allowed border-slate-200 select-none pr-20`}
                      placeholder="Auto-generated"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 pointer-events-none">
                      Auto
                    </span>
                  </div>
                </Field>
              )} />

              <Controller name="bomTitle" control={control} render={({ field }) => (
                <Field label="BOM Description / Title" colClass="md:col-span-2 xl:col-span-2">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. Engine Mounting Bush Assembly" />
                </Field>
              )} />

              <Controller name="status" control={control} render={({ field }) => (
                <Field label="Status">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Status"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder="Select Status" />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {['Active', 'Draft', 'Under Review', 'Obsolete'].map(s => (
                          <ListBox.Item key={s} id={s} textValue={s}>
                            <span className="font-bold text-slate-800">{s}</span>
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />

              {/* Finished Item link */}
              <Controller name="itemCode" control={control} render={({ field }) => (
                <Field label="Finished Item Code (Item Master)">
                  <Select
                    value={field.value || null}
                    onChange={(val) => {
                      field.onChange(val);
                      handleItemSelectByCode(val);
                    }}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Finished Item Code"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isItemsLoading ? 'Loading items...' : 'Select Item from Master'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !masterItems?.some(it => (it.itemCode || it.item_code) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {masterItems?.map(it => {
                          const code = it.itemCode || it.item_code;
                          const name = it.itemName || it.customerItemName || it.item_name || '';
                          return (
                            <ListBox.Item key={it.id || code} id={code} textValue={`${code} ${name}`}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span className="font-bold text-slate-800">{code} - {name}</span>
                              </div>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
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
                  <input
                    {...field}
                    value={field.value ?? ''}
                    disabled={isView}
                    className={inputCls}
                    placeholder="Auto-fetched from Item Master"
                  />
                </Field>
              )} />

              <Controller name="outputUom" control={control} render={({ field }) => (
                <Field label="Output UOM">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Output UOM"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder="Select UOM" />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {['Pcs', 'Kgs', 'Mtrs', 'Sets'].map(u => (
                          <ListBox.Item key={u} id={u} textValue={u}>
                            <span className="font-bold text-slate-800">{u}</span>
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />

              <Controller name="batchQty" control={control} render={({ field }) => (
                <Field label="Standard Batch Qty">
                  <input
                    {...field}
                    value={field.value ?? ''}
                    disabled={isView}
                    type="number"
                    className={inputCls}
                    placeholder="Auto-fetched from Item Master"
                  />
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
                  <input
                    {...field}
                    value={field.value || ''}
                    readOnly
                    className={`${inputCls} bg-slate-50 cursor-default`}
                    placeholder="Auto-filled from Tools Master"
                  />
                </Field>
              )} />

              <Controller name="cavities" control={control} render={({ field }) => (
                <Field label="No. of Cavities">
                  <input {...field} disabled={isView} type="number" className={inputCls} placeholder="1" />
                </Field>
              )} />

              <Controller name="toolItemNetWeight" control={control} render={({ field }) => (
                <Field label="Item Net Weight (kg)">
                  <input {...field} readOnly className={`${inputCls} bg-slate-50 cursor-default`} placeholder="Auto-filled from Tool" />
                </Field>
              )} />

              <Controller name="toolSortWeight" control={control} render={({ field }) => (
                <Field label="Sort Weight (kg)">
                  <input {...field} readOnly className={`${inputCls} bg-slate-50 cursor-default`} placeholder="Auto-filled from Tool" />
                </Field>
              )} />

              <Controller name="cycleTimeSec" control={control} render={({ field }) => (
                <Field label="Cycle Time (Seconds)">
                  <input {...field} disabled={isView} type="number" className={inputCls} placeholder="180" />
                </Field>
              )} />

              <Controller name="machinePress" control={control} render={({ field }) => (
                <Field label="Machine / Press (Machine Master)">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Machine Press"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isMachinesLoading ? 'Loading machines...' : 'Select Press / Extruder'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !masterMachines?.some(m => (m.machineCode || m.machine_code) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {masterMachines?.map(m => {
                          const code = m.machineCode || m.machine_code;
                          const name = m.machineName || m.machine_name;
                          return (
                            <ListBox.Item key={m.id || code} id={code} textValue={`${code} ${name}`}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span className="font-bold text-slate-800">{code} - {name}</span>
                              </div>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />
            </div>
          </Section>

          {/* 2. RUBBER COMPOUND & WEIGHT CALCULATIONS */}
          <Section title="2. RUBBER COMPOUND & WEIGHT CALCULATIONS" icon={Beaker} subtitle="Compound gross weight, weight loss / fly loss and specifications auto-fetched from Compound Master">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <Controller name="compoundCode" control={control} render={({ field }) => (
                <Field label="Compound Code (Compound Master)">
                  <Select
                    value={field.value || null}
                    onChange={(val) => {
                      field.onChange(val);
                      handleCompoundSelectByCode(val);
                    }}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Compound Code"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isCompoundsLoading ? 'Loading compounds...' : 'Select Compound'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !masterCompounds?.some(c => (c.compoundCode || c.compound_code) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {masterCompounds?.map(c => {
                          const code = c.compoundCode || c.compound_code;
                          const name = c.compoundName || c.compound_name;
                          const net = c.netWeight ?? c.net_weight;
                          return (
                            <ListBox.Item key={c.id || code} id={code} textValue={`${code} ${name}`}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span className="font-bold text-slate-800">{code} - {name}{net ? ` (${net} kg)` : ''}</span>
                              </div>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />

              <Controller name="compoundName" control={control} render={({ field }) => (
                <Field label="Compound Name / Grade">
                  <input {...field} disabled={isView} className={inputCls} placeholder="e.g. High Resilient NR-65" />
                </Field>
              )} />

              <Controller name="polymer" control={control} render={({ field }) => (
                <Field label="Base Polymer">
                  <input
                    {...field}
                    value={field.value ?? ''}
                    disabled={isView}
                    list="bom-page-polymer-options"
                    className={inputCls}
                    placeholder="e.g. Natural Rubber (NR), Butyl (IIR)..."
                  />
                  <datalist id="bom-page-polymer-options">
                    {POLYMER_OPTIONS.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
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

              <Controller name="netCompoundWeight" control={control} render={({ field }) => (
                <Field label="Net Compound Weight (kg)">
                  <input
                    {...field}
                    disabled={isView}
                    type="number"
                    step="0.0001"
                    className={inputCls}
                    placeholder="0.00"
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('netWeight', e.target.value, { shouldDirty: true });
                      const net = parseFloat(e.target.value) || 0;
                      const loss = parseFloat(watchAll.weightLossFlyLossPercent ?? watchAll.scrapPercent) || 0;
                      if (net > 0 && loss > 0) {
                        const calcGross = calculateGrossWeight(net, loss);
                        setValue('grossWeight', String(calcGross), { shouldDirty: true });
                      }
                    }}
                  />
                </Field>
              )} />

              <Controller name="weightLossFlyLossPercent" control={control} render={({ field }) => (
                <Field label="Weight Loss / Fly Loss (%)">
                  <input
                    {...field}
                    disabled={isView}
                    type="number"
                    step="0.01"
                    className={inputCls}
                    placeholder="Auto-fetched from Compound Master"
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('scrapPercent', e.target.value, { shouldDirty: true });
                      const net = parseFloat(watchAll.netCompoundWeight ?? watchAll.netWeight) || 0;
                      const loss = parseFloat(e.target.value) || 0;
                      if (net > 0) {
                        const calcGross = calculateGrossWeight(net, loss);
                        setValue('grossWeight', String(calcGross), { shouldDirty: true });
                      }
                    }}
                  />
                </Field>
              )} />

              <Controller name="grossWeight" control={control} render={({ field }) => (
                <Field label="Compound Gross Weight (kg)">
                  <input
                    {...field}
                    disabled={isView}
                    type="number"
                    step="0.0001"
                    className={inputCls}
                    placeholder="Auto-fetched from Compound Master"
                  />
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

          {/* 4. MANUFACTURING PROCESS ROUTING */}
          <Section title="4. MANUFACTURING PROCESS ROUTING" icon={Clock} subtitle="Sequential shop-floor operations from slug preparation to 100% final QC">
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

          {/* 5. PACKAGING MATERIALS */}
          <Section title="5. PACKAGING MATERIALS" icon={Boxes} subtitle="Corrugated boxes, poly liner bags, and barcode shipping labels">
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

          {/* 6. PRODUCT & PART IMAGES */}
          <Section
            title="6. PRODUCT & PART IMAGES"
            icon={ImageIcon}
            subtitle="Upload finished product photos, technical 2D/3D CAD drawings, flash inspection views, and QA reference images"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">
                  {images.length === 0 ? 'No images uploaded' : `${images.length} image${images.length > 1 ? 's' : ''} attached`}
                </span>
                {!isView && (
                  <button
                    type="button"
                    onClick={addImageRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Image
                  </button>
                )}
              </div>

              {images.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                    <ImageIcon size={22} />
                  </div>
                  <div className="max-w-sm">
                    <p className="text-sm font-bold text-slate-700">No images or drawings uploaded yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload part photographs, 2D engineering drawings, or tooling reference images
                    </p>
                  </div>
                  {!isView && (
                    <button
                      type="button"
                      onClick={addImageRow}
                      className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((img, idx) => {
                    const displaySrc = img.fileData || img.url;
                    return (
                      <div
                        key={img.id || idx}
                        className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Preview Area */}
                        <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                          {displaySrc ? (
                            <img
                              src={displaySrc}
                              alt={img.title || `BOM Image ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-4 text-center">
                              <UploadCloud size={24} className="opacity-60 text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-500">Click icon to select image</span>
                            </div>
                          )}

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {displaySrc && (
                              <button
                                type="button"
                                onClick={() => setSelectedPreviewImage(img)}
                                className="w-8 h-8 rounded-lg bg-white/95 text-slate-800 hover:bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                                title="View Fullscreen"
                              >
                                <ZoomIn size={15} />
                              </button>
                            )}
                            {!isView && (
                              <>
                                <label
                                  className="w-8 h-8 rounded-lg bg-white/95 text-slate-800 hover:bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                                  title="Upload / Replace Image"
                                >
                                  <UploadCloud size={15} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageFileChange(img.id, e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeImage(img.id)}
                                  className="w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Card Body - Title & Details */}
                        <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between bg-white">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Image Title / Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              disabled={isView}
                              value={img.title || ''}
                              onChange={(e) => updateImage(img.id, 'title', e.target.value)}
                              placeholder="e.g. Finished Product View, 2D Drawing"
                              className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-50">
                            <span className="truncate max-w-[150px]" title={img.fileName || 'Pending upload'}>
                              {img.fileName || (displaySrc ? 'Image attached' : 'No file chosen')}
                            </span>
                            {displaySrc && (
                              <span className="text-emerald-600 font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] uppercase">
                                {img.fileType ? img.fileType.split('/')[1] || 'IMG' : 'READY'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          {/* 7. STANDARD COST & YIELD ANALYSIS */}
          <Section title="7. STANDARD COST & YIELD ANALYSIS" icon={Calculator} subtitle="Reconciliation of material, inserts, packaging, and factory machine overhead">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rubber Material</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">₹{liveCost.rubberCost.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{watchAll.grossWeight || 0}kg @ ₹{watchAll.compoundRate || 0}/kg</span>
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

          {/* 8. AUTHORIZATION & REMARKS */}
          <Section title="8. AUTHORIZATION & REMARKS" icon={ShieldCheck}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <Controller name="prepared_by" control={control} render={({ field }) => (
                <Field label="Prepared By">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Prepared By"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isEmployeesLoading ? 'Loading employees...' : 'Select Employee'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {employees?.map(e => {
                          const name = e.employeeName || e.employee_name;
                          return (
                            <ListBox.Item key={e.id || e.employeeId || name} id={name} textValue={name}>
                              <span className="font-bold text-slate-800">{name}</span>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />

              <Controller name="checked_by" control={control} render={({ field }) => (
                <Field label="Checked By (QA)">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Checked By"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isEmployeesLoading ? 'Loading employees...' : 'Select Employee'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {employees?.map(e => {
                          const name = e.employeeName || e.employee_name;
                          return (
                            <ListBox.Item key={e.id || e.employeeId || name} id={name} textValue={name}>
                              <span className="font-bold text-slate-800">{name}</span>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Field>
              )} />

              <Controller name="approved_by" control={control} render={({ field }) => (
                <Field label="Approved By (Plant Lead)">
                  <Select
                    value={field.value || null}
                    onChange={field.onChange}
                    isDisabled={isView}
                    className="w-full"
                    aria-label="Approved By"
                  >
                    <Select.Trigger className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}>
                      <Select.Value placeholder={isEmployeesLoading ? 'Loading employees...' : 'Select Employee'} />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {field.value && !employees?.some(e => (e.employeeName || e.employee_name) === field.value) && (
                          <ListBox.Item key={`current-${field.value}`} id={field.value} textValue={field.value}>
                            <span className="font-bold text-slate-800">{field.value} (Current)</span>
                          </ListBox.Item>
                        )}
                        {employees?.map(e => {
                          const name = e.employeeName || e.employee_name;
                          return (
                            <ListBox.Item key={e.id || e.employeeId || name} id={name} textValue={name}>
                              <span className="font-bold text-slate-800">{name}</span>
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>
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

        {/* Fullscreen Image Lightbox Preview Modal */}
        {selectedPreviewImage && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      {selectedPreviewImage.title || selectedPreviewImage.fileName || 'Product Image Preview'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {selectedPreviewImage.fileName || 'BOM Reference Image'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(selectedPreviewImage.url || selectedPreviewImage.fileData) && (
                    <a
                      href={selectedPreviewImage.url || selectedPreviewImage.fileData}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Open full image in new tab"
                    >
                      <ExternalLink size={17} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewImage(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-auto flex items-center justify-center bg-slate-950/5 min-h-[300px]">
                <img
                  src={selectedPreviewImage.url || selectedPreviewImage.fileData}
                  alt={selectedPreviewImage.title || 'Product Image'}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-200/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function BillOfMaterialsPage() {
  const { currentOrg } = useAuthStore();
  const { fetchBOMs } = useBOMStore();
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
      fetchBOMs(orgId);
      fetchItems(orgId);
      fetchCompounds(orgId);
      fetchTools(orgId);
      fetchMachines(orgId);
      fetchEmployees(orgId);
    }
  }, [currentOrg?.id, fetchBOMs, fetchItems, fetchCompounds, fetchTools, fetchMachines, fetchEmployees]);

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
      const y = calculateMaterialYield(b.netCompoundWeight ?? b.netWeight, b.grossWeight);
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
      accessor: 'creationDate',
      header: 'Creation Date',
      render: (val) => val ? formatTableDate(val, 'creationDate') : '-',
    },
    {
      accessor: 'bomNo',
      header: 'BOM No.',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-emerald-700 uppercase font-mono">{val}</span>
          {row.revisionNo ? (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
              {row.revisionNo}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessor: 'itemName',
      header: 'Finished Product',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.images && row.images.length > 0 && (row.images[0]?.url || row.images[0]?.fileData) ? (
            <img
              src={row.images[0].url || row.images[0].fileData}
              alt={row.images[0].title || val}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-400 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
          )}
          <div>
            <span className="font-bold text-slate-800 block">{val}</span>
            <span className="text-[11px] text-slate-500 font-mono">{row.itemCode || '-'} {row.customerPartNo ? `· ${row.customerPartNo}` : ''}</span>
          </div>
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
      header: 'Net Compound / Gross (kg)',
      align: 'right',
      render: (_, row) => (
        <div className="text-right font-medium">
          <span className="font-bold text-slate-900">{row.netCompoundWeight ?? row.netWeight}kg</span>
          <span className="text-slate-400 text-[11px] block">Gross: {row.grossWeight}kg</span>
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-semibold text-white pointer-events-auto transition-all animate-fadeIn ${n.type === 'error' ? 'bg-red-600' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-600'
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
