// ── Purchase Order Standard Terms & Conditions ────────────────────────────────
// Extracted from standard company PO documentation (Clauses 1 to 22)

export const PO_TERMS_PAGE_1 = [
  {
    num: 1,
    title: 'Acceptance of Purchase Order',
    text: (companyName) =>
      `The supplier shall confirm acceptance of the Purchase Order, including price, quantity, delivery schedule, payment terms and all technical requirements. Any deviation shall be valid only after written approval from ${companyName}.`,
  },
  {
    num: 2,
    title: 'Price',
    text: () =>
      'Prices mentioned in the Purchase Order shall remain firm and fixed unless otherwise agreed in writing. No additional charges such as packing, forwarding, freight, insurance or handling shall be payable unless specifically mentioned in the Purchase Order.',
  },
  {
    num: 3,
    title: 'Taxes and Statutory Compliance',
    text: () =>
      'GST and other applicable taxes shall be charged strictly as per prevailing law and as stated in the Purchase Order. The supplier shall provide valid GST invoice and comply with all statutory requirements applicable to the supply.',
  },
  {
    num: 4,
    title: 'Delivery Schedule',
    text: (companyName) =>
      `Delivery shall be completed strictly as per the date or schedule mentioned in the Purchase Order. Any anticipated delay shall be informed immediately in writing. ${companyName} reserves the right to reschedule or cancel delayed quantities where such delay affects production or customer commitments.`,
  },
  {
    num: 5,
    title: 'Quantity and Partial Supply',
    text: () =>
      'The supplier shall supply the exact ordered quantity unless otherwise approved. Partial delivery or excess quantity shall not be accepted without prior written approval.',
  },
  {
    num: 6,
    title: 'Packing and Identification',
    text: () =>
      'Material shall be packed suitably to avoid damage, contamination, rust, deformation, moisture or deterioration during handling and transit. Each package shall carry proper identification including supplier name, PO number, item description, quantity, batch/lot number and date wherever applicable.',
  },
  {
    num: 7,
    title: 'Quality Requirements',
    text: () =>
      'All material shall conform to the approved drawing, specification, sample, quality plan, material grade and other technical requirements stated in the Purchase Order. Material shall be free from defects and suitable for its intended use.',
  },
  {
    num: 8,
    title: 'Inspection and Rejection',
    text: (companyName) =>
      `${companyName} reserves the right to inspect material at receipt or during use. Rejected material shall be replaced or reworked by the supplier at no additional cost. All costs arising from rejection, sorting, rework, return freight or line stoppage attributable to supplier quality shall be to the supplier's account, subject to mutual verification.`,
  },
  {
    num: 9,
    title: 'Test Certificate / Compliance Documents',
    text: () =>
      'Where applicable, the supplier shall provide Test Certificate, Certificate of Analysis, Material Test Certificate, RoHS/REACH declaration, calibration certificate, inspection report or any other compliance document specified in the Purchase Order. Such documents shall accompany the material or be submitted electronically before dispatch.',
  },
  {
    num: 10,
    title: 'Traceability',
    text: () =>
      'The supplier shall maintain proper batch/lot traceability for raw material, process and inspection records wherever applicable and shall make such records available on request.',
  },
];

export const PO_TERMS_PAGE_2 = [
  {
    num: 11,
    title: 'Change Control',
    text: (companyName) =>
      `The supplier shall not change material source, grade, formulation, manufacturing process, tooling, sub-supplier, manufacturing location or specification without prior written approval from ${companyName} where such change can affect fit, form, function, quality or compliance.`,
  },
  {
    num: 12,
    title: 'Warranty',
    text: () =>
      'The supplier warrants that the supplied goods shall be new, free from defects in material and workmanship, and compliant with the Purchase Order requirements. Any defect identified within a reasonable period due to supplier responsibility shall be corrected or replaced by the supplier.',
  },
  {
    num: 13,
    title: 'Payment Terms',
    text: () =>
      'Payment shall be processed as per the payment terms mentioned in the Purchase Order and subject to receipt of correct invoice, accepted material and required documents. Any discrepancy in invoice or material may result in payment being kept on hold until resolution.',
  },
  {
    num: 14,
    title: 'Invoice Requirements',
    text: () =>
      'The invoice must clearly mention Purchase Order number, item code/description, quantity, HSN/SAC, GST details, delivery challan number and other statutory particulars. Incorrect or incomplete invoices may be returned for correction.',
  },
  {
    num: 15,
    title: 'Freight and Risk',
    text: () =>
      'Freight terms and delivery location shall be as specified in the Purchase Order. Risk of loss or damage shall remain with the supplier until material is delivered and accepted at the designated delivery location, unless otherwise agreed.',
  },
  {
    num: 16,
    title: 'Confidentiality',
    text: (companyName) =>
      `All drawings, specifications, samples, prices, technical information and commercial information shared by ${companyName} shall be treated as confidential and shall not be disclosed or used for any purpose other than execution of the Purchase Order without prior written consent.`,
  },
  {
    num: 17,
    title: 'Intellectual Property and Tooling',
    text: (companyName) =>
      `Any drawing, design, pattern, die, mould, fixture, gauge or tooling provided by or paid for by ${companyName} shall remain its property unless otherwise agreed in writing. Such items shall be properly identified, maintained and used only for authorized supplies.`,
  },
  {
    num: 18,
    title: 'Subcontracting',
    text: () =>
      'The supplier shall not subcontract any critical process or the complete scope of supply without prior approval where such subcontracting may affect quality, delivery or compliance.',
  },
  {
    num: 19,
    title: 'Safety and Legal Compliance',
    text: () =>
      'The supplier shall comply with all applicable laws, safety requirements, environmental regulations and labour regulations relevant to the supply of goods or services.',
  },
  {
    num: 20,
    title: 'Force Majeure',
    text: () =>
      'Neither party shall be liable for delay caused by events beyond reasonable control, provided the affected party informs the other promptly and takes reasonable steps to minimize the impact.',
  },
  {
    num: 21,
    title: 'Cancellation / Amendment',
    text: (companyName) =>
      `${companyName} may amend or cancel the Purchase Order in writing. Any claim arising from such amendment or cancellation shall be considered only where specifically accepted in writing.`,
  },
  {
    num: 22,
    title: 'Governing Terms',
    text: () =>
      'In case of any conflict between these standard terms and specific conditions stated in the Purchase Order, the specific Purchase Order conditions shall prevail.',
  },
];

/**
 * Standard Terms & Conditions - Page 1
 * Displays company header banner, intro statement, and clauses 1-10.
 * Styled with minHeight: 260mm and flex layout to naturally fill the A4 page and anchor the footer at the bottom.
 */
export function PoTermsConditionsPage1({ companyName = 'Nisarg Polymers Pvt. Ltd.' }) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '260mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10px',
        color: '#000000',
        lineHeight: '1.45',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* ── Top Header Box ── */}
        <div
          style={{
            border: '1.5px solid #284b70',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ebf2f8',
              color: '#1e3a8a',
              fontWeight: '800',
              fontSize: '17px',
              textAlign: 'center',
              padding: '9px 12px 7px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              borderBottom: '1.5px solid #284b70',
            }}
          >
            {companyName.toUpperCase()}
          </div>
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontWeight: '700',
              fontSize: '11.5px',
              textAlign: 'center',
              padding: '6px 12px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}
          >
            PURCHASE ORDER - STANDARD TERMS &amp; CONDITIONS
          </div>
        </div>

        {/* ── Introductory Paragraph ── */}
        <div
          style={{
            fontSize: '10.2px',
            lineHeight: '1.52',
            color: '#1e293b',
            marginBottom: '14px',
            textAlign: 'justify',
          }}
        >
          These terms and conditions form an integral part of every Purchase Order issued by {companyName}. Unless specifically agreed otherwise in writing, acceptance of the Purchase Order shall be deemed acceptance of the following terms and conditions.
        </div>

        {/* ── Clauses 1 to 10 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {PO_TERMS_PAGE_1.map((term) => (
            <div key={term.num}>
              <div
                style={{
                  fontSize: '10.8px',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '2.5px',
                }}
              >
                {term.num}. {term.title}
              </div>
              <div
                style={{
                  fontSize: '9.8px',
                  lineHeight: '1.46',
                  color: '#1e293b',
                  textAlign: 'justify',
                }}
              >
                {term.text(companyName)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Page 1 Footer ── */}
      <div
        style={{
          marginTop: '18px',
          borderTop: '1px solid #cbd5e1',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px',
          color: '#64748b',
        }}
      >
        <span>{companyName} - Purchase Order Terms &amp; Conditions</span>
        <span>Page 1</span>
      </div>
    </div>
  );
}

/**
 * Standard Terms & Conditions - Page 2
 * Displays clauses 11-22, formal acceptance note, and footer.
 * Styled with minHeight: 260mm and flex layout to naturally fill the A4 page and anchor the footer at the bottom.
 */
export function PoTermsConditionsPage2({ companyName = 'Nisarg Polymers Pvt. Ltd.' }) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '260mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10px',
        color: '#000000',
        lineHeight: '1.45',
        boxSizing: 'border-box',
        paddingTop: '4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* ── Clauses 11 to 22 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PO_TERMS_PAGE_2.map((term) => (
            <div key={term.num}>
              <div
                style={{
                  fontSize: '10.8px',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '2.5px',
                }}
              >
                {term.num}. {term.title}
              </div>
              <div
                style={{
                  fontSize: '9.8px',
                  lineHeight: '1.46',
                  color: '#1e293b',
                  textAlign: 'justify',
                }}
              >
                {term.text(companyName)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Acceptance Note ── */}
        <div
          style={{
            marginTop: '16px',
            fontSize: '9.6px',
            color: '#334155',
            fontStyle: 'italic',
            lineHeight: '1.45',
          }}
        >
          <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Note:</span>{' '}
          Supplier dispatch of material or written acknowledgement of the Purchase Order shall constitute acceptance of these terms and conditions.
        </div>
      </div>

      {/* ── Page 2 Footer ── */}
      <div
        style={{
          marginTop: '18px',
          borderTop: '1px solid #cbd5e1',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px',
          color: '#64748b',
        }}
      >
        <span>{companyName} - Purchase Order Terms &amp; Conditions</span>
        <span>Page 2</span>
      </div>
    </div>
  );
}
