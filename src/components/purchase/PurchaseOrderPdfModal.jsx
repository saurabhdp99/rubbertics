import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import PrintPreviewModal from '../common/PrintPreviewModal';
import { numberToIndianWords, formatDocDate, DEFAULT_COMPANY } from '../../utils/printDocUtils';
import { PoTermsConditionsPage1, PoTermsConditionsPage2 } from './PoTermsAndConditions';

export default function PurchaseOrderPdfModal({ isOpen, onClose, order, vendorParty, org }) {
  const [includeTerms, setIncludeTerms] = useState(true);

  if (!isOpen || !order) return null;

  // ── Derived data ────────────────────────────────────────────────────────────
  const voucherNo      = order.npplPoNo || order.poNo || 'PO-0001';
  const poDate         = formatDocDate(order.date || order.createdDate);
  const paymentTerms   = order.paymentTerms || '10 Days Payment From Date of Dispatch';
  const transport      = order.transport || 'S Nitin Transport';
  const destination    = order.deliveryTerms || 'Door Delivery';
  const supplierRef    = order.supplierRef || order.supplier_ref || '-';
  const otherRefs      = order.otherReferences || order.other_references || '-';
  const deliveryTerms  = order.remark || order.deliveryTerms || 'Door Delivery';

  // Company
  const companyName    = org?.name || DEFAULT_COMPANY.name;
  const companyAddress = DEFAULT_COMPANY.address;
  const companyCountry = DEFAULT_COMPANY.country;
  const companyContact = DEFAULT_COMPANY.contact;
  const companyGstin   = DEFAULT_COMPANY.gstin;
  const companyState   = DEFAULT_COMPANY.state;
  const companyPan     = DEFAULT_COMPANY.pan;
  const companyCin     = DEFAULT_COMPANY.cin;
  const companyEmail   = DEFAULT_COMPANY.email;
  const logoAttachment = org?.attachments?.find(a => a.name === 'Company Logo');
  const logoUrl        = logoAttachment?.url || logoAttachment?.fileData || null;

  // Vendor
  const vendorName      = order.vendorName || vendorParty?.party_name || vendorParty?.partyName || 'Supplier';
  const vendorAddress   = vendorParty?.address || order.vendorAddress || '';
  const vendorGstin     = vendorParty?.gst_no || vendorParty?.gstNo || '';
  const vendorStateName = vendorParty?.state || (vendorGstin.startsWith('27') ? 'Maharashtra' : '');
  const vendorStateCode = vendorParty?.gst_state_code || (vendorGstin.length >= 2 ? vendorGstin.substring(0, 2) : '27');

  // Items
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{
        productName: order.productName || 'SILICONE RUBBER',
        partNo:      order.partNo || '',
        orderQty:    order.orderQty || 0,
        uom:         order.uom || 'kg',
        price:       order.price || 0,
        schedules:   order.deliveryDate ? [{ deliveryDate: order.deliveryDate }] : [],
      }];

  const processedItems = items.map((item, idx) => {
    const qty    = Number(item.orderQty || item.quantity || 0);
    const rate   = Number(item.price || item.rate || 0);
    const amount = qty * rate;
    const dueOn  = formatDocDate(item.schedules?.[0]?.deliveryDate || item.deliveryDate || order.deliveryDate || order.date);
    const description = [item.productName, item.partNo ? `(${item.partNo})` : ''].filter(Boolean).join(' ') || `Item ${idx + 1}`;
    return { sr: idx + 1, description, dueOn, quantity: qty, uom: item.uom || 'kg', rate, amount };
  });

  const totalQty       = processedItems.reduce((s, i) => s + i.quantity, 0);
  const subtotalAmount = processedItems.reduce((s, i) => s + i.amount, 0);

  // Tax
  const isIntraState = !vendorStateCode || vendorStateCode === '27';
  const cgstRate     = isIntraState ? 9 : 0;
  const sgstRate     = isIntraState ? 9 : 0;
  const igstRate     = !isIntraState ? 18 : 0;
  const cgstAmount   = isIntraState ? (subtotalAmount * cgstRate) / 100 : 0;
  const sgstAmount   = isIntraState ? (subtotalAmount * sgstRate) / 100 : 0;
  const igstAmount   = !isIntraState ? (subtotalAmount * igstRate) / 100 : 0;
  const grandTotal   = Math.round((subtotalAmount + cgstAmount + sgstAmount + igstAmount) * 100) / 100;
  const amountInWords = numberToIndianWords(grandTotal);
  const uom = processedItems[0]?.uom || 'kg';

  // Toolbar actions (Toggle terms & conditions + jump links)
  const previewActions = (
    <div className="flex items-center gap-2">
      {/* Toggle Terms & Conditions */}
      <button
        type="button"
        onClick={() => setIncludeTerms(!includeTerms)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          includeTerms
            ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500/40 hover:bg-indigo-600/35'
            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
        }`}
        title="Toggle Standard Terms & Conditions in print and PDF"
      >
        <ScrollText size={14} className={includeTerms ? 'text-indigo-400' : 'text-slate-400'} />
        <span>Terms &amp; Conditions</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            includeTerms ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {includeTerms ? '3 pgs' : '1 pg'}
        </span>
      </button>

      {/* Quick Jump Buttons when terms included */}
      {includeTerms && (
        <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80 text-[11px] font-medium text-slate-300">
          <button
            type="button"
            onClick={() => document.getElementById('po-sheet-doc')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-0.5 rounded hover:text-white hover:bg-slate-700 transition-colors"
          >
            PO
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => document.getElementById('po-terms-sheet-1')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-0.5 rounded hover:text-white hover:bg-slate-700 transition-colors"
          >
            Terms P1
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => document.getElementById('po-terms-sheet-2')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-0.5 rounded hover:text-white hover:bg-slate-700 transition-colors"
          >
            Terms P2
          </button>
        </div>
      )}
    </div>
  );

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Order"
      documentNo={voucherNo}
      elementId="po-preview-doc"
      actions={previewActions}
    >
      <div style={{ backgroundColor: '#ffffff' }}>
        {/* ── Page 1: Purchase Order Sheet ── */}
        <div
          id="po-sheet-doc"
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            minHeight: '260mm',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PoDocument
            {...{
              voucherNo, poDate, paymentTerms, transport, destination, deliveryTerms,
              supplierRef, otherRefs, companyName, companyAddress, companyCountry,
              companyContact, companyGstin, companyState, companyPan, companyCin,
              companyEmail, logoUrl, vendorName, vendorAddress, vendorGstin,
              vendorStateName, vendorStateCode, processedItems, totalQty, grandTotal,
              amountInWords, isIntraState, cgstRate, sgstRate, igstRate,
              cgstAmount, sgstAmount, igstAmount, uom,
            }}
          />
        </div>

        {/* ── Pages 2 & 3: Standard Terms & Conditions ── */}
        {includeTerms && (
          <>
            {/* Screen-Only Visual Divider between PO and Terms Page 1 */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#0f172a',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderTop: '2px dashed #334155',
                borderBottom: '2px dashed #334155',
                margin: '20px 0 10px',
              }}
            >
              <span>Page 2 — Standard Terms &amp; Conditions (Clauses 1 – 10)</span>
            </div>

            {/* Terms Sheet - Page 1 */}
            <div
              id="po-terms-sheet-1"
              className="page-break"
              style={{
                pageBreakBefore: 'always',
                breakBefore: 'page',
                backgroundColor: '#ffffff',
                padding: '20px 28px',
                boxSizing: 'border-box',
                minHeight: '260mm',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <PoTermsConditionsPage1 companyName={companyName} />
            </div>

            {/* Screen-Only Visual Divider between Terms Page 1 and Page 2 */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#0f172a',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderTop: '2px dashed #334155',
                borderBottom: '2px dashed #334155',
                margin: '20px 0 10px',
              }}
            >
              <span>Page 3 — Standard Terms &amp; Conditions (Clauses 11 – 22)</span>
            </div>

            {/* Terms Sheet - Page 2 */}
            <div
              id="po-terms-sheet-2"
              className="page-break"
              style={{
                pageBreakBefore: 'always',
                breakBefore: 'page',
                backgroundColor: '#ffffff',
                padding: '20px 28px',
                boxSizing: 'border-box',
                minHeight: '260mm',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <PoTermsConditionsPage2 companyName={companyName} />
            </div>
          </>
        )}
      </div>
    </PrintPreviewModal>
  );
}

// ── PoDocument: Pure HTML/inline-styled PO layout ────────────────────────────
// Used for both the preview card AND the hidden PDF source element.
// Inline styles only (no Tailwind) so html2canvas captures it correctly.
function PoDocument({
  voucherNo, poDate, paymentTerms, transport, destination, deliveryTerms,
  supplierRef, otherRefs, companyName, companyAddress, companyCountry,
  companyContact, companyGstin, companyState, companyPan, companyCin,
  companyEmail, logoUrl, vendorName, vendorAddress, vendorGstin,
  vendorStateName, vendorStateCode, processedItems, totalQty, grandTotal,
  amountInWords, isIntraState, cgstRate, sgstRate, igstRate,
  cgstAmount, sgstAmount, igstAmount, uom,
}) {
  const label = { fontSize: '8px', color: '#555', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' };
  const valBold = { fontSize: '10px', fontWeight: 'bold', color: '#000', lineHeight: '1.3' };
  const valNorm = { fontSize: '9px', color: '#000', lineHeight: '1.3' };
  const cell = (extra = {}) => ({ padding: '5px 7px', borderBottom: '1px solid #000', ...extra });
  const cellLast = (extra = {}) => ({ padding: '5px 7px', ...extra });

  // Calculate dynamic spacer height so the items table expands naturally to fill standard A4 page proportions
  const itemCount = processedItems.length;
  const spacerHeight = Math.max(35, 330 - (itemCount - 1) * 35);

  return (
    <div style={{ width: '100%', border: '1.5px solid #000', backgroundColor: '#fff', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px', color: '#000' }}>

      {/* ── TITLE ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '16px', letterSpacing: '1.5px', padding: '7px 0 5px', borderBottom: '1.5px solid #000' }}>
        PURCHASE ORDER
      </div>

      {/* ── TOP 2-COLUMN GRID ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #000' }}>

        {/* LEFT 55% */}
        <div style={{ width: '55%', borderRight: '1.5px solid #000', display: 'flex', flexDirection: 'column' }}>

          {/* Invoice To */}
          <div style={cell()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: '40px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '40px', flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ width: '36px', height: '22px', borderRadius: '12px', border: '1px solid #0d9488', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#0f766e' }}>NP</span>
                  </div>
                  <div style={{ fontSize: '6px', fontStyle: 'italic', color: '#555', marginTop: '2px', whiteSpace: 'nowrap' }}>We Deliver Quality</div>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={label}>Invoice To</div>
                <div style={{ ...valBold, fontSize: '12px', marginBottom: '2px' }}>{companyName}</div>
                <div style={valNorm}>{companyAddress.replace('\n', ', ')}</div>
                <div style={valNorm}>{companyCountry} | {companyContact}</div>
                <div style={{ ...valNorm, fontWeight: 'bold', marginTop: '2px' }}>GSTIN/UIN: {companyGstin}</div>
                <div style={valNorm}>State Name : {companyState}</div>
                <div style={valNorm}>CIN: {companyCin}</div>
                <div style={valNorm}>E-Mail : {companyEmail}</div>
              </div>
            </div>
          </div>

          {/* Consignee */}
          <div style={cell()}>
            <div style={label}>Consignee (Ship to)</div>
            <div style={{ ...valBold, fontSize: '10.5px', marginBottom: '2px' }}>{companyName}</div>
            <div style={valNorm}>{companyAddress.replace('\n', ', ')}, {companyCountry}, {companyContact}</div>
            <div style={{ ...valNorm, marginTop: '2px' }}>GSTIN/UIN : <strong>{companyGstin}</strong> | State Name : Maharashtra, Code : 27</div>
          </div>

          {/* Supplier */}
          <div style={cellLast()}>
            <div style={label}>Supplier (Bill from)</div>
            <div style={{ ...valBold, fontSize: '11px', marginBottom: '2px' }}>{vendorName}</div>
            {vendorAddress && <div style={valNorm}>{vendorAddress}</div>}
            <div style={{ ...valNorm, marginTop: '2px' }}>GSTIN/UIN : <strong>{vendorGstin || '-'}</strong></div>
            <div style={valNorm}>State Name : {vendorStateName || 'Maharashtra'}{vendorStateCode ? `, Code : ${vendorStateCode}` : ''}</div>
          </div>

        </div>

        {/* RIGHT 45% */}
        <div style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
          {[
            ['Voucher No.', voucherNo, 'Dated', poDate || '-'],
            ["Supplier's Ref. / Order No.", supplierRef, 'Mode / Terms of Payment', paymentTerms],
            ['Reference No. & Date.', voucherNo, 'Other References', otherRefs],
            ['Dispatched through', transport, 'Destination', destination],
          ].map(([l1, v1, l2, v2], i) => (
            <div key={i} style={{ display: 'flex', borderBottom: '1px solid #000' }}>
              <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000' }}>
                <div style={label}>{l1}</div>
                <div style={valBold}>{v1}</div>
              </div>
              <div style={{ width: '50%', padding: '4px 6px' }}>
                <div style={label}>{l2}</div>
                <div style={valBold}>{v2}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '4px 6px', flex: 1 }}>
            <div style={label}>Terms of Delivery</div>
            <div style={valBold}>{deliveryTerms}</div>
          </div>
        </div>

      </div>

      {/* ── ITEMS TABLE ───────────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #000' }}>
            {[
              { label: 'SI\nNo.', w: '5%', align: 'center' },
              { label: 'Description of Goods', w: '32%', align: 'left' },
              { label: 'Due on', w: '11%', align: 'center' },
              { label: 'Quantity', w: '16%', align: 'right' },
              { label: 'Rate', w: '13%', align: 'right' },
              { label: 'per', w: '7%', align: 'center' },
              { label: 'Amount', w: '16%', align: 'right', last: true },
            ].map((col) => (
              <th key={col.label} style={{ width: col.w, padding: '4px 5px', borderRight: col.last ? 'none' : '1px solid #000', textAlign: col.align, fontWeight: '800', fontSize: '9px', whiteSpace: 'pre-line', verticalAlign: 'middle' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Item rows */}
          {processedItems.map((item) => (
            <tr key={item.sr} style={{ borderBottom: '0.5px solid #ddd', verticalAlign: 'top' }}>
              <td style={{ ...tdS, textAlign: 'center', fontWeight: 'bold' }}>{item.sr}</td>
              <td style={{ ...tdS, fontWeight: 'bold', textTransform: 'uppercase' }}>{item.description}</td>
              <td style={{ ...tdS, textAlign: 'center' }}>{item.dueOn}</td>
              <td style={{ ...tdS, textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.quantity.toFixed(3)} {item.uom}</td>
              <td style={{ ...tdS, textAlign: 'right', whiteSpace: 'nowrap' }}>{item.rate.toFixed(2)}</td>
              <td style={{ ...tdS, textAlign: 'center' }}>{item.uom}</td>
              <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}

          {/* Tax rows */}
          {isIntraState ? (
            <>
              {[['CGST', cgstRate, cgstAmount], ['SGST', sgstRate, sgstAmount]].map(([t, r, a]) => (
                <tr key={t} style={{ borderBottom: '0.5px solid #ddd' }}>
                  <td style={tdS}></td>
                  <td style={{ ...tdS, textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold' }}>Input {t} @ {r}%</td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={{ ...tdS, textAlign: 'right' }}>{r} %</td>
                  <td style={tdS}></td>
                  <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>{a.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </>
          ) : (
            <tr style={{ borderBottom: '0.5px solid #ddd' }}>
              <td style={tdS}></td>
              <td style={{ ...tdS, textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold' }}>Input IGST @ {igstRate}%</td>
              <td style={tdS}></td>
              <td style={tdS}></td>
              <td style={{ ...tdS, textAlign: 'right' }}>{igstRate} %</td>
              <td style={tdS}></td>
              <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}

          {/* Spacer row to extend vertical column lines to fill A4 proportions */}
          <tr style={{ height: `${spacerHeight}px` }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <td key={i} style={{ borderRight: i < 6 ? '1px solid #000' : 'none' }}></td>
            ))}
          </tr>

          {/* TOTAL row */}
          <tr style={{ borderTop: '1.5px solid #000', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
            <td style={tdS}></td>
            <td style={{ ...tdS, textAlign: 'right', fontWeight: '900', fontSize: '10.5px', letterSpacing: '0.5px' }}>TOTAL</td>
            <td style={tdS}></td>
            <td style={{ ...tdS, textAlign: 'right', fontWeight: '900', fontSize: '10.5px', whiteSpace: 'nowrap' }}>{totalQty.toFixed(3)} {uom}</td>
            <td style={tdS}></td>
            <td style={tdS}></td>
            <td style={{ ...tdLastS, textAlign: 'right', fontWeight: '900', fontSize: '11px', whiteSpace: 'nowrap' }}>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      {/* ── AMOUNT IN WORDS ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 7px', borderBottom: '1.5px solid #000' }}>
        <div>
          <div style={label}>Amount Chargeable (in words)</div>
          <div style={{ ...valBold, fontSize: '10.5px', marginTop: '2px' }}>{amountInWords}</div>
        </div>
        <div style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '10px', color: '#333' }}>E. &amp; O.E</div>
      </div>

      {/* ── FOOTER / SIGNATURES ───────────────────────────────────────── */}
      <div style={{ display: 'flex', minHeight: '75px', borderBottom: '1.5px solid #000' }}>
        <div style={{ width: '55%', borderRight: '1.5px solid #000', padding: '6px 7px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ ...valBold, fontSize: '10px' }}>
            Company&apos;s PAN : {companyPan}
          </div>
          <div style={{ fontSize: '8px', color: '#555', lineHeight: '1.4', marginTop: '4px' }}>
            Declaration: We declare that this purchase order shows the actual price of the goods described and that all particulars are true and correct.
          </div>
        </div>
        <div style={{ width: '45%', padding: '6px 7px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ ...valBold, fontSize: '10px' }}>for {companyName}</div>
          <div style={{ ...valBold, fontSize: '10px' }}>Authorised Signatory</div>
        </div>
      </div>

      {/* ── BOTTOM NOTE ────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', fontSize: '8.5px', color: '#888', padding: '4px 0' }}>
        This is a Computer Generated Document
      </div>

    </div>
  );
}

// Shared table cell styles (inline, no Tailwind — required for html2canvas)
const tdS = {
  padding: '4px 5px',
  borderRight: '1px solid #000',
  verticalAlign: 'top',
  fontSize: '9px',
};
const tdLastS = {
  padding: '4px 5px',
  verticalAlign: 'top',
  fontSize: '9px',
};
