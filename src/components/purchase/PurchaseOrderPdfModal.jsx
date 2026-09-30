import React, { useRef } from 'react';
import { X, Printer, Download, Eye, FileText } from 'lucide-react';

// ── Number to Indian Words Helper ──────────────────────────────────────────
export function numberToIndianWords(amount) {
  if (!amount || isNaN(amount) || Number(amount) === 0) return 'Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWordsLessThanThousand(num) {
    let str = '';
    if (num >= 100) {
      str += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += ones[num] + ' ';
    }
    return str.trim();
  }

  const [intPart, decPart] = Number(amount).toFixed(2).split('.');
  let num = parseInt(intPart, 10);
  if (num === 0 && (!decPart || parseInt(decPart, 10) === 0)) return 'Zero Only';

  let words = '';
  // Crores
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    words += numToWordsLessThanThousand(crore) + ' Crore ';
    num %= 10000000;
  }
  // Lakhs
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    words += numToWordsLessThanThousand(lakh) + ' Lakh ';
    num %= 100000;
  }
  // Thousands
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    words += numToWordsLessThanThousand(thousand) + ' Thousand ';
    num %= 1000;
  }
  // Hundreds / rest
  if (num > 0) {
    words += numToWordsLessThanThousand(num) + ' ';
  }

  words = words.trim();
  let result = words ? words : 'Zero';

  const decNum = parseInt(decPart, 10);
  if (decNum > 0) {
    result += ' and ' + numToWordsLessThanThousand(decNum) + ' Paise';
  }

  return 'INR ' + result + ' Only';
}

function formatPoDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const yr = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${yr}`;
}

export default function PurchaseOrderPdfModal({ isOpen, onClose, order, vendorParty, org }) {
  const printRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Derive PO details
  const voucherNo = order.npplPoNo || order.poNo || '26-27/123';
  const poDate = formatPoDate(order.date || order.createdDate);
  const paymentTerms = order.paymentTerms || '10 Days';
  const transport = order.transport || 'S Nitin Transport';
  const destination = order.deliveryTerms || 'Vasai(E)';

  // Company details
  const companyName = org?.name || 'Nisarg Polymers Pvt Ltd';
  const companyAddress = 'A/13, Jay Vijay Ind. Estate, Opp. Dhuri Ind. Estate\nWaliv Phata, Vasai (E), Palghar 401208';
  const companyCountry = 'Country of origin - INDIA';
  const companyContact = 'Contact No. 8530640111, 9867267545';
  const companyGstin = '27AAHCN0987F1Z8';
  const companyState = 'Maharashtra, Code : 27';
  const companyPan = 'AAHCN0987F';
  const companyCin = 'U25209MH2020PTC343993';
  const companyEmail = 'sales@nisargpolymers.com';

  // Vendor details
  const vendorName = order.vendorName || vendorParty?.party_name || vendorParty?.partyName || 'Supplier';
  const vendorAddress = vendorParty?.address || order.vendorAddress || '';
  const vendorGstin = vendorParty?.gst_no || vendorParty?.gstNo || '';
  const vendorStateName = vendorParty?.state || (vendorGstin.startsWith('27') ? 'Maharashtra' : '');
  const vendorStateCode = vendorParty?.gst_state_code || (vendorGstin.length >= 2 ? vendorGstin.substring(0, 2) : '27');

  // Items processing
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{
        productName: order.productName || 'SILICONE RUBBER HS-3451',
        partNo: order.partNo || '',
        orderQty: order.orderQty || 200,
        uom: order.uom || 'kg',
        price: order.price || 275,
        schedules: order.deliveryDate ? [{ deliveryDate: order.deliveryDate, scheduleQty: order.orderQty }] : []
      }];

  let totalQty = 0;
  let subtotalAmount = 0;

  const processedItems = items.map((item, idx) => {
    const qty = Number(item.orderQty || item.quantity || 0);
    const rate = Number(item.price || item.rate || 0);
    const amount = qty * rate;
    totalQty += qty;
    subtotalAmount += amount;

    // Delivery date from schedules or item or order
    const scheduleDate = item.schedules?.[0]?.deliveryDate || item.deliveryDate || order.deliveryDate || order.date;
    const dueOn = formatPoDate(scheduleDate);

    const description = [item.productName, item.partNo ? `(${item.partNo})` : ''].filter(Boolean).join(' ') || 'Item ' + (idx + 1);

    return {
      sr: idx + 1,
      description,
      dueOn,
      quantity: qty,
      uom: item.uom || 'kg',
      rate: rate,
      amount: amount
    };
  });

  // Tax calculations
  // Intra-state (Maharashtra code 27): CGST 9% + SGST 9%
  // Inter-state: IGST 18%
  const isIntraState = !vendorStateCode || vendorStateCode === '27';
  let cgstRate = isIntraState ? 9 : 0;
  let sgstRate = isIntraState ? 9 : 0;
  let igstRate = !isIntraState ? 18 : 0;

  let cgstAmount = isIntraState ? (subtotalAmount * cgstRate) / 100 : 0;
  let sgstAmount = isIntraState ? (subtotalAmount * sgstRate) / 100 : 0;
  let igstAmount = !isIntraState ? (subtotalAmount * igstRate) / 100 : 0;

  const grandTotal = Math.round((subtotalAmount + cgstAmount + sgstAmount + igstAmount) * 100) / 100;
  const amountInWords = numberToIndianWords(grandTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:overflow-visible">
      <div className="relative bg-white text-black w-full max-w-[850px] my-auto rounded-xl shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Actions Toolbar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="text-emerald-400" size={20} />
            <div>
              <h3 className="font-bold text-base leading-tight">Purchase Order Preview</h3>
              <p className="text-xs text-slate-400">{voucherNo}</p>
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

        {/* PDF Document Container */}
        <div id="po-print-area" ref={printRef} className="p-8 sm:p-10 font-sans text-xs bg-white text-black leading-tight border border-black m-4 print:m-0 print:p-8 print:border-black">
          
          {/* Main Title Header */}
          <div className="text-center font-black text-xl tracking-wider uppercase pb-2">
            PURCHASE ORDER
          </div>

          {/* Top 2-Column Info Grid */}
          <div className="border border-black grid grid-cols-2">
            
            {/* Left Column: Invoice To + Consignee + Supplier */}
            <div className="border-r border-black flex flex-col justify-between">
              
              {/* Invoice To */}
              <div className="p-2 border-b border-black">
                <div className="flex items-start gap-2">
                  {/* NP Logo Badge Placeholder */}
                  <div className="w-16 shrink-0 text-center">
                    <div className="w-12 h-6 mx-auto rounded-full border border-teal-600 flex items-center justify-center text-[10px] font-black tracking-tighter text-teal-700 bg-teal-50">
                      NP
                    </div>
                    <div className="text-[6.5px] italic text-slate-600 leading-tight mt-0.5 whitespace-nowrap">
                      We Deliver Quality.....
                    </div>
                  </div>
                  
                  <div className="flex-1 pl-1">
                    <div className="text-[10px] text-slate-600 font-medium">Invoice To</div>
                    <div className="font-bold text-sm text-black leading-tight">{companyName}</div>
                    <div className="text-[9.5px] text-black whitespace-pre-line leading-snug">
                      {companyAddress}
                    </div>
                    <div className="text-[9px] text-black mt-0.5">{companyCountry}</div>
                    <div className="text-[9px] text-black">{companyContact}</div>
                    <div className="text-[9.5px] text-black font-semibold mt-0.5">
                      GSTIN/UIN: <span className="font-bold">{companyGstin}</span>
                    </div>
                    <div className="text-[9px] text-black">
                      State Name : {companyState}
                    </div>
                    <div className="text-[9px] text-black">
                      CIN: {companyCin}
                    </div>
                    <div className="text-[9px] text-black">
                      E-Mail : {companyEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Consignee (Ship to) */}
              <div className="p-2 border-b border-black text-[9.5px]">
                <div className="text-[10px] text-slate-600 font-medium">Consignee (Ship to)</div>
                <div className="font-bold text-black">{companyName}</div>
                <div className="text-black leading-snug">
                  A/13, Jay Vijay Ind. Estate, Opp. Dhuri Ind. Estate, Waliv Phata, Vasai (E), Palghar 401208, Country of origin - INDIA, Contact No. 8530640111, 9867267545, e-mail : sales@nisargpolymers.com
                </div>
                <div className="mt-1 flex items-center gap-4">
                  <div>GSTIN/UIN &nbsp;: <span className="font-bold">{companyGstin}</span></div>
                </div>
                <div>State Name &nbsp;: Maharashtra, Code : 27</div>
              </div>

              {/* Supplier (Bill from) */}
              <div className="p-2 text-[10px]">
                <div className="text-slate-600 font-medium">Supplier (Bill from)</div>
                <div className="font-bold text-xs text-black mt-0.5">{vendorName}</div>
                {vendorAddress && (
                  <div className="text-black text-[9.5px] whitespace-pre-line leading-snug mt-0.5">
                    {vendorAddress}
                  </div>
                )}
                <div className="mt-1">
                  GSTIN/UIN &nbsp;: <span className="font-bold">{vendorGstin || '-'}</span>
                </div>
                <div>
                  State Name &nbsp;: {vendorStateName || 'Maharashtra'}{vendorStateCode ? `, Code : ${vendorStateCode}` : ''}
                </div>
              </div>

            </div>

            {/* Right Column: Voucher Meta details */}
            <div className="flex flex-col text-[10px]">
              
              {/* Voucher No & Dated Row */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">
                  <div className="text-slate-600 text-[9.5px]">Voucher No.</div>
                  <div className="font-bold text-xs text-black mt-0.5">{voucherNo}</div>
                </div>
                <div className="p-2">
                  <div className="text-slate-600 text-[9.5px]">Dated</div>
                  <div className="font-bold text-xs text-black mt-0.5">{poDate || '-'}</div>
                </div>
              </div>

              {/* Empty slot & Mode/Terms of Payment */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black min-h-[38px]">
                  &nbsp;
                </div>
                <div className="p-2">
                  <div className="text-slate-600 text-[9.5px]">Mode/Terms of Payment</div>
                  <div className="font-bold text-xs text-black mt-0.5">{paymentTerms}</div>
                </div>
              </div>

              {/* Reference No. & Date / Other References */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">
                  <div className="text-slate-600 text-[9.5px]">Reference No. & Date.</div>
                  <div className="font-bold text-xs text-black mt-0.5">{voucherNo}</div>
                </div>
                <div className="p-2">
                  <div className="text-slate-600 text-[9.5px]">Other References</div>
                  <div className="text-xs text-black mt-0.5">-</div>
                </div>
              </div>

              {/* Dispatched through & Destination */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-2 border-r border-black">
                  <div className="text-slate-600 text-[9.5px]">Dispatched through</div>
                  <div className="font-bold text-xs text-black mt-0.5">{transport}</div>
                </div>
                <div className="p-2">
                  <div className="text-slate-600 text-[9.5px]">Destination</div>
                  <div className="font-bold text-xs text-black mt-0.5">{destination}</div>
                </div>
              </div>

              {/* Terms of Delivery */}
              <div className="p-2 flex-1">
                <div className="text-slate-600 text-[9.5px]">Terms of Delivery</div>
                <div className="text-xs text-black mt-1">
                  {order.remark || order.deliveryTerms || '-'}
                </div>
              </div>

            </div>

          </div>

          {/* Items Table */}
          <div className="border-x border-b border-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black text-[10px] font-semibold">
                  <th className="py-1 px-1.5 border-r border-black w-7 text-center">SI<br />No.</th>
                  <th className="py-1 px-2 border-r border-black text-center">Description of Goods</th>
                  <th className="py-1 px-2 border-r border-black w-20 text-center">Due on</th>
                  <th className="py-1 px-2 border-r border-black w-24 text-right">Quantity</th>
                  <th className="py-1 px-2 border-r border-black w-20 text-right">Rate</th>
                  <th className="py-1 px-1.5 border-r border-black w-10 text-center">per</th>
                  <th className="py-1 px-2 w-28 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {processedItems.map((item) => (
                  <tr key={item.sr} className="align-top">
                    <td className="py-1.5 px-1.5 border-r border-black text-center font-bold">{item.sr}</td>
                    <td className="py-1.5 px-2 border-r border-black font-bold uppercase">{item.description}</td>
                    <td className="py-1.5 px-2 border-r border-black text-center">{item.dueOn}</td>
                    <td className="py-1.5 px-2 border-r border-black text-right font-bold">
                      {item.quantity.toFixed(3)} {item.uom}
                    </td>
                    <td className="py-1.5 px-2 border-r border-black text-right">
                      {item.rate.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-black text-center">{item.uom}</td>
                    <td className="py-1.5 px-2 text-right font-bold">
                      {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}

                {/* Tax Breakdown rows inside table */}
                {isIntraState ? (
                  <>
                    <tr className="align-top">
                      <td className="py-1 px-1.5 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black text-right italic font-semibold">
                        Input CGST @ 9%
                      </td>
                      <td className="py-1 px-2 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black text-right font-medium">9 %</td>
                      <td className="py-1 px-1.5 border-r border-black"></td>
                      <td className="py-1 px-2 text-right font-bold">
                        {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1 px-1.5 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black text-right italic font-semibold">
                        Input SGST @ 9%
                      </td>
                      <td className="py-1 px-2 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black"></td>
                      <td className="py-1 px-2 border-r border-black text-right font-medium">9 %</td>
                      <td className="py-1 px-1.5 border-r border-black"></td>
                      <td className="py-1 px-2 text-right font-bold">
                        {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr className="align-top">
                    <td className="py-1 px-1.5 border-r border-black"></td>
                    <td className="py-1 px-2 border-r border-black text-right italic font-semibold">
                      Input IGST @ 18%
                    </td>
                    <td className="py-1 px-2 border-r border-black"></td>
                    <td className="py-1 px-2 border-r border-black"></td>
                    <td className="py-1 px-2 border-r border-black text-right font-medium">18 %</td>
                    <td className="py-1 px-1.5 border-r border-black"></td>
                    <td className="py-1 px-2 text-right font-bold">
                      {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}

                {/* Blank vertical space row to ensure standard height */}
                <tr className="h-16">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>

                {/* Subtotal / Total Summary Row */}
                <tr className="border-t border-black font-bold">
                  <td className="py-1.5 px-1.5 border-r border-black"></td>
                  <td className="py-1.5 px-2 border-r border-black text-right uppercase">Total</td>
                  <td className="py-1.5 px-2 border-r border-black"></td>
                  <td className="py-1.5 px-2 border-r border-black text-right font-bold">
                    {totalQty.toFixed(3)} {processedItems[0]?.uom || 'kg'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-black"></td>
                  <td className="py-1.5 px-1.5 border-r border-black"></td>
                  <td className="py-1.5 px-2 text-right font-black text-[11px]">
                    ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount In Words & Terms Note */}
          <div className="border-x border-b border-black p-2 flex justify-between items-start text-[10px]">
            <div>
              <div className="text-slate-600">Amount Chargeable (in words)</div>
              <div className="font-bold text-black mt-0.5">{amountInWords}</div>
            </div>
            <div className="italic font-medium text-slate-700">
              E. & O.E
            </div>
          </div>

          {/* Footer: PAN & Signatory */}
          <div className="border-x border-b border-black grid grid-cols-2 min-h-[90px]">
            {/* Left: Company PAN */}
            <div className="p-2 flex flex-col justify-end text-[10px]">
              <div>
                Company's PAN &nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-bold">{companyPan}</span>
              </div>
            </div>

            {/* Right: Signature Box */}
            <div className="border-l border-black flex flex-col justify-between p-2 text-[10px]">
              <div className="text-right font-bold">
                for {companyName}
              </div>
              <div className="text-right text-[10px] font-medium pt-8">
                Authorised Signatory
              </div>
            </div>
          </div>

          {/* Centered Computer Generated Document Note */}
          <div className="text-center text-[10px] text-slate-500 font-medium py-3 print:py-2">
            This is a Computer Generated Document
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
            #po-print-area, #po-print-area * {
              visibility: visible;
            }
            #po-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 1px solid #000 !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          }
        `
      }} />
    </div>
  );
}
