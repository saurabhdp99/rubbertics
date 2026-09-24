// ─── BOM Template & Calculations Engine ───────────────────────────────────────

/**
 * Calculate Gross Rubber Weight from Net Weight and Weight Loss / Fly Loss Percentage.
 * Gross Weight = Net Weight * (1 + (Weight Loss / Fly Loss)% / 100)
 */
export function calculateGrossWeight(netWeight, lossPercent) {
  const net = parseFloat(netWeight) || 0;
  const loss = parseFloat(lossPercent) || 0;
  if (net <= 0) return 0;
  const gross = net * (1 + loss / 100);
  return Math.round(gross * 100) / 100;
}

/**
 * Calculate Material Yield Percentage.
 * Yield % = (Net Weight / Gross Weight) * 100
 */
export function calculateMaterialYield(netWeight, grossWeight) {
  const net = parseFloat(netWeight) || 0;
  const gross = parseFloat(grossWeight) || 0;
  if (gross <= 0) return 100;
  const yieldPct = (net / gross) * 100;
  return Math.round(yieldPct * 10) / 10;
}

/**
 * Calculate Total Cost Breakdown for a BOM.
 */
export function calculateBOMCost(bom) {
  const grossWeightKg = parseFloat(bom.grossWeight) || 0;
  const compoundRatePerKg = parseFloat(bom.compoundRate) || 0;

  // Rubber cost per piece: (Rate per kg * Shot Weight in kg) / Cavities
  const shotWeightKg = parseFloat(bom.toolSortWeight) || 0;
  const cavities = parseFloat(bom.cavities) || 1;
  const rubberCost = shotWeightKg > 0 
    ? (compoundRatePerKg * shotWeightKg) / cavities 
    : (grossWeightKg * compoundRatePerKg);

  // Inserts & Sub-components cost
  const insertsCost = (bom.inserts || []).reduce((acc, ins) => {
    const qty = parseFloat(ins.qty) || 0;
    const unitPrice = parseFloat(ins.unitCost) || 0;
    return acc + (qty * unitPrice);
  }, 0);

  // Packaging cost per piece
  const packagingCost = (bom.packaging || []).reduce((acc, pkg) => {
    const packQty = parseFloat(pkg.packQty) || 1;
    const costPerPack = parseFloat(pkg.costPerPack) || 0;
    const costPerPiece = packQty > 0 ? (costPerPack / packQty) : 0;
    return acc + costPerPiece;
  }, 0);

  // Machine / Labor overhead cost per piece
  const laborOverhead = parseFloat(bom.overheadCost) || 0;

  const totalUnitCost = rubberCost + insertsCost + packagingCost + laborOverhead;
  const batchQty = parseFloat(bom.batchQty) || 100;
  const totalBatchCost = totalUnitCost * batchQty;

  return {
    rubberCost: Math.round(rubberCost * 100) / 100,
    insertsCost: Math.round(insertsCost * 100) / 100,
    packagingCost: Math.round(packagingCost * 100) / 100,
    laborOverhead: Math.round(laborOverhead * 100) / 100,
    totalUnitCost: Math.round(totalUnitCost * 100) / 100,
    totalBatchCost: Math.round(totalBatchCost * 100) / 100,
  };
}

/**
 * Default empty BOM blueprint
 */
export const DEFAULT_BOM = {
  creationDate: new Date().toISOString().split('T')[0],
  bomNo: '',
  bomTitle: '',
  itemCode: '',
  itemName: '',
  customerPartNo: '',
  drawingNo: '',
  revisionNo: 'Rev 1.0',
  effectiveDate: new Date().toISOString().split('T')[0],
  status: 'Draft', // Draft, Active, Under Review, Obsolete
  outputUom: 'Pcs',
  batchQty: 100,
  mouldCode: '',
  cavities: 1,
  cycleTimeSec: 180,
  machinePress: '',

  // Rubber Compound
  compoundCode: '',
  compoundName: '',
  polymer: '',
  colour: '',
  hardness: '',
  specificGravity: '1.20',
  netCompoundWeight: '', // in kg (auto-fetched from Compound Master net_weight)
  netWeight: '', // backwards compatibility (kg)
  weightLossFlyLossPercent: '', // no default - user must enter
  scrapPercent: '', // backwards compatibility (no default)
  grossWeight: '', // in kg
  compoundRate: '', // $/kg or ₹/kg

  // Multi-item tables
  inserts: [],
  packaging: [],
  routing: [
    { stepNo: 10, operation: 'Compound Blank Cutting / Extrusion', workCenter: 'Preparation Dept', cycleTimeMin: 15, notes: 'Cut blanks to weight tolerance ±1g' },
    { stepNo: 20, operation: 'Compression / Injection Moulding', workCenter: 'Moulding Press Shop', cycleTimeMin: 3.5, notes: 'Cure at 170°C ± 5°C' },
    { stepNo: 30, operation: 'Deflashing & Trimming', workCenter: 'Finishing Dept', cycleTimeMin: 2, notes: 'Punch trim flash and tear-trim edges' },
    { stepNo: 40, operation: '100% Visual & Dimensional QC', workCenter: 'Quality Assurance', cycleTimeMin: 1, notes: 'Check for air traps, non-fills and cracks' },
    { stepNo: 50, operation: 'Standard Packing & Labeling', workCenter: 'Dispatch Packing', cycleTimeMin: 1, notes: 'Pack in approved corrugated boxes with QA stamp' }
  ],
  images: [],

  overheadCost: 0,
  remarks: ''
};

/**
 * Standard Polymer Categories
 */
export const POLYMER_OPTIONS = [
  'Natural Rubber (NR)',
  'Nitrile (NBR)',
  'EPDM',
  'Silicone (VMQ)',
  'Fluoroelastomer (Viton / FKM)',
  'Neoprene (CR)',
  'SBR',
  'Polyurethane (PU)',
  'Butyl (IIR)',
  'Polyacrylate (ACM)'
];

/**
 * Pre-seeded realistic Rubber Industry BOMs (cleared)
 */
export const SAMPLE_BOMS = [];

