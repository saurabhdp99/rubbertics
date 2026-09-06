import React from 'react';
import {
  X, Printer, Edit, Copy, CheckCircle2, Layers, Package, Beaker, Wrench, Boxes, Clock, FileText
} from 'lucide-react';
import { useBOMStore } from '../../store/bomStore';
import { calculateMaterialYield, calculateBOMCost } from '../../data/bomTemplate';

export default function BOMDetailViewModal() {
  const { isDetailModalOpen, selectedBOM, setDetailModalOpen, setModalOpen, duplicateBOM } = useBOMStore();

  if (!isDetailModalOpen || !selectedBOM) return null;

  const bom = selectedBOM;
  const costs = calculateBOMCost(bom);
  const yieldPct = calculateMaterialYield(bom.netWeight, bom.grossWeight);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    setDetailModalOpen(false);
    setModalOpen(true, 'edit', bom);
  };

  const handleDuplicate = () => {
    setDetailModalOpen(false);
    duplicateBOM(bom.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">

        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              {bom.status}
            </span>
            <span className="text-[14px] font-bold text-slate-800 font-mono">{bom.bomNo}</span>
            <span className="text-[13px] text-slate-400">·</span>
            <span className="text-[13px] font-semibold text-slate-600">{bom.revisionNo || 'Rev 1.0'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              Print / PDF
            </button>

            <button
              type="button"
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Copy size={14} />
              Clone Revision
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Edit size={14} />
              Edit BOM
            </button>

            <button
              type="button"
              onClick={() => setDetailModalOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Technical Spec Sheet Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar print:p-0 print:overflow-visible">
          
          {/* Engineering Sheet Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[20px] font-black text-slate-900 tracking-tight uppercase">
                  Rubbertics Engineering Specification
                </h1>
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Standard Bill of Materials (BOM) & Process Sheet
                </p>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-black font-mono text-emerald-700">{bom.bomNo}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Date: {bom.effectiveDate || '2026-09-06'}</div>
              </div>
            </div>
          </div>

          {/* Section 1: Item & Document Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[12px] mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Finished Item Code</span>
              <span className="font-bold text-slate-800 font-mono text-[13px]">{bom.itemCode || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Finished Part Name</span>
              <span className="font-bold text-slate-800 text-[13px]">{bom.itemName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Part No</span>
              <span className="font-semibold text-slate-700">{bom.customerPartNo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drawing / Revision</span>
              <span className="font-semibold text-slate-700">{bom.drawingNo || 'N/A'} ({bom.revisionNo || 'Rev 1.0'})</span>
            </div>
          </div>

          {/* Section 2: Rubber Compound Details */}
          <div className="mb-6">
            <div className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Beaker size={14} className="text-emerald-600" />
              1. Base Rubber Compound & Weight Analysis
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Compound Code / Grade</span>
                <span className="font-bold text-emerald-700">{bom.compoundCode} - {bom.compoundName}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Polymer & Hardness</span>
                <span className="font-medium text-slate-800">{bom.polymer} · {bom.hardness}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Part Weight</span>
                <span className="font-bold text-slate-800">{bom.netWeight} grams</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gross Weight (with Scrap)</span>
                <span className="font-extrabold text-slate-900">{bom.grossWeight} g <span className="text-slate-400 text-[10px]">({bom.scrapPercent}% scrap)</span></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-[12px] mt-2">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                <span className="text-slate-500">Mould / Cavities:</span>
                <span className="font-semibold text-slate-800">{bom.mouldCode || 'N/A'} ({bom.cavities || 1} Cav)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                <span className="text-slate-500">Cure Cycle:</span>
                <span className="font-semibold text-slate-800">{bom.cycleTimeSec || 0} Seconds</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                <span className="text-slate-500">Material Yield:</span>
                <span className="font-bold text-emerald-700">{yieldPct}%</span>
              </div>
            </div>
          </div>

          {/* Section 3: Inserts & Sub-Components */}
          {bom.inserts && bom.inserts.length > 0 && (
            <div className="mb-6">
              <div className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Layers size={14} className="text-emerald-600" />
                2. Inserts & Sub-Components (Rubber-to-Metal Bonding)
              </div>
              <table className="w-full text-left border-collapse text-[12px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Component Description</th>
                    <th className="p-2.5">Material</th>
                    <th className="p-2.5 text-center">Qty/Pc</th>
                    <th className="p-2.5">Bonding Primer (Chemlok)</th>
                    <th className="p-2.5 text-right">Unit Rate (₹)</th>
                    <th className="p-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bom.inserts.map((ins, i) => (
                    <tr key={i}>
                      <td className="p-2 font-semibold text-slate-800">{ins.partName}</td>
                      <td className="p-2 text-slate-600">{ins.material || '-'}</td>
                      <td className="p-2 text-center font-bold">{ins.qty}</td>
                      <td className="p-2 text-slate-600">{ins.primer || '-'}</td>
                      <td className="p-2 text-right">₹{parseFloat(ins.unitCost || 0).toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        ₹{((parseFloat(ins.qty) || 0) * (parseFloat(ins.unitCost) || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 4: Packaging */}
          {bom.packaging && bom.packaging.length > 0 && (
            <div className="mb-6">
              <div className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Boxes size={14} className="text-emerald-600" />
                3. Standard Packaging Materials
              </div>
              <table className="w-full text-left border-collapse text-[12px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Packaging Material</th>
                    <th className="p-2.5 text-center">Standard Pack Qty</th>
                    <th className="p-2.5 text-right">Cost per Pack</th>
                    <th className="p-2.5 text-right">Cost / Piece</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bom.packaging.map((pkg, i) => (
                    <tr key={i}>
                      <td className="p-2 font-semibold text-slate-800">{pkg.materialName}</td>
                      <td className="p-2 text-center">{pkg.packQty} pcs</td>
                      <td className="p-2 text-right">₹{parseFloat(pkg.costPerPack || 0).toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        ₹{(parseFloat(pkg.packQty) > 0 ? parseFloat(pkg.costPerPack || 0) / parseFloat(pkg.packQty) : 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Process Routing Sequence */}
          {bom.routing && bom.routing.length > 0 && (
            <div className="mb-6">
              <div className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Clock size={14} className="text-emerald-600" />
                4. Manufacturing Operations & Routing Sequence
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-[12px]">
                {bom.routing.map((step, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {step.stepNo || (i + 1) * 10}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{step.operation}</div>
                        {step.notes && <div className="text-[11px] text-slate-500">{step.notes}</div>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-600 block">{step.workCenter}</span>
                      <span className="text-[10px] text-slate-400">{step.cycleTimeMin} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Standard Costing Summary Block */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 mb-6">
            <div className="text-[12px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
              5. Standard Unit Cost Summary
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-[12px]">
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Rubber Material</span>
                <span className="font-bold text-slate-800">₹{costs.rubberCost.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Inserts & Bonding</span>
                <span className="font-bold text-slate-800">₹{costs.insertsCost.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Packaging</span>
                <span className="font-bold text-slate-800">₹{costs.packagingCost.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Labor & Overhead</span>
                <span className="font-bold text-slate-800">₹{costs.laborOverhead.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs sm:col-span-1 col-span-2">
                <span className="text-[10px] text-emerald-100 block uppercase font-bold">Total Unit Cost</span>
                <span className="font-extrabold text-[15px]">₹{costs.totalUnitCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 7: Engineering Sign-Off Approval Block */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="grid grid-cols-3 gap-6 text-center text-[11px] text-slate-600">
              <div className="border-t border-dashed border-slate-300 pt-2">
                <span className="font-bold text-slate-700 block">Prepared By</span>
                <span>Process Engineer</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2">
                <span className="font-bold text-slate-700 block">Verified By</span>
                <span>QA & Tooling Lead</span>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2">
                <span className="font-bold text-slate-700 block">Approved By</span>
                <span>Plant Technical Director</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
