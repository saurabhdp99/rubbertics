import PrintPreviewModal from '../common/PrintPreviewModal';
import { numberToIndianWords, formatDocDate, DEFAULT_COMPANY } from '../../utils/printDocUtils';

export default function SaleOrderPdfModal({ isOpen, onClose, order, customerParty, org }) {
  if (!isOpen || !order) return null;

  // ── Derived data ────────────────────────────────────────────────────────────
  const voucherNo      = order.npplSaleNo || order.saleNo || order.poNo || 'SO/26-27/00001';
  const orderDate      = formatDocDate(order.date || order.createdDate);
  const buyerPoNo      = order.poNo || '-';
  const otherRefs      = order.otherReferences || order.other_references || order.poNo || '-';
  const paymentTerms   = order.paymentTerms || '45 Days';
  const transport      = order.transport || 'NANDWANA CARRIER';
  const destination    = order.deliveryTerms || order.shippingAddress ? (order.deliveryTerms || 'VAPI') : '-';
  const deliveryTerms  = order.remark || order.deliveryTerms || '';

  // Company (Seller)
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

  // Customer (Buyer / Consignee)
  const buyerName      = order.partyName || customerParty?.party_name || customerParty?.partyName || 'Customer';
  const buyerAddress   = order.partyAddress || customerParty?.address || '';
  const shippingAddr   = order.shippingAddress || customerParty?.shipping_address || buyerAddress;
  const buyerGstin     = customerParty?.gst_no || customerParty?.gstNo || '';
  const buyerStateName = customerParty?.state || (buyerGstin.startsWith('26') ? 'Dadra & Nagar Haveli and Daman & Diu' : (buyerGstin.startsWith('27') ? 'Maharashtra' : ''));
  const buyerStateCode = customerParty?.gst_state_code || (buyerGstin.length >= 2 ? buyerGstin.substring(0, 2) : (buyerGstin.startsWith('26') ? '26' : '27'));

  // Items
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{
        productName: order.productName || 'PRODUCT ITEM',
        partNo:      order.partNo || '',
        hsnCode:     order.hsnCode || '85177990',
        orderQty:    order.orderQty || 0,
        uom:         order.uom || 'nos.',
        price:       order.price || 0,
        schedules:   order.deliveryDate ? [{ deliveryDate: order.deliveryDate }] : [],
      }];

  const processedItems = items.map((item, idx) => {
    const qty    = Number(item.orderQty || item.quantity || 0);
    const rate   = Number(item.price || item.rate || 0);
    const amount = Math.round(qty * rate * 100) / 100;
    const dueOn  = formatDocDate(item.schedules?.[0]?.deliveryDate || item.deliveryDate || order.deliveryDate || order.date);
    const descParts = [item.partNo, item.productName].filter(Boolean);
    const description = descParts.join(' ') || `Item ${idx + 1}`;
    const hsnCode = item.hsnCode || '85177990';
    return { sr: idx + 1, description, hsnCode, dueOn, quantity: qty, uom: item.uom || 'nos.', rate, amount };
  });

  const totalQty       = processedItems.reduce((s, i) => s + i.quantity, 0);
  const subtotalAmount = processedItems.reduce((s, i) => s + i.amount, 0);

  // Tax calculation
  const isIntraState = !buyerStateCode || buyerStateCode === '27';
  const cgstRate     = isIntraState ? 9 : 0;
  const sgstRate     = isIntraState ? 9 : 0;
  const igstRate     = !isIntraState ? 18 : 0;
  const cgstAmount   = isIntraState ? Math.round((subtotalAmount * cgstRate) / 100 * 100) / 100 : 0;
  const sgstAmount   = isIntraState ? Math.round((subtotalAmount * sgstRate) / 100 * 100) / 100 : 0;
  const igstAmount   = !isIntraState ? Math.round((subtotalAmount * igstRate) / 100 * 100) / 100 : 0;

  const rawTotal     = subtotalAmount + cgstAmount + sgstAmount + igstAmount;
  const grandTotal   = Math.round(rawTotal);
  const roundOff     = Math.round((grandTotal - rawTotal) * 100) / 100;
  const amountInWords = numberToIndianWords(grandTotal);
  const primaryUom   = processedItems[0]?.uom || 'nos.';

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Order"
      documentNo={voucherNo}
      elementId="so-preview-doc"
    >
      <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>

        {/* ── Document Title (Proforma Invoice) ── */}
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', padding: '0 0 8px', letterSpacing: '0.4px', color: '#000' }}>
          Proforma Invoice
        </div>

        {/* ── Outer Bordered Box ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '794px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: '1.5px solid #000',
            boxSizing: 'border-box',
            fontSize: '9.5px',
            color: '#000000',
          }}
        >

          {/* ── TOP SECTION: 2-COLUMN (LEFT 55%, RIGHT 45%) ── */}
          <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>

            {/* LEFT 55%: Company + Consignee + Buyer */}
            <div style={{ width: '55%', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' }}>

              {/* 1. Company Details */}
              <div style={{ display: 'flex', padding: '6px 8px', borderBottom: '1px solid #000', alignItems: 'flex-start', minHeight: '80px' }}>
                <div style={{ width: '70px', flexShrink: 0, paddingRight: '8px', textAlign: 'center' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ maxHeight: '45px', maxWidth: '65px', objectFit: 'contain' }} />
                  ) : (
                    <div>
                      <div style={{ width: '42px', height: '22px', borderRadius: '11px', border: '1.5px solid #0d9488', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#0f766e' }}>NP</span>
                      </div>
                      <div style={{ fontSize: '6px', fontStyle: 'italic', color: '#555', marginTop: '2px', whiteSpace: 'nowrap' }}>We Deliver Quality.....</div>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, lineHeight: '1.25' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '2px' }}>{companyName}</div>
                  <div style={{ fontSize: '8.5px', color: '#222', whiteSpace: 'pre-line' }}>{companyAddress}</div>
                  <div style={{ fontSize: '8px', color: '#444', marginTop: '1px' }}>{companyCountry}</div>
                  <div style={{ fontSize: '8px', color: '#444' }}>{companyContact}</div>
                  <div style={{ fontSize: '8px', color: '#222' }}>
                    GSTIN/UIN: <strong>{companyGstin}</strong>
                  </div>
                  <div style={{ fontSize: '8px', color: '#222' }}>
                    State Name : {companyState}
                  </div>
                  <div style={{ fontSize: '8px', color: '#222' }}>
                    CIN: {companyCin}
                  </div>
                  <div style={{ fontSize: '8px', color: '#222' }}>
                    E-Mail : {companyEmail}
                  </div>
                </div>
              </div>

              {/* 2. Consignee (Ship to) */}
              <div style={{ padding: '4px 8px', borderBottom: '1px solid #000', minHeight: '62px' }}>
                <div style={{ fontSize: '8.5px', color: '#555' }}>Consignee (Ship to)</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '1px' }}>{buyerName}</div>
                {shippingAddr && <div style={{ fontSize: '9px', color: '#222', whiteSpace: 'pre-line', lineHeight: '1.25' }}>{shippingAddr}</div>}
                <div style={{ fontSize: '9px', marginTop: '2px' }}>
                  GSTIN/UIN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{buyerGstin || '-'}</strong>
                </div>
                <div style={{ fontSize: '9px' }}>
                  State Name &nbsp;&nbsp;&nbsp;&nbsp;: {buyerStateName || 'Dadra & Nagar Haveli and Daman & Diu'}{buyerStateCode ? `, Code : ${buyerStateCode}` : ''}
                </div>
              </div>

              {/* 3. Buyer (Bill to) */}
              <div style={{ padding: '4px 8px', minHeight: '62px' }}>
                <div style={{ fontSize: '8.5px', color: '#555' }}>Buyer (Bill to)</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '1px' }}>{buyerName}</div>
                {buyerAddress && <div style={{ fontSize: '9px', color: '#222', whiteSpace: 'pre-line', lineHeight: '1.25' }}>{buyerAddress}</div>}
                <div style={{ fontSize: '9px', marginTop: '2px' }}>
                  GSTIN/UIN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{buyerGstin || '-'}</strong>
                </div>
                <div style={{ fontSize: '9px' }}>
                  State Name &nbsp;&nbsp;&nbsp;&nbsp;: {buyerStateName || 'Dadra & Nagar Haveli and Daman & Diu'}{buyerStateCode ? `, Code : ${buyerStateCode}` : ''}
                </div>
              </div>

            </div>

            {/* RIGHT 45%: Order & Transport Metadata */}
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>

              {/* Row 1: Voucher No & Dated */}
              <div style={{ display: 'flex', borderBottom: '1px solid #000', minHeight: '36px' }}>
                <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Voucher No.</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{voucherNo}</div>
                </div>
                <div style={{ width: '50%', padding: '4px 6px' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Dated</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{orderDate}</div>
                </div>
              </div>

              {/* Row 2: Mode/Terms of Payment */}
              <div style={{ display: 'flex', borderBottom: '1px solid #000', minHeight: '36px' }}>
                <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000' }}>
                  {/* Empty cell per screenshot */}
                </div>
                <div style={{ width: '50%', padding: '4px 6px' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Mode/Terms of Payment</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{paymentTerms}</div>
                </div>
              </div>

              {/* Row 3: Buyer's Ref./Order No. & Other References */}
              <div style={{ display: 'flex', borderBottom: '1px solid #000', minHeight: '36px' }}>
                <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Buyer&apos;s Ref./Order No.</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{buyerPoNo}</div>
                </div>
                <div style={{ width: '50%', padding: '4px 6px' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Other References</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{otherRefs}</div>
                </div>
              </div>

              {/* Row 4: Dispatched through & Destination */}
              <div style={{ display: 'flex', borderBottom: '1px solid #000', minHeight: '36px' }}>
                <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Dispatched through</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{transport}</div>
                </div>
                <div style={{ width: '50%', padding: '4px 6px' }}>
                  <div style={{ fontSize: '8px', color: '#555' }}>Destination</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>{destination}</div>
                </div>
              </div>

              {/* Row 5: Terms of Delivery */}
              <div style={{ padding: '4px 6px', flex: 1, minHeight: '40px' }}>
                <div style={{ fontSize: '8px', color: '#555' }}>Terms of Delivery</div>
                <div style={{ fontSize: '9.5px', color: '#000', marginTop: '2px' }}>{deliveryTerms}</div>
              </div>

            </div>

          </div>

          {/* ── ITEMS TABLE (8 COLUMNS EXACTLY AS SCREENSHOT) ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000', backgroundColor: '#fff' }}>
                {[
                  { label: 'Sl\nNo.', w: '5%', align: 'center' },
                  { label: 'Description of Goods', w: '32%', align: 'center' },
                  { label: 'HSN/SAC', w: '11%', align: 'center' },
                  { label: 'Due on', w: '10%', align: 'center' },
                  { label: 'Quantity', w: '13%', align: 'center' },
                  { label: 'Rate', w: '11%', align: 'center' },
                  { label: 'per', w: '5%', align: 'center' },
                  { label: 'Amount', w: '13%', align: 'center', last: true },
                ].map((col) => (
                  <th
                    key={col.label}
                    style={{
                      width: col.w,
                      padding: '4px 4px',
                      borderRight: col.last ? 'none' : '1px solid #000',
                      textAlign: col.align,
                      fontWeight: 'normal',
                      fontSize: '9.5px',
                      whiteSpace: 'pre-line',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Product Item rows */}
              {processedItems.map((item) => (
                <tr key={item.sr} style={{ verticalAlign: 'top' }}>
                  <td style={{ ...tdS, textAlign: 'center' }}>{item.sr}</td>
                  <td style={{ ...tdS, fontWeight: 'bold', fontSize: '10px' }}>
                    {item.description}
                  </td>
                  <td style={{ ...tdS, textAlign: 'center' }}>{item.hsnCode}</td>
                  <td style={{ ...tdS, textAlign: 'center', fontStyle: 'italic' }}>{item.dueOn}</td>
                  <td style={{ ...tdS, textAlign: 'right', fontWeight: 'bold' }}>{item.quantity.toFixed(2)} {item.uom}</td>
                  <td style={{ ...tdS, textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                  <td style={{ ...tdS, textAlign: 'center' }}>{item.uom}</td>
                  <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>
                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Tax Rows inside table */}
              {isIntraState ? (
                <>
                  {[
                    ['CGST @ 9%', cgstRate, cgstAmount],
                    ['SGST @ 9%', sgstRate, sgstAmount],
                  ].map(([label, rate, amt]) => (
                    <tr key={label} style={{ verticalAlign: 'top' }}>
                      <td style={tdS}></td>
                      <td style={{ ...tdS, textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold' }}>{label}</td>
                      <td style={tdS}></td>
                      <td style={tdS}></td>
                      <td style={tdS}></td>
                      <td style={{ ...tdS, textAlign: 'right' }}>{rate} %</td>
                      <td style={tdS}></td>
                      <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>
                        {amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr style={{ verticalAlign: 'top' }}>
                  <td style={tdS}></td>
                  <td style={{ ...tdS, textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold' }}>IGST @ 18%</td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={{ ...tdS, textAlign: 'right' }}>18 %</td>
                  <td style={tdS}></td>
                  <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>
                    {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              {/* Round Off / Write Off row (if fractional difference exists) */}
              {roundOff !== 0 && (
                <tr style={{ verticalAlign: 'top' }}>
                  <td style={tdS}></td>
                  <td style={{ ...tdS, textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold' }}>ROUND OFF/WRITE OFF</td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={tdS}></td>
                  <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold' }}>
                    {roundOff > 0 ? roundOff.toFixed(2) : `(${Math.abs(roundOff).toFixed(2)})`}
                  </td>
                </tr>
              )}

              {/* Spacer rows to extend vertical column lines */}
              <tr style={{ height: '35px' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <td key={i} style={{ borderRight: i < 7 ? '1px solid #000' : 'none' }}></td>
                ))}
              </tr>

              {/* TOTAL ROW */}
              <tr style={{ borderTop: '1px solid #000', backgroundColor: '#fff', fontWeight: 'bold' }}>
                <td style={tdS}></td>
                <td style={{ ...tdS, textAlign: 'right', fontWeight: 'normal', fontSize: '9.5px' }}>Total</td>
                <td style={tdS}></td>
                <td style={tdS}></td>
                <td style={{ ...tdS, textAlign: 'right', fontWeight: 'bold', fontSize: '10.5px' }}>
                  {totalQty.toFixed(2)} {primaryUom}
                </td>
                <td style={tdS}></td>
                <td style={tdS}></td>
                <td style={{ ...tdLastS, textAlign: 'right', fontWeight: 'bold', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── AMOUNT CHARGEABLE IN WORDS ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 6px', borderBottom: '1px solid #000' }}>
            <div>
              <div style={{ fontSize: '8px', color: '#555' }}>Amount Chargeable (in words)</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>
                {amountInWords}
              </div>
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '9.5px', color: '#333' }}>E. &amp; O.E</div>
          </div>

          {/* ── FOOTER: PAN & AUTHORISED SIGNATURE ── */}
          <div style={{ display: 'flex', minHeight: '90px' }}>
            {/* Left: PAN Details */}
            <div style={{ width: '55%', padding: '8px 8px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '9.5px' }}>
                Company&apos;s PAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{companyPan}</strong>
              </div>
            </div>

            {/* Right: Boxed Signatory Section */}
            <div style={{ width: '45%', borderLeft: '1px solid #000', borderTop: '1px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px 10px' }}>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10px' }}>
                for {companyName}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 'normal', fontSize: '9.5px' }}>
                Authorised Signatory
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Disclaimer ── */}
        <div style={{ textAlign: 'center', fontSize: '8px', color: '#777', padding: '6px 0 0' }}>
          This is a Computer Generated Document
        </div>

      </div>
    </PrintPreviewModal>
  );
}

// ── Shared Table Cell Styles ──
const tdS = {
  padding: '4px 5px',
  borderRight: '1px solid #000',
  verticalAlign: 'top',
  fontSize: '9.5px',
};

const tdLastS = {
  padding: '4px 5px',
  verticalAlign: 'top',
  fontSize: '9.5px',
};
