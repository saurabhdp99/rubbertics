import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';

function formatGrnDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function InwardGrnPdfModal({ isOpen, onClose, entry, org }) {
  const printRef = useRef(null);

  if (!isOpen || !entry) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyName = org?.name || 'Nisarg Polymers Private Limted';
  const poNo = entry.po_no || '';
  const grnNo = entry.grn_no || '';
  const invoiceChallanNo = [entry.invoice_no, entry.challan_received].filter(Boolean).join(' / ') || entry.invoice_no || '-';
  const dateGoodsReceived = formatGrnDate(entry.receipt_date || entry.created_at);

  const materials = Array.isArray(entry.materials) && entry.materials.length > 0
    ? entry.materials
    : [{
        item_code: entry.item_code || '',
        description: entry.description || '',
        received_qty: entry.quantity || entry.received_qty || '',
        uom: entry.uom || 'KG',
        remarks: entry.remarks || ''
      }];

  // Verification details
  const tcReceived = entry.tc_coa_received || (entry.tc_coa_no ? `Yes (${entry.tc_coa_no})` : 'Yes');
  const qtyVerifiedBy = entry.qty_verified_name || entry.recv_verified_name || 'Verified';
  const qualityVerified = entry.qc_verified_status || entry.qc_status || entry.final_qc_decision_by || 'Verified';

  // Ensure table has at least 6 material rows for standard visual presentation
  const minMaterialRows = 5;
  const blankRowsCount = Math.max(0, minMaterialRows - materials.length);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:overflow-visible">
      <div className="relative bg-white text-black w-full max-w-[850px] my-auto rounded-xl shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none print:rounded-none">

        {/* Modal Top Actions Toolbar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="text-emerald-400" size={20} />
            <div>
              <h3 className="font-bold text-base leading-tight">Goods Received Note (GRN) Preview</h3>
              <p className="text-xs text-slate-400">{grnNo ? `GRN No: ${grnNo}` : 'Document View'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-emerald-900/30"
              title="Print or Save as PDF"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* GRN Printable Container */}
        <div id="grn-print-area" ref={printRef} className="p-8 sm:p-10 font-sans text-xs bg-white text-black leading-tight border-2 border-black m-4 print:m-0 print:p-8 print:border-black">

          {/* Top Document Header */}
          <div className="border border-black grid grid-cols-12 items-stretch">
            {/* Logo and Tagline */}
            <div className="col-span-3 p-3 flex flex-col items-center justify-center border-r border-black">
              <div className="w-14 h-7 rounded-full border-2 border-teal-600 flex items-center justify-center text-[11px] font-black tracking-tighter text-teal-700 bg-teal-50">
                NP
              </div>
              <div className="text-[7px] italic text-slate-700 font-semibold mt-1 whitespace-nowrap">
                We Deliver Quality.....
              </div>
            </div>

            {/* Company Name */}
            <div className="col-span-6 p-3 flex items-center justify-center text-center border-r border-black">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-black">
                {companyName}
              </h1>
            </div>

            {/* Document Control Info */}
            <div className="col-span-3 text-[10px] flex flex-col justify-between font-medium">
              <div className="p-1.5 border-b border-black text-left px-2">
                NPPL/F/116
              </div>
              <div className="p-1.5 border-b border-black text-left px-2">
                Rev- 00
              </div>
              <div className="p-1.5 text-left px-2">
                Rev Date- 01/04/2021
              </div>
            </div>
          </div>

          {/* Main Title Banner */}
          <div className="border-x border-b border-black bg-slate-200 py-2.5 text-center font-bold text-base tracking-wider uppercase text-black">
            GOODS RECEIVED NOTE (GRN)
          </div>

          {/* Top Metadata Info Rows */}
          <div className="border-x border-b border-black text-[11px]">
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black uppercase">
                PURCHASE ORDER NO
              </div>
              <div className="col-span-8 p-1.5 px-3 font-medium uppercase">
                {poNo || '-'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black">
                GRN No.
              </div>
              <div className="col-span-8 p-1.5 px-3 font-bold">
                {grnNo || '-'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black uppercase">
                INVOICE/CHALLAN NO
              </div>
              <div className="col-span-8 p-1.5 px-3 font-medium uppercase">
                {invoiceChallanNo}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black uppercase">
                DATE GOODS RECEIVED
              </div>
              <div className="col-span-8 p-1.5 px-3 font-medium">
                {dateGoodsReceived || '-'}
              </div>
            </div>
          </div>

          {/* Items & Verification Table */}
          <div className="border-x border-b border-black">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-black text-center font-bold uppercase">
                  <th className="py-1.5 px-3 border-r border-black w-[42%] text-center">
                    NAME
                  </th>
                  <th className="py-1.5 px-3 border-r border-black w-[28%] text-center">
                    RECEIVED QTY
                  </th>
                  <th className="py-1.5 px-3 w-[30%] text-center">
                    REMARKS
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Material rows */}
                {materials.map((mat, idx) => {
                  const name = [mat.description, mat.item_code ? `(${mat.item_code})` : ''].filter(Boolean).join(' ') || mat.description || mat.item_code || '-';
                  const qty = mat.received_qty || mat.accepted_qty || '';
                  const qtyDisplay = qty ? `${qty} ${mat.uom || 'KG'}` : '';
                  return (
                    <tr key={idx} className="border-b border-black min-h-[30px] h-[30px]">
                      <td className="py-1.5 px-3 border-r border-black font-semibold uppercase">
                        {name}
                      </td>
                      <td className="py-1.5 px-3 border-r border-black text-center font-bold">
                        {qtyDisplay}
                      </td>
                      <td className="py-1.5 px-3">
                        {mat.remarks || ''}
                      </td>
                    </tr>
                  );
                })}

                {/* Additional empty rows for standard height */}
                {Array.from({ length: blankRowsCount }).map((_, i) => (
                  <tr key={`blank-${i}`} className="border-b border-black h-[28px]">
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ))}

                {/* Verification rows */}
                <tr className="border-b border-black h-[28px]">
                  <td className="py-1 px-3 border-r border-black font-bold uppercase text-center">
                    T.C RECEIVED
                  </td>
                  <td className="py-1 px-3 border-r border-black text-center font-medium">
                    {tcReceived}
                  </td>
                  <td className="py-1 px-3">
                    {entry.tc_coa_remarks || ''}
                  </td>
                </tr>

                <tr className="border-b border-black h-[28px]">
                  <td className="py-1 px-3 border-r border-black font-bold uppercase text-center">
                    QTY VERIFIED BY
                  </td>
                  <td className="py-1 px-3 border-r border-black text-center font-medium">
                    {qtyVerifiedBy}
                  </td>
                  <td className="py-1 px-3">
                    {entry.qty_verified_remarks || ''}
                  </td>
                </tr>

                <tr className="border-b border-black h-[28px]">
                  <td className="py-1 px-3 border-r border-black font-bold uppercase text-center">
                    QUALITY VERIFIED
                  </td>
                  <td className="py-1 px-3 border-r border-black text-center font-medium">
                    {qualityVerified}
                  </td>
                  <td className="py-1 px-3">
                    {entry.qc_verified_remarks || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Receiver Signed Row */}
          <div className="border-x border-b border-black grid grid-cols-12 text-[11px] h-[36px] items-stretch">
            <div className="col-span-4 p-2 px-3 font-bold border-r border-black flex items-center uppercase">
              RECEIVER SIGNED
            </div>
            <div className="col-span-4 p-2 px-3 border-r border-black flex items-center font-medium">
              {entry.recv_verified_name || ''}
            </div>
            <div className="col-span-2 p-2 px-2 font-bold border-r border-black flex items-center justify-center uppercase text-[10px]">
              RECEIVED DATE
            </div>
            <div className="col-span-2 p-2 px-2 flex items-center justify-center font-medium text-[10px]">
              {dateGoodsReceived || '-'}
            </div>
          </div>

          {/* Office Use Section Banner */}
          <div className="border-x border-b border-black bg-white py-2 text-center font-bold text-xs tracking-wider uppercase text-black">
            FOR OFFICE USES ONLY
          </div>

          {/* Office Use Rows */}
          <div className="border-x border-b border-black text-[11px]">
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black uppercase text-center">
                PO NUMBER
              </div>
              <div className="col-span-8 p-1.5 px-3 font-medium uppercase">
                {poNo || '-'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-4 p-1.5 px-3 font-bold border-r border-black uppercase text-center">
                GRN NO
              </div>
              <div className="col-span-8 p-1.5 px-3 font-bold uppercase">
                {grnNo || '-'}
              </div>
            </div>

            <div className="grid grid-cols-12 min-h-[50px]">
              <div className="col-span-4 p-2 px-3 font-bold border-r border-black uppercase text-center flex items-center justify-center">
                AUTHORISED SIGNATURE
              </div>
              <div className="col-span-8 p-2 px-3 flex items-end justify-end">
                <span className="text-[10px] text-slate-500 italic">Authorised Signatory</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Print-specific CSS injected */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            body * {
              visibility: hidden;
            }
            #grn-print-area, #grn-print-area * {
              visibility: visible;
            }
            #grn-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 2px solid #000 !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          }
        `
      }} />
    </div>
  );
}
