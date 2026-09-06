// ─── BOM Template & Calculations Engine ───────────────────────────────────────

/**
 * Calculate Gross Rubber Weight from Net Weight and Scrap/Flash Percentage.
 * Gross Weight = Net Weight * (1 + Scrap% / 100)
 */
export function calculateGrossWeight(netWeight, scrapPercent) {
  const net = parseFloat(netWeight) || 0;
  const scrap = parseFloat(scrapPercent) || 0;
  if (net <= 0) return 0;
  const gross = net * (1 + scrap / 100);
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
  const grossWeightGrams = parseFloat(bom.grossWeight) || 0;
  const compoundRatePerKg = parseFloat(bom.compoundRate) || 0;
  
  // Rubber cost per piece: (Gross weight in grams / 1000) * Rate per kg
  const rubberCost = (grossWeightGrams / 1000) * compoundRatePerKg;

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
  polymer: 'Natural Rubber (NR)',
  colour: 'Black',
  hardness: '65 ± 5',
  specificGravity: '1.20',
  netWeight: '', // in grams
  scrapPercent: 12, // 12% standard flash/runner scrap
  grossWeight: '', // in grams
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
 * Pre-seeded realistic Rubber Industry BOMs
 */
export const SAMPLE_BOMS = [
  {
    id: 'bom-001',
    bomNo: 'BOM-26-001',
    bomTitle: 'Heavy-Duty Anti-Vibration Engine Mount',
    itemCode: 'ITM-2026-001',
    itemName: 'Engine Mounting Bush Type-A',
    customerPartNo: 'HY-ENG-98442',
    drawingNo: 'DWG-ENG-MNT-01',
    revisionNo: 'Rev 1.2',
    effectiveDate: '2026-08-15',
    status: 'Active',
    outputUom: 'Pcs',
    batchQty: 250,
    mouldCode: 'MOLD-AV-04',
    cavities: 4,
    cycleTimeSec: 240,
    machinePress: 'HYD-250T-01',

    compoundCode: 'CMP-NR-65',
    compoundName: 'High Resilient NR Compound',
    polymer: 'Natural Rubber (NR)',
    colour: 'Black',
    hardness: '65 ± 5',
    specificGravity: '1.18',
    netWeight: 84.5,
    scrapPercent: 10,
    grossWeight: 92.95,
    compoundRate: 180,

    inserts: [
      {
        id: 'ins-1',
        partName: 'Inner MS Bush OD 22mm x ID 12.2mm x L 45mm',
        material: 'Mild Steel (EN1A)',
        qty: 1,
        surfaceTreatment: 'Phosphated & Degreased',
        primer: 'Chemlok 205 + 6125 (Bonded)',
        unitCost: 28.50
      },
      {
        id: 'ins-2',
        partName: 'Outer Stamping Shell ID 48mm',
        material: 'CRCA Steel Sheet 2.5mm',
        qty: 1,
        surfaceTreatment: 'Zinc Plated (Trivalent)',
        primer: 'Chemlok 205 Primer Only',
        unitCost: 34.00
      }
    ],

    packaging: [
      {
        id: 'pkg-1',
        materialName: '7-Ply Corrugated Master Box (400x300x250mm)',
        packQty: 50,
        costPerPack: 45.00
      },
      {
        id: 'pkg-2',
        materialName: 'VCI Anti-Corrosion Poly Liner Bag',
        packQty: 50,
        costPerPack: 12.00
      },
      {
        id: 'pkg-3',
        materialName: 'Thermal Barcode & QR Tracking Label',
        packQty: 1,
        costPerPack: 0.85
      }
    ],

    routing: [
      { stepNo: 10, operation: 'Metal Degreasing & Grit Blasting', workCenter: 'Metal Prep Shop', cycleTimeMin: 10, notes: 'Grit size 60, Ra 2.5–3.5µm' },
      { stepNo: 20, operation: 'Chemlok Adhesive Spray Coating', workCenter: 'Coating Booth', cycleTimeMin: 8, notes: 'Chemlok 205 (15µm) + Chemlok 6125 (20µm)' },
      { stepNo: 30, operation: 'Transfer Moulding Press Cycle', workCenter: 'Press 250T #1', cycleTimeMin: 4, notes: 'Temp 175°C, Cure Time 240s' },
      { stepNo: 40, operation: 'Rotary Deflashing & Edge Inspection', workCenter: 'Finishing Shop', cycleTimeMin: 2, notes: 'Remove parting line flash < 0.2mm' },
      { stepNo: 50, operation: 'Pull-Off Bond Test & 100% Visual QC', workCenter: 'QA Laboratory', cycleTimeMin: 1.5, notes: 'Rubber-to-metal 100% rubber tear check' }
    ],

    overheadCost: 15.00,
    remarks: 'Approved for Tier-1 Automotive OEM supply. Standard 4-cavity mould.'
  },

  {
    id: 'bom-002',
    bomNo: 'BOM-26-002',
    bomTitle: 'Viton High-Temperature Flange O-Ring (FKM-75)',
    itemCode: 'ITM-2026-004',
    itemName: 'Viton Flange Seal Ring 85x5.3',
    customerPartNo: 'FLG-OR-8553',
    drawingNo: 'DWG-OR-85-V02',
    revisionNo: 'Rev 2.0',
    effectiveDate: '2026-09-01',
    status: 'Active',
    outputUom: 'Pcs',
    batchQty: 500,
    mouldCode: 'MOLD-OR-85',
    cavities: 8,
    cycleTimeSec: 180,
    machinePress: 'HYD-150T-03',

    compoundCode: 'CMP-FKM-75',
    compoundName: 'Fluoroelastomer FKM-75 Brown',
    polymer: 'Fluoroelastomer (Viton / FKM)',
    colour: 'Brown',
    hardness: '75 ± 5',
    specificGravity: '1.85',
    netWeight: 14.2,
    scrapPercent: 15,
    grossWeight: 16.33,
    compoundRate: 1450,

    inserts: [],

    packaging: [
      {
        id: 'pkg-1',
        materialName: 'Sealed Anti-Static LDPE Bag (50 Pcs/Pack)',
        packQty: 50,
        costPerPack: 8.50
      },
      {
        id: 'pkg-2',
        materialName: 'Small Rigid Shipping Carton (300 Pcs)',
        packQty: 300,
        costPerPack: 28.00
      }
    ],

    routing: [
      { stepNo: 10, operation: 'Cold Feed Precision Preforming (Extruded Ring)', workCenter: 'Preform Line', cycleTimeMin: 5, notes: 'Ring slug weight 16.3g ±0.2g' },
      { stepNo: 20, operation: 'Vacuum Compression Moulding', workCenter: 'Press 150T #3', cycleTimeMin: 3, notes: '180°C, 3 mins cure' },
      { stepNo: 30, operation: 'Cryogenic Tumbling Deflashing', workCenter: 'Cryo-Tumbler #1', cycleTimeMin: 10, notes: 'Liquid Nitrogen at -110°C, 8 mins' },
      { stepNo: 40, operation: 'Post-Cure Oven Cycle', workCenter: 'Hot Air Oven #2', cycleTimeMin: 240, notes: '200°C for 4 hours constant' },
      { stepNo: 50, operation: 'Optical Sorter Dimensional Inspection', workCenter: 'Optical QC Station', cycleTimeMin: 0.5, notes: 'ID/OD and cross section tolerance check' }
    ],

    overheadCost: 6.50,
    remarks: 'Critical aerospace fuel system grade. Requires strict 4-hour post-cure certificate.'
  },

  {
    id: 'bom-003',
    bomNo: 'BOM-26-003',
    bomTitle: 'EPDM Weatherstrip Door Seal with Fabric Insert',
    itemCode: 'ITM-2026-008',
    itemName: 'EPDM Extruded Door Profile Seal',
    customerPartNo: 'WS-EPDM-1200',
    drawingNo: 'DWG-WS-EPDM-03',
    revisionNo: 'Rev 1.0',
    effectiveDate: '2026-08-20',
    status: 'Under Review',
    outputUom: 'Mtr',
    batchQty: 1000,
    mouldCode: 'DIE-EXT-WS-02',
    cavities: 1,
    cycleTimeSec: 60,
    machinePress: 'EXT-90MM-LINE',

    compoundCode: 'CMP-EPDM-65',
    compoundName: 'Weatherproof EPDM Sponge-Dense',
    polymer: 'EPDM',
    colour: 'Black',
    hardness: '65 ± 5',
    specificGravity: '1.24',
    netWeight: 145.0,
    scrapPercent: 8,
    grossWeight: 156.6,
    compoundRate: 165,

    inserts: [
      {
        id: 'ins-1',
        partName: 'Nylon Cord Fabric Tape 15mm Width',
        material: 'Woven Nylon Reinforcement',
        qty: 1,
        surfaceTreatment: 'RFL Treated for Rubber Adhesion',
        primer: 'None (Self-bonding)',
        unitCost: 4.20
      }
    ],

    packaging: [
      {
        id: 'pkg-1',
        materialName: 'Coil Winding Wooden Spool (100 Mtrs)',
        packQty: 100,
        costPerPack: 85.00
      },
      {
        id: 'pkg-2',
        materialName: 'Stretch Wrap Plastic Film (per spool)',
        packQty: 100,
        costPerPack: 15.00
      }
    ],

    routing: [
      { stepNo: 10, operation: 'Continuous UHF Microwave Extrusion', workCenter: 'Extrusion Line 1', cycleTimeMin: 1, notes: 'Continuous feed with fabric insertion' },
      { stepNo: 20, operation: 'Hot Air Vulcanizing Tunnel (HAV)', workCenter: 'Curing Tunnel', cycleTimeMin: 2, notes: '220°C tunnel temp' },
      { stepNo: 30, operation: 'Water Cooling & Length Precision Slicing', workCenter: 'Cooling Trough', cycleTimeMin: 1, notes: 'Air dry and auto cut' },
      { stepNo: 40, operation: 'Spool Winding & QA Tagging', workCenter: 'Packaging', cycleTimeMin: 1, notes: '100 meters per spool roll' }
    ],

    overheadCost: 8.00,
    remarks: 'Designed for architectural door & window frame sealing. UV and ozone resistant.'
  },

  {
    id: 'bom-004',
    bomNo: 'BOM-26-004',
    bomTitle: 'Automotive Suspension Bushing (NBR-70)',
    itemCode: 'ITM-2026-012',
    itemName: 'Rear Control Arm Bushing',
    customerPartNo: 'SUS-CTRL-771',
    drawingNo: 'DWG-SUS-771-A',
    revisionNo: 'Rev 1.1',
    effectiveDate: '2026-07-10',
    status: 'Draft',
    outputUom: 'Pcs',
    batchQty: 400,
    mouldCode: 'MOLD-SUS-08',
    cavities: 6,
    cycleTimeSec: 210,
    machinePress: 'HYD-200T-02',

    compoundCode: 'CMP-NBR-70',
    compoundName: 'Oil Resistant NBR Compound',
    polymer: 'Nitrile (NBR)',
    colour: 'Black',
    hardness: '70 ± 5',
    specificGravity: '1.25',
    netWeight: 42.0,
    scrapPercent: 12,
    grossWeight: 47.04,
    compoundRate: 210,

    inserts: [
      {
        id: 'ins-1',
        partName: 'Inner Steel Sleeve OD 16mm ID 10mm L 35mm',
        material: 'Seamless Carbon Steel Tube',
        qty: 1,
        surfaceTreatment: 'Zinc-Nickel Plated (Black)',
        primer: 'Chemlok 205 + 220',
        unitCost: 19.50
      }
    ],

    packaging: [
      {
        id: 'pkg-1',
        materialName: 'Corrugated Carton Box (100 Pcs)',
        packQty: 100,
        costPerPack: 35.00
      }
    ],

    routing: [
      { stepNo: 10, operation: 'Insert Primer Application & Induction Pre-heat', workCenter: 'Pre-heating Station', cycleTimeMin: 5, notes: 'Preheat sleeve to 90°C' },
      { stepNo: 20, operation: 'Injection Moulding Cycle', workCenter: 'Rubber Injection 200T', cycleTimeMin: 3.5, notes: 'Injection pressure 120 bar, 168°C' },
      { stepNo: 30, operation: 'Cryogenic Deflashing', workCenter: 'Cryo Machine', cycleTimeMin: 6, notes: 'Pellet deflash' },
      { stepNo: 40, operation: 'Torsional Stiffness Quality Test', workCenter: 'QA Dynamic Lab', cycleTimeMin: 1, notes: 'Check static and dynamic radial rate' }
    ],

    overheadCost: 11.00,
    remarks: 'OEM suspension component. Radial stiffness test report mandatory for each lot.'
  }
];
