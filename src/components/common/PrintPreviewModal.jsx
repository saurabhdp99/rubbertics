import { X, Printer, FileText } from 'lucide-react';
import { printHtmlElement } from '../../utils/printDocUtils';

/**
 * Reusable Print Preview Modal Shell
 * Used across Purchase Orders, Sale Orders, GRNs, and any future printable documents.
 * 
 * Props:
 * - isOpen (bool): whether modal is open
 * - onClose (fn): close callback
 * - title (string): document title, e.g. "Purchase Order", "Sale Order", "Goods Received Note (GRN)"
 * - documentNo (string): voucher / order / GRN number badge
 * - elementId (string): unique id of printable container (default: 'printable-doc-root')
 * - children: the document JSX to render and print
 */
export default function PrintPreviewModal({
  isOpen,
  onClose,
  title = 'Document',
  documentNo = '',
  elementId = 'printable-doc-root',
  children,
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    printHtmlElement(elementId, `${title}${documentNo ? ` - ${documentNo}` : ''}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto">
      {/* ── Top Action Bar ── */}
      <div className="w-full max-w-4xl mb-3 flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 flex-shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate">{title}</h3>
            {documentNo && (
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/25 flex-shrink-0">
                {documentNo}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Print action (opens print dialog, user can print or select 'Save as PDF') */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Preview Card & Printable Root ── */}
      <div className="w-full max-w-4xl bg-slate-200 rounded-lg p-4 shadow-inner">
        <div
          id={elementId}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
