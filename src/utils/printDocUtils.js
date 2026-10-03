// ── Default Company Metadata ────────────────────────────────────────────────
export const DEFAULT_COMPANY = {
  name: 'Nisarg Polymers Pvt. Ltd.',
  address: 'A/13, Jay Vijay Ind. Estate, Opp. Dhuri Ind. Estate\nWaliv Phata, Vasai (E), Palghar 401208',
  country: 'Country of origin - INDIA',
  contact: 'Contact No. 8530640111, 9867267545',
  gstin: '27AAHCN0987F1Z8',
  state: 'Maharashtra, Code : 27',
  pan: 'AAHCN0987F',
  cin: 'U25209MH2020PTC343993',
  email: 'sales@nisargpolymers.com',
};

// ── Number to Indian Currency Words ──────────────────────────────────────────
export function numberToIndianWords(amount) {
  if (!amount || isNaN(amount) || Number(amount) === 0) return 'Zero Only';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(num) {
    let str = '';
    if (num >= 100) { str += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
    if (num >= 20)  { str += tens[Math.floor(num / 10)] + ' '; num %= 10; }
    if (num > 0)    { str += ones[num] + ' '; }
    return str.trim();
  }

  const [intPart, decPart] = Number(amount).toFixed(2).split('.');
  let num = parseInt(intPart, 10);
  if (num === 0 && (!decPart || parseInt(decPart, 10) === 0)) return 'Zero Only';

  let words = '';
  if (num >= 10000000) { words += numToWords(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (num >= 100000)   { words += numToWords(Math.floor(num / 100000)) + ' Lakh ';   num %= 100000; }
  if (num >= 100000)     { words += numToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  else if (num >= 1000)  { words += numToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (num > 0)         { words += numToWords(num) + ' '; }

  words = words.trim();
  let result = words || 'Zero';
  const decNum = parseInt(decPart, 10);
  if (decNum > 0) result += ' and ' + numToWords(decNum) + ' Paise';
  return 'INR ' + result + ' Only';
}

// ── Standard Document Date Formatter (DD-Mon-YY) ──────────────────────────────
export function formatDocDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
}

// Alias for backward compatibility
export const formatPoDate = formatDocDate;

// ── Shared Direct Print Function ─────────────────────────────────────────────
export function printHtmlElement(elementId, title = 'Document') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups for this site to print.');
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      @page { size: A4 portrait; margin: 8mm 10mm; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10px;
        color: #000;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      table { border-collapse: collapse; width: 100%; }
      th, td { box-sizing: border-box; }
      img { object-fit: contain; }
      .page-break { page-break-before: always !important; break-before: page !important; }
      .no-print { display: none !important; }
      @media print {
        .page-break { page-break-before: always !important; break-before: page !important; }
        .no-print { display: none !important; }
        body { padding: 0 !important; margin: 0 !important; }
      }
    </style>
  </head><body><div style="width:100%;">${el.innerHTML}</div></body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}
