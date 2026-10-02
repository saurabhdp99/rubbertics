import PrintPreviewModal from '../common/PrintPreviewModal';
import { formatDocDate, DEFAULT_COMPANY } from '../../utils/printDocUtils';

export default function InwardGrnPdfModal({ isOpen, onClose, entry, org }) {
  if (!isOpen || !entry) return null;

  const grnNo = entry.grn_no || '';
  const companyName = org?.name || DEFAULT_COMPANY.name;
  const logoAttachment = org?.attachments?.find(a => a.name === 'Company Logo');
  const logoUrl = logoAttachment?.url || logoAttachment?.fileData || null;
  const poNo = entry.po_no || '-';
  const invoiceChallanNo = [entry.invoice_no, entry.challan_received].filter(Boolean).join(' / ') || entry.invoice_no || '-';
  const dateGoodsReceived = formatDocDate(entry.receipt_date || entry.created_at) || '-';

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

  // Ensure table has at least 5 material rows
  const minMaterialRows = 5;
  const blankRowsCount = Math.max(0, minMaterialRows - materials.length);

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Goods Received Note (GRN)"
      documentNo={grnNo}
      elementId="grn-preview-doc"
    >
      <GrnDocument
        {...{
          companyName, logoUrl, poNo, grnNo, invoiceChallanNo, dateGoodsReceived,
          materials, blankRowsCount, tcReceived, qtyVerifiedBy, qualityVerified,
          tcRemarks: entry.tc_coa_remarks || '',
          qtyRemarks: entry.qty_verified_remarks || '',
          qcRemarks: entry.qc_verified_remarks || '',
          receiverName: entry.recv_verified_name || '',
        }}
      />
    </PrintPreviewModal>
  );
}

// ── GrnDocument: Pure inline-styled layout (never relies on external Tailwind) ──
function GrnDocument({
  companyName, logoUrl, poNo, grnNo, invoiceChallanNo, dateGoodsReceived,
  materials, blankRowsCount, tcReceived, qtyVerifiedBy, qualityVerified,
  tcRemarks, qtyRemarks, qcRemarks, receiverName,
}) {
  const b1 = '1px solid #000';
  const b2 = '1.5px solid #000';

  const cellLabel = {
    padding: '4px 8px',
    fontWeight: 'bold',
    fontSize: '10.5px',
    textTransform: 'uppercase',
    borderRight: b1,
    borderBottom: b1,
    backgroundColor: '#fff',
  };

  const cellVal = {
    padding: '4px 8px',
    fontSize: '10.5px',
    borderBottom: b1,
    backgroundColor: '#fff',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '794px', // Standard A4 width at 96 DPI
        margin: '0 auto',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11px',
        color: '#000000',
        border: b2,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Document Header: 3-column box ── */}
      <div style={{ display: 'flex', borderBottom: b1, minHeight: '65px' }}>
        {/* Left: Logo */}
        <div style={{ width: '25%', padding: '6px 8px', borderRight: b1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" style={{ maxHeight: '48px', maxWidth: '100px', objectFit: 'contain' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '46px', height: '24px', borderRadius: '12px', border: '1.5px solid #0d9488', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f766e' }}>NP</span>
              </div>
              <div style={{ fontSize: '7px', fontStyle: 'italic', color: '#555', marginTop: '2px', whiteSpace: 'nowrap' }}>We Deliver Quality.....</div>
            </div>
          )}
        </div>

        {/* Center: Company Name */}
        <div style={{ width: '50%', padding: '8px', borderRight: b1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', letterSpacing: '0.3px', margin: 0 }}>
            {companyName}
          </h1>
        </div>

        {/* Right: Document Control Info */}
        <div style={{ width: '25%', display: 'flex', flexDirection: 'column', fontSize: '9.5px', fontWeight: '500' }}>
          <div style={{ padding: '4px 8px', borderBottom: b1, flex: 1, display: 'flex', alignItems: 'center' }}>
            NPPL/F/116
          </div>
          <div style={{ padding: '4px 8px', borderBottom: b1, flex: 1, display: 'flex', alignItems: 'center' }}>
            Rev- 00
          </div>
          <div style={{ padding: '4px 8px', flex: 1, display: 'flex', alignItems: 'center' }}>
            Rev Date- 01/04/2021
          </div>
        </div>
      </div>

      {/* ── Main Title Banner ── */}
      <div style={{ borderBottom: b1, backgroundColor: '#e2e8f0', padding: '6px 0', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        GOODS RECEIVED NOTE (GRN)
      </div>

      {/* ── Metadata Info Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...cellLabel, width: '30%' }}>PURCHASE ORDER NO</td>
            <td style={{ ...cellVal, width: '70%', textTransform: 'uppercase' }}>{poNo}</td>
          </tr>
          <tr>
            <td style={{ ...cellLabel, width: '30%' }}>GRN No.</td>
            <td style={{ ...cellVal, width: '70%', fontWeight: 'bold' }}>{grnNo || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellLabel, width: '30%' }}>INVOICE/CHALLAN NO</td>
            <td style={{ ...cellVal, width: '70%', textTransform: 'uppercase' }}>{invoiceChallanNo}</td>
          </tr>
          <tr>
            <td style={{ ...cellLabel, width: '30%' }}>DATE GOODS RECEIVED</td>
            <td style={{ ...cellVal, width: '70%' }}>{dateGoodsReceived}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Items & Verification Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: b1 }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: b1 }}>
            <th style={{ width: '45%', padding: '5px 8px', borderRight: b1, textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' }}>
              NAME
            </th>
            <th style={{ width: '25%', padding: '5px 8px', borderRight: b1, textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' }}>
              RECEIVED QTY
            </th>
            <th style={{ width: '30%', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' }}>
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
              <tr key={idx} style={{ borderBottom: b1, height: '28px', verticalAlign: 'middle' }}>
                <td style={{ padding: '4px 8px', borderRight: b1, fontWeight: '600', textTransform: 'uppercase' }}>
                  {name}
                </td>
                <td style={{ padding: '4px 8px', borderRight: b1, textAlign: 'center', fontWeight: 'bold' }}>
                  {qtyDisplay}
                </td>
                <td style={{ padding: '4px 8px' }}>
                  {mat.remarks || ''}
                </td>
              </tr>
            );
          })}

          {/* Additional empty rows for standard document proportion */}
          {Array.from({ length: blankRowsCount }).map((_, i) => (
            <tr key={`blank-${i}`} style={{ borderBottom: b1, height: '26px' }}>
              <td style={{ borderRight: b1 }}>&nbsp;</td>
              <td style={{ borderRight: b1 }}>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}

          {/* Verification rows */}
          <tr style={{ borderBottom: b1, height: '26px', verticalAlign: 'middle' }}>
            <td style={{ padding: '4px 8px', borderRight: b1, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
              T.C RECEIVED
            </td>
            <td style={{ padding: '4px 8px', borderRight: b1, textAlign: 'center' }}>
              {tcReceived}
            </td>
            <td style={{ padding: '4px 8px' }}>
              {tcRemarks}
            </td>
          </tr>

          <tr style={{ borderBottom: b1, height: '26px', verticalAlign: 'middle' }}>
            <td style={{ padding: '4px 8px', borderRight: b1, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
              QTY VERIFIED BY
            </td>
            <td style={{ padding: '4px 8px', borderRight: b1, textAlign: 'center' }}>
              {qtyVerifiedBy}
            </td>
            <td style={{ padding: '4px 8px' }}>
              {qtyRemarks}
            </td>
          </tr>

          <tr style={{ borderBottom: b1, height: '26px', verticalAlign: 'middle' }}>
            <td style={{ padding: '4px 8px', borderRight: b1, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
              QUALITY VERIFIED
            </td>
            <td style={{ padding: '4px 8px', borderRight: b1, textAlign: 'center' }}>
              {qualityVerified}
            </td>
            <td style={{ padding: '4px 8px' }}>
              {qcRemarks}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Receiver Signed Row ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: b1 }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', padding: '6px 8px', borderRight: b1, fontWeight: 'bold', textTransform: 'uppercase' }}>
              RECEIVER SIGNED
            </td>
            <td style={{ width: '35%', padding: '6px 8px', borderRight: b1 }}>
              {receiverName}
            </td>
            <td style={{ width: '18%', padding: '6px 8px', borderRight: b1, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', fontSize: '10px' }}>
              RECEIVED DATE
            </td>
            <td style={{ width: '17%', padding: '6px 8px', textAlign: 'center', fontSize: '10px' }}>
              {dateGoodsReceived}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Office Use Section ── */}
      <div style={{ backgroundColor: '#ffffff', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: b1 }}>
        FOR OFFICE USES ONLY
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', padding: '4px 8px', borderRight: b1, borderBottom: b1, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
              PO NUMBER
            </td>
            <td style={{ width: '70%', padding: '4px 8px', borderBottom: b1, textTransform: 'uppercase' }}>
              {poNo}
            </td>
          </tr>
          <tr>
            <td style={{ width: '30%', padding: '4px 8px', borderRight: b1, borderBottom: b1, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
              GRN NO
            </td>
            <td style={{ width: '70%', padding: '4px 8px', borderBottom: b1, fontWeight: 'bold', textTransform: 'uppercase' }}>
              {grnNo || '-'}
            </td>
          </tr>
          <tr style={{ minHeight: '50px' }}>
            <td style={{ width: '30%', padding: '12px 8px', borderRight: b1, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', verticalAlign: 'middle' }}>
              AUTHORISED SIGNATURE
            </td>
            <td style={{ width: '70%', padding: '12px 12px 4px', textAlign: 'right', verticalAlign: 'bottom' }}>
              <span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>Authorised Signatory</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
