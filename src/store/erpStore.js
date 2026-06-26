import { create } from 'zustand';

// Sample initial data matching the screenshot structure
const initialOrders = [
  {
    id: 1,
    date: '2024-01-15',
    poNo: 'PO2024-0015',
    poType: 'Purchase',
    processLocation: 'Vendor',
    partyName: 'Reliance Industries',
    partNo: 'RIL-PART-001',
    productName: 'SS-230 FILTERS FLANGE/SOCKET 120/14F-NISARG',
    typeOfProcess: 'Machining',
    orderQty: 50,
    dispatchQty: 30,
    balanceQty: 20,
    deliveryDate: '2024-02-15',
    daysLeft: 12,
    priority: 'High',
    remark: 'Urgent delivery',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 2,
    date: '2024-01-18',
    poNo: 'PO2024-0022',
    poType: 'Production',
    processLocation: 'Production',
    partyName: 'SAHIL ALLEQUIPMENT',
    partNo: 'SA-PART-0022',
    productName: 'TRO-N NISARG 40/12 SPECIAL GRADE',
    typeOfProcess: 'Moulding',
    orderQty: 100,
    dispatchQty: 100,
    balanceQty: 0,
    deliveryDate: '2024-01-28',
    daysLeft: 0,
    priority: 'Normal',
    remark: 'Delivered on time',
    finalStatus: 'Dispatched',
  },
  {
    id: 3,
    date: '2024-01-20',
    poNo: 'PO2024-0031',
    poType: 'Purchase',
    processLocation: 'Vendor',
    partyName: 'TATA MOTORS LTD',
    partNo: 'TM-VALVE-031',
    productName: 'SS-250 VALVE ASSEMBLY FLANGE TYPE 200MM',
    typeOfProcess: 'Assembly',
    orderQty: 200,
    dispatchQty: 0,
    balanceQty: 200,
    deliveryDate: '2024-03-01',
    daysLeft: 25,
    priority: 'Medium',
    remark: '',
    finalStatus: 'Pending Dispatch',
  },
  {
    id: 4,
    date: '2024-01-22',
    poNo: 'PO2024-0038',
    poType: 'Production',
    processLocation: 'Production',
    partyName: 'Ambuja Cement Ltd',
    partNo: 'ACL-PUMP-038',
    productName: 'PUMP HOUSING SS-316 NISARG SPECIAL 80MM',
    typeOfProcess: 'Finishing',
    orderQty: 15,
    dispatchQty: 10,
    balanceQty: 5,
    deliveryDate: '2024-02-10',
    daysLeft: 5,
    priority: 'High',
    remark: 'Partial dispatched',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 5,
    date: '2024-01-25',
    poNo: 'PO2024-0045',
    poType: 'Purchase',
    processLocation: 'Vendor',
    partyName: 'GAIL India Limited',
    partNo: 'GAIL-FLANGE-045',
    productName: 'FLANGE ORIFICE PLATE SS-304 NISARG 150MM',
    typeOfProcess: 'Machining',
    orderQty: 75,
    dispatchQty: 75,
    balanceQty: 0,
    deliveryDate: '2024-02-05',
    daysLeft: 0,
    priority: 'Normal',
    remark: 'Completed',
    finalStatus: 'Dispatched',
  },
  {
    id: 6,
    date: '2024-01-28',
    poNo: 'PO2024-0052',
    poType: 'Production',
    processLocation: 'Production',
    partyName: 'BHEL Haridwar',
    partNo: 'BHEL-BOILER-052',
    productName: 'BOILER TUBE FITTING SS-321 NISARG 25MM',
    typeOfProcess: 'Extrusion',
    orderQty: 500,
    dispatchQty: 200,
    balanceQty: 300,
    deliveryDate: '2024-03-15',
    daysLeft: 30,
    priority: 'Low',
    remark: 'Large order',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 7,
    date: '2024-02-01',
    poNo: 'PO2024-0060',
    poType: 'Purchase',
    processLocation: 'Vendor',
    partyName: 'ONGC Petroleum',
    partNo: 'ONGC-VALVE-060',
    productName: 'GATE VALVE SS-316L NISARG API 600 4 INCH',
    typeOfProcess: 'Assembly',
    orderQty: 30,
    dispatchQty: 0,
    balanceQty: 30,
    deliveryDate: '2024-02-20',
    daysLeft: 3,
    priority: 'Urgent',
    remark: 'Critical project',
    finalStatus: 'Pending Dispatch',
  },
];

const initialWeeklyPlans = [
  {
    id: 1,
    partName: '300WATT JALI GASKET',
    partNo: 'PG-JALI-001',
    machineSize: '250 Ton',
    workOrderNo: 'WO-2024-089',
    cavity: 1,
    schedule: {
      monday: {
        day: { plan: 250, actual: 222, operator: 'GAUTAM' },
        night: { plan: 240, actual: 235, operator: 'RAMESH' }
      },
      tuesday: {
        day: { plan: 250, actual: 240, operator: 'GAUTAM' },
        night: { plan: 240, actual: 242, operator: 'RAMESH' }
      },
      wednesday: {
        day: { plan: 260, actual: 255, operator: 'GAUTAM' },
        night: { plan: 240, actual: 238, operator: 'RAMESH' }
      },
      thursday: {
        day: { plan: 250, actual: 248, operator: 'SANDEEP' },
        night: { plan: 240, actual: 240, operator: 'SURESH' }
      },
      friday: {
        day: { plan: 250, actual: 252, operator: 'SANDEEP' },
        night: { plan: 240, actual: 230, operator: 'SURESH' }
      },
      saturday: {
        day: { plan: 220, actual: 210, operator: 'SANDEEP' },
        night: { plan: 200, actual: 195, operator: 'SURESH' }
      }
    }
  },
  {
    id: 2,
    partName: 'CT BOOT',
    partNo: 'BT-CT-552',
    machineSize: '150 Ton',
    workOrderNo: 'WO-2024-112',
    cavity: 6,
    schedule: {
      monday: {
        day: { plan: 240, actual: 193, operator: 'SANDEEP' },
        night: { plan: 220, actual: 210, operator: 'AJAY' }
      },
      tuesday: {
        day: { plan: 240, actual: 235, operator: 'SANDEEP' },
        night: { plan: 220, actual: 215, operator: 'AJAY' }
      },
      wednesday: {
        day: { plan: 240, actual: 242, operator: 'SANDEEP' },
        night: { plan: 220, actual: 220, operator: 'AJAY' }
      },
      thursday: {
        day: { plan: 240, actual: 238, operator: 'GAUTAM' },
        night: { plan: 220, actual: 218, operator: 'RAMESH' }
      },
      friday: {
        day: { plan: 240, actual: 245, operator: 'GAUTAM' },
        night: { plan: 220, actual: 222, operator: 'RAMESH' }
      },
      saturday: {
        day: { plan: 200, actual: 190, operator: 'GAUTAM' },
        night: { plan: 180, actual: 175, operator: 'RAMESH' }
      }
    }
  }
];

const initialItemMasterItems = [
  {
    id: 1,
    itemCategory: 'Rubber Product',
    itemCode: 'ITM-RUB-1001',
    itemName: 'EPDM Door Gasket',
    description: 'Extruded EPDM sealing gasket for automotive door frame',
    itemPrice: 84.5,
    remarks: 'High runner',
    itemHsn: '40169990',
    hsnTax: 18,
    itemAlloy: 'EPDM 70 Shore',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 0.42,
    isProduct: 'Yes',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Finished Goods',
    departmentName: 'Moulding',
    moq: 500,
    leadTime: 7,
    batchQty: 1000,
    minimumQty: 300,
    maximumQty: 5000,
    reorderLevelQty: 800,
    salesTolerance: 2,
    purchaseTolerance: 2,
    itemPurchaseLedger: 'Raw Material Purchase',
    itemSaleLedger: 'Finished Goods Sales',
    itemServiceLedger: 'Job Work Charges',
    className: 'A',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'Rubber Scrap',
    mrpPrice: 112,
    drawingNo: 'DRG-EPDM-001',
    revisionNo: 'R2',
    customerName: 'Tata Motors Ltd',
    partName: 'Door Gasket',
    partNo: 'TM-DG-4482',
  },
  {
    id: 2,
    itemCategory: 'Rubber Product',
    itemCode: 'ITM-RUB-1002',
    itemName: 'NBR Oil Seal',
    description: 'Moulded NBR oil seal for transmission assembly',
    itemPrice: 46.75,
    remarks: 'Needs final visual inspection',
    itemHsn: '40169320',
    hsnTax: 18,
    itemAlloy: 'NBR 75 Shore',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 0.08,
    isProduct: 'Yes',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Finished Goods',
    departmentName: 'Finishing',
    moq: 1000,
    leadTime: 5,
    batchQty: 2500,
    minimumQty: 500,
    maximumQty: 10000,
    reorderLevelQty: 1200,
    salesTolerance: 1,
    purchaseTolerance: 1,
    itemPurchaseLedger: 'Raw Material Purchase',
    itemSaleLedger: 'Finished Goods Sales',
    itemServiceLedger: 'Testing Charges',
    className: 'A',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'Rubber Scrap',
    mrpPrice: 62,
    drawingNo: 'DRG-NBR-114',
    revisionNo: 'R1',
    customerName: 'Bajaj Auto Ltd',
    partName: 'Oil Seal',
    partNo: 'BA-OS-2207',
  },
  {
    id: 3,
    itemCategory: 'Compound',
    itemCode: 'ITM-CMP-2101',
    itemName: 'Natural Rubber Compound Black',
    description: 'General purpose black compound for moulding line',
    itemPrice: 192.4,
    remarks: 'Batch controlled',
    itemHsn: '40059190',
    hsnTax: 18,
    itemAlloy: 'NR 60 Shore',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Kg',
    itemStockMeasurement: 'Kg',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 1,
    isProduct: 'No',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Compound Store',
    departmentName: 'Mixing',
    moq: 100,
    leadTime: 3,
    batchQty: 250,
    minimumQty: 150,
    maximumQty: 2500,
    reorderLevelQty: 300,
    salesTolerance: 0,
    purchaseTolerance: 2,
    itemPurchaseLedger: 'Compound Purchase',
    itemSaleLedger: 'Inter Unit Transfer',
    itemServiceLedger: 'Mixing Charges',
    className: 'B',
    haveSelfLife: 'Yes',
    selfLifeDays: 90,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'Compound Scrap',
    mrpPrice: 215,
    drawingNo: 'SPEC-NR-060',
    revisionNo: 'R4',
    customerName: 'Internal',
    partName: 'Black Compound',
    partNo: 'CMP-BLK-60',
  },
  {
    id: 4,
    itemCategory: 'Raw Material',
    itemCode: 'ITM-RM-3004',
    itemName: 'Carbon Black N330',
    description: 'Reinforcing filler for rubber compound mixing',
    itemPrice: 118,
    remarks: 'Store in dry area',
    itemHsn: '28030010',
    hsnTax: 18,
    itemAlloy: 'N330',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Bag',
    itemStockMeasurement: 'Kg',
    convFactorRate: 25,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 25,
    isProduct: 'No',
    isNeedToInspect: 'No',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Raw Material Store',
    departmentName: 'Mixing',
    moq: 20,
    leadTime: 10,
    batchQty: 500,
    minimumQty: 250,
    maximumQty: 3000,
    reorderLevelQty: 600,
    salesTolerance: 0,
    purchaseTolerance: 3,
    itemPurchaseLedger: 'Raw Material Purchase',
    itemSaleLedger: 'Scrap Sales',
    itemServiceLedger: 'Handling Charges',
    className: 'B',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'RM Sweep Scrap',
    mrpPrice: 135,
    drawingNo: 'SPEC-CB-N330',
    revisionNo: 'R0',
    customerName: 'Internal',
    partName: 'Carbon Black',
    partNo: 'CB-N330',
  },
  {
    id: 5,
    itemCategory: 'Rubber Product',
    itemCode: 'ITM-RUB-1018',
    itemName: 'Silicone Bush',
    description: 'Red silicone bush for heat resistant assembly',
    itemPrice: 28.9,
    remarks: 'Customer approved sample',
    itemHsn: '40169990',
    hsnTax: 18,
    itemAlloy: 'Silicone 65 Shore',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 0.03,
    isProduct: 'Yes',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Finished Goods',
    departmentName: 'Moulding',
    moq: 2000,
    leadTime: 6,
    batchQty: 5000,
    minimumQty: 1000,
    maximumQty: 20000,
    reorderLevelQty: 2500,
    salesTolerance: 1,
    purchaseTolerance: 1,
    itemPurchaseLedger: 'Raw Material Purchase',
    itemSaleLedger: 'Finished Goods Sales',
    itemServiceLedger: 'Tooling Charges',
    className: 'A',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'Silicone Scrap',
    mrpPrice: 38,
    drawingNo: 'DRG-SIL-322',
    revisionNo: 'R3',
    customerName: 'Mahindra & Mahindra',
    partName: 'Silicone Bush',
    partNo: 'MM-SB-9031',
  },
  {
    id: 6,
    itemCategory: 'Packing Material',
    itemCode: 'ITM-PKG-4502',
    itemName: 'Printed Poly Bag 8x12',
    description: 'Transparent printed packing pouch for small rubber parts',
    itemPrice: 2.15,
    remarks: 'Use for export lots',
    itemHsn: '39232990',
    hsnTax: 18,
    itemAlloy: 'LDPE',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 0.01,
    isProduct: 'No',
    isNeedToInspect: 'No',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'No',
    warehouseName: 'Packing Store',
    departmentName: 'Dispatch',
    moq: 5000,
    leadTime: 8,
    batchQty: 10000,
    minimumQty: 2000,
    maximumQty: 50000,
    reorderLevelQty: 8000,
    salesTolerance: 0,
    purchaseTolerance: 5,
    itemPurchaseLedger: 'Packing Material Purchase',
    itemSaleLedger: 'Packing Recovery',
    itemServiceLedger: 'Printing Charges',
    className: 'C',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'No',
    scrapItem: 'Plastic Scrap',
    mrpPrice: 3,
    drawingNo: 'PKG-8X12',
    revisionNo: 'R1',
    customerName: 'Export Customers',
    partName: 'Poly Bag',
    partNo: 'PKG-PB-812',
  },
  {
    id: 7,
    itemCategory: 'Rubber Product',
    itemCode: 'ITM-RUB-1024',
    itemName: 'Viton O Ring 42mm',
    description: 'Chemical resistant Viton O ring for valve assembly',
    itemPrice: 19.6,
    remarks: 'Critical dimension',
    itemHsn: '40169320',
    hsnTax: 18,
    itemAlloy: 'FKM 75 Shore',
    isActive: 'Yes',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 0.01,
    isProduct: 'Yes',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'Yes',
    batchNumberApplicable: 'Yes',
    warehouseName: 'Finished Goods',
    departmentName: 'Finishing',
    moq: 3000,
    leadTime: 4,
    batchQty: 6000,
    minimumQty: 1500,
    maximumQty: 30000,
    reorderLevelQty: 5000,
    salesTolerance: 1,
    purchaseTolerance: 1,
    itemPurchaseLedger: 'Raw Material Purchase',
    itemSaleLedger: 'Finished Goods Sales',
    itemServiceLedger: 'Inspection Charges',
    className: 'A',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'Yes',
    scrapItem: 'Rubber Scrap',
    mrpPrice: 28,
    drawingNo: 'DRG-FKM-042',
    revisionNo: 'R2',
    customerName: 'Kirloskar Brothers',
    partName: 'O Ring',
    partNo: 'KB-OR-42',
  },
  {
    id: 8,
    itemCategory: 'Tooling',
    itemCode: 'ITM-TOL-5108',
    itemName: 'Mould Insert - Gasket Line',
    description: 'Replaceable mould insert for gasket cavity',
    itemPrice: 4850,
    remarks: 'Maintenance item',
    itemHsn: '84804900',
    hsnTax: 18,
    itemAlloy: 'EN31',
    isActive: 'No',
    itemPurchaseMeasurement: 'Nos',
    itemStockMeasurement: 'Nos',
    convFactorRate: 1,
    itemWeightMeasurement: 'Kg',
    itemStdWeight: 2.75,
    isProduct: 'No',
    isNeedToInspect: 'Yes',
    isQtyVerificationRequired: 'No',
    batchNumberApplicable: 'No',
    warehouseName: 'Tool Room',
    departmentName: 'Maintenance',
    moq: 1,
    leadTime: 20,
    batchQty: 1,
    minimumQty: 0,
    maximumQty: 5,
    reorderLevelQty: 1,
    salesTolerance: 0,
    purchaseTolerance: 0,
    itemPurchaseLedger: 'Tooling Purchase',
    itemSaleLedger: 'Tooling Recovery',
    itemServiceLedger: 'Maintenance Charges',
    className: 'C',
    haveSelfLife: 'No',
    selfLifeDays: 0,
    autoConsumptionIssueToDept: 'No',
    scrapItem: 'Metal Scrap',
    mrpPrice: 5200,
    drawingNo: 'TOL-GSK-INS',
    revisionNo: 'R5',
    customerName: 'Internal',
    partName: 'Mould Insert',
    partNo: 'MI-GL-08',
  },
];

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const getCategoryPrefix = (category) => {
  if (!category) return 'CU-';
  if (category === 'Customer') return 'CU-';
  if (category === 'Vendor') return 'VE-';
  if (category === 'Job Work') return 'JW-';
  if (category === 'Service') return 'SE-';
  return category.substring(0, 2).toUpperCase() + '-';
};

const formatPartyCode = (prefix, number) => `${prefix}${String(number).padStart(2, '0')}`;

const getNextPartyCodeFromItems = (items, category) => {
  const prefix = getCategoryPrefix(category);
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escapedPrefix}(\\d+)$`, 'i');
  
  const maxCodeNumber = items.reduce((max, party) => {
    const match = String(party.partyCode || '').match(regex);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return formatPartyCode(prefix, maxCodeNumber + 1);
};

const getNextTransporterCodeFromItems = (items) => {
  const maxCodeNumber = items.reduce((max, transporter) => {
    const match = String(transporter.transporterCode || '').match(/^TRN(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `TRN${String(maxCodeNumber + 1).padStart(4, '0')}`;
};

const initialPartyMasterItems = [
  {
    id: 1,
    partyName: 'Tata Motors Ltd',
    partyCode: 'CU-01',
    partyCategory: 'Customer',
    aliasName: 'TML',
    natureOfBusiness: 'Automotive OEM',
    address: 'Pimpri Industrial Area, Pune, Maharashtra',
    partyType: 'OEM',
    procurementPersonName: 'Amit Shah',
    procurementContactNo: '9876543210',
    procurementEmail: 'amit.procurement@tatamotors.example',
    plannerPersonName: 'Neha Patil',
    plannerContactNo: '9876543211',
    plannerEmail: 'neha.planning@tatamotors.example',
    accountsPersonName: 'Ravi Menon',
    accountsContactNo: '9876543212',
    accountsEmail: 'accounts@tatamotors.example',
    gstNo: '27AAACT2727Q1ZW',
    gstRegistrationDate: '2017-07-01',
    gstStateCode: '27',
    panDetails: 'AAACT2727Q',
    msmeCertificateNo: '',
    msmeEnterpriseType: 'Not Applicable',
    msmeCertificateValidity: '',
    paymentTerms: '45 Days',
    deliveryTerms: 'FOR Plant',
    transport: 'Party Approved Transport',
    detailsSharedVia: 'Email',
    partyEnrollmentDate: '2024-01-10',
  },
  {
    id: 2,
    partyName: 'Mahindra & Mahindra',
    partyCode: 'CU-02',
    partyCategory: 'Customer',
    aliasName: 'M&M',
    natureOfBusiness: 'Automotive Manufacturer',
    address: 'Chakan MIDC, Pune, Maharashtra',
    partyType: 'OEM',
    procurementPersonName: 'Kiran Desai',
    procurementContactNo: '9876543220',
    procurementEmail: 'kiran.purchase@mahindra.example',
    plannerPersonName: 'Sneha Rao',
    plannerContactNo: '9876543221',
    plannerEmail: 'sneha.plan@mahindra.example',
    accountsPersonName: 'Mehul Jain',
    accountsContactNo: '9876543222',
    accountsEmail: 'accounts@mahindra.example',
    gstNo: '27AAACM3025E1ZZ',
    gstRegistrationDate: '2017-07-01',
    gstStateCode: '27',
    panDetails: 'AAACM3025E',
    msmeCertificateNo: '',
    msmeEnterpriseType: 'Not Applicable',
    msmeCertificateValidity: '',
    paymentTerms: '30 Days',
    deliveryTerms: 'Ex Works',
    transport: 'Rubbertics Dispatch',
    detailsSharedVia: 'WhatsApp / Email',
    partyEnrollmentDate: '2024-02-05',
  },
  {
    id: 3,
    partyName: 'Sahil All Equipment',
    partyCode: 'CU-03',
    partyCategory: 'Customer',
    aliasName: 'Sahil Equipment',
    natureOfBusiness: 'Industrial Equipment Supplier',
    address: 'GIDC Estate, Vadodara, Gujarat',
    partyType: 'Dealer',
    procurementPersonName: 'Jignesh Patel',
    procurementContactNo: '9876543230',
    procurementEmail: 'purchase@sahil.example',
    plannerPersonName: 'Hiral Shah',
    plannerContactNo: '9876543231',
    plannerEmail: 'planner@sahil.example',
    accountsPersonName: 'Nilesh Parmar',
    accountsContactNo: '9876543232',
    accountsEmail: 'accounts@sahil.example',
    gstNo: '24ABCDE1234F1Z5',
    gstRegistrationDate: '2018-04-01',
    gstStateCode: '24',
    panDetails: 'ABCDE1234F',
    msmeCertificateNo: 'UDYAM-GJ-24-0012345',
    msmeEnterpriseType: 'Small',
    msmeCertificateValidity: '2027-03-31',
    paymentTerms: 'Against Delivery',
    deliveryTerms: 'Door Delivery',
    transport: 'Local Transport',
    detailsSharedVia: 'WhatsApp',
    partyEnrollmentDate: '2024-03-15',
  },
];

const initialPartyMasterLookups = {
  partyCategory: ['Customer', 'Vendor', 'Job Work', 'Service'],
  msmeEnterpriseType: ['Not Applicable', 'Micro', 'Small', 'Medium'],
};

const initialSaleOrderLookups = {
  soType: ['Sale', 'Production'],
  priority: ['Urgent', 'High', 'Medium', 'Normal', 'Low'],
  finalStatus: ['Dispatched', 'Partial Dispatch', 'Pending Dispatch', 'In Progress'],
};


const initialTransporterMasterItems = [
  {
    id: 1,
    transporterCode: 'TRN0001',
    transporterName: 'ABC Roadlines',
    trasnporterAdd: '',
    gstNo: '27ABCDE1234F1Z5',
    panNo: 'ABCDE1234F',
    transporterType: 'Road Transport',
    transporterId: '',
    contactPerson: 'Mr. Sharma',
    mobileNo: '9876543210',
    alternateMobileNo: '',
    email: 'abc@example.com',
    website: '',
    defaultPaymentTerms: '30 Days',
    defaultFreightType: 'Per Kg',
    status: 'Active',
    remarks: 'Preferred for local and Gujarat dispatch',
    createdBy: 'admin',
    createdDate: '2026-06-24',
  },
  {
    id: 2,
    transporterCode: 'TRN0002',
    transporterName: 'Fast Tempo Service',
    trasnporterAdd: '',
    gstNo: '',
    panNo: 'ABCDE1235G',
    transporterType: 'Tempo',
    transporterId: '',
    contactPerson: 'Mr. Patel',
    mobileNo: '9876543211',
    alternateMobileNo: '',
    email: 'fast@example.com',
    website: '',
    defaultPaymentTerms: 'Immediate',
    defaultFreightType: 'Fixed',
    status: 'Active',
    remarks: 'Local pickup and delivery',
    createdBy: 'admin',
    createdDate: '2026-06-24',
  },
];

const initialTransportMasterLookups = {
  transporterType: ['Road Transport', 'Courier', 'Tempo', 'Truck', 'Container', 'Local Transport'],
  defaultPaymentTerms: ['Immediate', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days'],
  defaultFreightType: ['Fixed', 'Per Kg', 'Per Ton', 'Per Km', 'Per Box', 'Per Bag'],
  status: ['Active', 'Inactive', 'Blacklisted', 'On Hold'],
};

const initialMachineMasterLookups = {
  rubberProcess: [
    'Compression Moulding',
    'Injection Moulding',
    'Extrusion',
    'Trimming',
    'Deflashing',
    'Finishing',
    'Packing',
    'Incoming Inspection',
    'Final Inspection',
    'Preventive Maintenance',
    'Breakdown Maintenance',
    'Tool Maintenance',
    'Calibration',
    'Dispatch',
  ],
  criticality: ['Critical', 'High', 'Medium', 'Low', 'Standby'],
};

let nextId = initialOrders.length + 1;
let nextWeeklyPlanId = initialWeeklyPlans.length + 1;
let nextItemMasterId = initialItemMasterItems.length + 1;
let nextPartyMasterId = initialPartyMasterItems.length + 1;
let nextTransporterMasterId = initialTransporterMasterItems.length + 1;

const initialMachineMasterItems = [
  {
    id: 1,
    machineCode: 'MAC0001',
    machineName: 'Hydraulic Press 100T',
    machineType: 'Hydraulic Press',
    machineMake: 'JRD',
    machineModel: 'HP-100',
    serialNo: 'SN-HP100-01',
    machineSize: '48 x 48 inch',
    capacity: 100,
    capacityUnit: 'Ton',
    departmentOfUse: 'Moulding',
    locationArea: 'Shop Floor A',
    rubberProcess: 'Moulding',
    powerHpKw: 15,
    installationDate: '2021-04-10',
    pmFrequency: 'Monthly',
    lastPmDate: '2026-06-01',
    nextPmDueDate: '2026-07-01',
    pmStatus: 'Due Soon',
    criticality: 'High',
    machineCondition: 'Good',
    responsiblePerson: 'Maintenance Head',
    status: 'Active',
    remarks: 'Used for compression moulding',
  },
  {
    id: 2,
    machineCode: 'MAC0002',
    machineName: 'Mixing Mill 18 x 48',
    machineType: 'Mixing Mill',
    machineMake: 'Bharaj',
    machineModel: 'MM-18X48',
    serialNo: 'SN-MM-02',
    machineSize: '18 x 48 inch',
    capacity: 75,
    capacityUnit: 'Kg Batch',
    departmentOfUse: 'Mixing',
    locationArea: 'Mixing Area',
    rubberProcess: 'Compounding',
    powerHpKw: 20,
    installationDate: '2020-08-15',
    pmFrequency: 'Quarterly',
    lastPmDate: '2026-05-15',
    nextPmDueDate: '2026-08-15',
    pmStatus: 'OK',
    criticality: 'High',
    machineCondition: 'Good',
    responsiblePerson: 'Production Supervisor',
    status: 'Active',
    remarks: 'Rubber compound mixing',
  },
  {
    id: 3,
    machineCode: 'MAC0003',
    machineName: 'Rubber Extruder 65mm',
    machineType: 'Extruder',
    machineMake: 'Santosh',
    machineModel: 'EXT-65',
    serialNo: 'SN-EXT-65',
    machineSize: '65 mm',
    capacity: 120,
    capacityUnit: 'Kg/Hr',
    departmentOfUse: 'Extrusion',
    locationArea: 'Extrusion Line',
    rubberProcess: 'Extrusion',
    powerHpKw: 12,
    installationDate: '2022-01-20',
    pmFrequency: 'Monthly',
    lastPmDate: '2026-06-10',
    nextPmDueDate: '2026-07-10',
    pmStatus: 'OK',
    criticality: 'Medium',
    machineCondition: 'Average',
    responsiblePerson: 'Engineer',
    status: 'Active',
    remarks: 'Profile extrusion',
  },
  {
    id: 4,
    machineCode: 'MAC0004',
    machineName: 'Air Compressor',
    machineType: 'Compressor',
    machineMake: 'ELGI',
    machineModel: 'EN-15',
    serialNo: 'SN-COMP-15',
    machineSize: '15 HP',
    capacity: 15,
    capacityUnit: 'HP',
    departmentOfUse: 'Utility',
    locationArea: 'Compressor Room',
    rubberProcess: 'General',
    powerHpKw: 15,
    installationDate: '2019-11-05',
    pmFrequency: 'Half Yearly',
    lastPmDate: '2026-02-01',
    nextPmDueDate: '2026-08-01',
    pmStatus: 'OK',
    criticality: 'Medium',
    machineCondition: 'Good',
    responsiblePerson: 'Utility Operator',
    status: 'Active',
    remarks: 'Air line utility',
  }
];

let nextMachineMasterId = initialMachineMasterItems.length + 1;

const initialEmployeeMasterLookups = {
  employeeType: ['Permanent', 'Contract', 'Temporary', 'Trainee'],
  gender: ['Male', 'Female', 'Other'],
  bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'],
  department: ['Production', 'Mixing', 'Quality Control', 'Maintenance', 'Dispatch', 'Admin'],
  designation: ['Operator', 'Helper', 'QC Inspector', 'Supervisor', 'Manager'],
  addressType: ['Current', 'Permanent'],
  salaryType: ['Monthly', 'Daily Wages'],
  paymentMode: ['Bank Transfer', 'Cash', 'Cheque'],
  skillCategory: ['Machine Operator', 'Helper', 'Supervisor', 'Technician'],
  skillLevel: ['Skilled', 'Semi Skilled', 'Unskilled', 'Highly Skilled'],
  machineTypeKnown: ['Hydraulic Press', 'Mixing Mill', 'Extruder', 'Kneader', 'None'],
};

const initialEmployeeMasterItems = [
  {
    id: 1,
    employeeCode: 'EMP0001',
    employeeName: 'Rahul Kumar',
    employeeType: 'Permanent',
    gender: 'Male',
    dob: '1990-05-15',
    mobileNo: '9876543210',
    alternateMobile: '',
    email: 'rahul.k@example.com',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    department: 'Production',
    designation: 'Operator',
    addressType: 'Current',
    addressLine1: 'Plot 45, MIDC',
    addressLine2: 'Phase 1',
    city: 'Vasai',
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401208',
    country: 'India',
    isCurrentAddress: true,
    addressRemarks: '',
    panNo: 'ABCDE1234F',
    aadhaarNo: '123456789012',
    uanNo: '100000000000',
    pfNo: 'MH/12345/000',
    esiNo: '31000000000000000',
    professionalTaxNo: 'PT12345',
    pfApplicable: true,
    esiApplicable: true,
    statutoryRemarks: '',
    
    // Salary
    salaryType: 'Monthly',
    basicSalary: 18000,
    hra: 5000,
    conveyance: 1600,
    otherAllowance: 1000,
    grossSalary: 25600,
    pfDeduction: 1800,
    esiDeduction: 192,
    otherDeduction: 0,
    netSalary: 23608,
    effectiveFrom: '2026-01-01',
    salaryRemarks: '',

    // Bank
    bankName: 'HDFC Bank',
    accountNo: '123456789012',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'Rahul Kumar',
    paymentMode: 'Bank Transfer',
    upiId: '',
    bankRemarks: '',

    // Skill
    skillCategory: 'Machine Operator',
    skillLevel: 'Skilled',
    machineTypeKnown: 'Hydraulic Press',
    canWorkOnCriticalMachine: true,
    trainingRequired: false,
    lastTrainingDate: '2025-09-01',
    nextTrainingDue: '2026-09-01',
    skillRemarks: '',
  }
];

let nextEmployeeMasterId = initialEmployeeMasterItems.length + 1;

const initialEnquiryLookups = {
  enquirySource: ['Email', 'Phone', 'Website', 'Referral', 'Exhibition'],
  salesPerson: ['Admin', 'Sales Executive 1', 'Sales Manager'],
};

const initialEnquiryItems = [];
let nextEnquiryId = 1;

export const useERPStore = create((set, get) => ({
  // Data
  orders: initialOrders,
  weeklyPlans: initialWeeklyPlans,
  itemMasterItems: initialItemMasterItems,
  partyMasterItems: initialPartyMasterItems,
  transporterMasterItems: initialTransporterMasterItems,
  machineMasterItems: initialMachineMasterItems,
  partyMasterLookups: initialPartyMasterLookups,
  transportMasterLookups: initialTransportMasterLookups,
  machineMasterLookups: initialMachineMasterLookups,
  saleOrderLookups: initialSaleOrderLookups,
  employeeMasterItems: initialEmployeeMasterItems,
  hsnSacMasterItems: [
    {
      id: 'hsn-1',
      hsnCode: '40169390',
      description: 'Other articles of vulcanised rubber other than hard rubber',
      gstPercentage: '18',
      effectiveFrom: '2023-01-01',
      effectiveTo: '2099-12-31',
      createdAt: new Date().toISOString()
    }
  ],
  employeeMasterLookups: initialEmployeeMasterLookups,
  enquiryItems: initialEnquiryItems,
  enquiryLookups: initialEnquiryLookups,
  partyCategories: ['Customer', 'Vendor', 'Job Work', 'Service'],

  // UI State
  searchQuery: '',
  filterStatus: 'All',
  filterPriority: 'All',
  filterPoType: 'All',
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'date',
  sortDirection: 'desc',
  selectedOrders: [],
  itemMasterSearchQuery: '',
  itemMasterCategoryFilter: 'All',
  itemMasterStatusFilter: 'All',
  itemMasterCurrentPage: 1,
  itemMasterItemsPerPage: 10,
  partyMasterSearchQuery: '',
  partyMasterTypeFilter: 'All',
  partyMasterMsmeFilter: 'All',
  partyMasterCurrentPage: 1,
  partyMasterItemsPerPage: 10,
  transporterMasterSearchQuery: '',
  transporterMasterTypeFilter: 'All',
  transporterMasterStatusFilter: 'All',
  transporterMasterCurrentPage: 1,
  transporterMasterItemsPerPage: 10,
  machineMasterSearchQuery: '',
  hsnSacMasterSearchQuery: '',
  hsnSacMasterCurrentPage: 1,
  hsnSacMasterItemsPerPage: 10,
  machineMasterDepartmentFilter: 'All',
  machineMasterStatusFilter: 'All',
  machineMasterCurrentPage: 1,
  machineMasterItemsPerPage: 10,
  employeeMasterSearchQuery: '',
  employeeMasterDepartmentFilter: 'All',
  employeeMasterCurrentPage: 1,
  employeeMasterItemsPerPage: 10,
  enquirySearchQuery: '',
  enquiryCurrentPage: 1,
  enquiryItemsPerPage: 10,

  // Modal State
  isModalOpen: false,
  modalMode: 'view', // 'view' | 'edit' | 'add'
  selectedOrder: null,
  isDeleteConfirmOpen: false,
  orderToDelete: null,

  // Weekly Plan Modal State
  isWeeklyModalOpen: false,
  weeklyModalMode: 'view',
  selectedWeeklyPlan: null,
  isWeeklyDeleteConfirmOpen: false,
  weeklyPlanToDelete: null,

  // Notifications
  notifications: [],

  // --- ACTIONS ---

  // Notification helper
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 3000);
  },

  // CRUD Operations
  addOrder: (orderData) => {
    const newOrder = {
      ...orderData,
      id: nextId++,
      balanceQty: Number(orderData.orderQty) - Number(orderData.dispatchQty),
      date: orderData.date || new Date().toISOString().split('T')[0],
    };
    set(state => ({ orders: [newOrder, ...state.orders] }));
    get().addNotification('Sale order created successfully!', 'success');
    get().closeModal();
  },

  updateOrder: (id, orderData) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === id
          ? {
            ...o,
            ...orderData,
            balanceQty: Number(orderData.orderQty) - Number(orderData.dispatchQty),
          }
          : o
      ),
    }));
    get().addNotification('Order updated successfully!', 'success');
    get().closeModal();
  },

  deleteOrder: (id) => {
    set(state => ({
      orders: state.orders.filter(o => o.id !== id),
      selectedOrders: state.selectedOrders.filter(sid => sid !== id),
    }));
    get().addNotification('Order deleted successfully!', 'error');
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  addWeeklyPlan: (planData) => {
    const newPlan = {
      ...planData,
      id: nextWeeklyPlanId++,
    };
    set(state => ({ weeklyPlans: [newPlan, ...state.weeklyPlans] }));
    get().addNotification('Weekly plan created successfully!', 'success');
    get().closeWeeklyModal();
  },

  updateWeeklyPlan: (id, planData) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.map(p =>
        p.id === id ? { ...p, ...planData } : p
      ),
    }));
    get().addNotification('Weekly plan updated successfully!', 'success');
    get().closeWeeklyModal();
  },

  deleteWeeklyPlan: (id) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.filter(p => p.id !== id),
    }));
    get().addNotification('Weekly plan deleted successfully!', 'error');
    set({ isWeeklyDeleteConfirmOpen: false, weeklyPlanToDelete: null });
  },

  addItemMaster: (itemData) => {
    const newItem = {
      ...itemData,
      id: nextItemMasterId++,
      isActive: itemData.isActive || 'Yes',
    };
    set(state => ({
      itemMasterItems: [newItem, ...state.itemMasterItems],
      itemMasterCurrentPage: 1,
    }));
    get().addNotification('Item master created successfully!', 'success');
  },

  updateItemMaster: (id, itemData) => {
    set(state => ({
      itemMasterItems: state.itemMasterItems.map(item =>
        item.id === id ? { ...item, ...itemData } : item
      ),
    }));
    get().addNotification('Item master updated successfully!', 'success');
  },

  deleteItemMaster: (id) => {
    set(state => ({
      itemMasterItems: state.itemMasterItems.filter(item => item.id !== id),
    }));
    get().addNotification('Item master deleted successfully!', 'error');
  },

  addMachineMaster: (machineData) => {
    const newMachine = {
      ...machineData,
      id: nextMachineMasterId++,
      status: machineData.status || 'Active',
    };
    set(state => ({
      machineMasterItems: [newMachine, ...state.machineMasterItems],
      machineMasterCurrentPage: 1,
    }));
    get().addNotification('Machine master created successfully!', 'success');
  },

  updateMachineMaster: (id, machineData) => {
    set(state => ({
      machineMasterItems: state.machineMasterItems.map(machine =>
        machine.id === id ? { ...machine, ...machineData } : machine
      ),
    }));
    get().addNotification('Machine master updated successfully!', 'success');
  },

  deleteMachineMaster: (id) => {
    set(state => ({
      machineMasterItems: state.machineMasterItems.filter(machine => machine.id !== id),
    }));
    get().addNotification('Machine master deleted successfully!', 'error');
  },

  getNextPartyCode: (category) => getNextPartyCodeFromItems(get().partyMasterItems, category),

  addPartyCategory: (category) => {
    get().addPartyMasterLookupOption('partyCategory', category);
  },

  addPartyMasterLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;

    let wasAdded = false;
    set(state => {
      const currentOptions = state.partyMasterLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;

      return {
        partyMasterLookups: {
          ...state.partyMasterLookups,
          [fieldKey]: [...currentOptions, cleaned],
        },
        ...(fieldKey === 'partyCategory' ? { partyCategories: [...state.partyCategories, cleaned] } : {}),
      };
    });
    if (wasAdded) get().addNotification(`${cleaned} added to dropdown`, 'success');
    return wasAdded;
  },

  renamePartyMasterLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;

    let renamed = false;
    set(state => {
      const currentOptions = state.partyMasterLookups[fieldKey] || [];
      const duplicate = currentOptions.some(option =>
        option.toLowerCase() === cleaned.toLowerCase() && option !== oldValue
      );
      if (duplicate) return state;

      const renamedParties = state.partyMasterItems.map(party => {
        if (party[fieldKey] !== oldValue) return party;
        const nextParty = { ...party, [fieldKey]: cleaned };
        if (fieldKey === 'partyCategory') {
          nextParty.partyCode = getNextPartyCodeFromItems(
            state.partyMasterItems.filter(item => item.id !== party.id),
            cleaned
          );
        }
        return nextParty;
      });

      renamed = true;
      return {
        partyMasterLookups: {
          ...state.partyMasterLookups,
          [fieldKey]: currentOptions.map(option => option === oldValue ? cleaned : option),
        },
        ...(fieldKey === 'partyCategory'
          ? { partyCategories: state.partyCategories.map(option => option === oldValue ? cleaned : option) }
          : {}),
        partyMasterItems: renamedParties,
      };
    });
    if (renamed) get().addNotification(`${oldValue} renamed to ${cleaned}`, 'success');
    return renamed;
  },

  deletePartyMasterLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().partyMasterItems.filter(party => party[fieldKey] === value).length;

    if (usedCount > 0) {
      get().addNotification(`Cannot delete ${value}; it is used in ${usedCount} part${usedCount > 1 ? 'ies' : 'y'}.`, 'error');
      return false;
    }

    set(state => ({
      partyMasterLookups: {
        ...state.partyMasterLookups,
        [fieldKey]: (state.partyMasterLookups[fieldKey] || []).filter(option => option !== value),
      },
      ...(fieldKey === 'partyCategory'
        ? { partyCategories: state.partyCategories.filter(option => option !== value) }
        : {}),
    }));
    get().addNotification(`${value} deleted from dropdown`, 'error');
    return true;
  },

  addSaleOrderLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;

    let wasAdded = false;
    set(state => {
      const currentOptions = state.saleOrderLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;

      return {
        saleOrderLookups: {
          ...state.saleOrderLookups,
          [fieldKey]: [...currentOptions, cleaned],
        },
      };
    });
    if (wasAdded) get().addNotification(`${cleaned} added to dropdown`, 'success');
    return wasAdded;
  },

  renameSaleOrderLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;

    let renamed = false;
    set(state => {
      const currentOptions = state.saleOrderLookups[fieldKey] || [];
      const duplicate = currentOptions.some(option =>
        option.toLowerCase() === cleaned.toLowerCase() && option !== oldValue
      );
      if (duplicate) return state;

      const renamedOrders = state.orders.map(order => {
        if (order[fieldKey] !== oldValue) return order;
        return { ...order, [fieldKey]: cleaned };
      });

      renamed = true;
      return {
        saleOrderLookups: {
          ...state.saleOrderLookups,
          [fieldKey]: currentOptions.map(option => option === oldValue ? cleaned : option),
        },
        orders: renamedOrders,
      };
    });
    if (renamed) get().addNotification(`${oldValue} renamed to ${cleaned}`, 'success');
    return renamed;
  },

  deleteSaleOrderLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().orders.filter(order => order[fieldKey] === value).length;

    if (usedCount > 0) {
      get().addNotification(`Cannot delete ${value}; it is used in ${usedCount} order${usedCount > 1 ? 's' : ''}.`, 'error');
      return false;
    }

    set(state => ({
      saleOrderLookups: {
        ...state.saleOrderLookups,
        [fieldKey]: (state.saleOrderLookups[fieldKey] || []).filter(option => option !== value),
      },
    }));
    get().addNotification(`${value} deleted from dropdown`, 'error');
    return true;
  },

  addMachineMasterLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    let wasAdded = false;
    set(state => {
      const currentOptions = state.machineMasterLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;
      return { machineMasterLookups: { ...state.machineMasterLookups, [fieldKey]: [...currentOptions, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added to ${fieldKey}`, 'success');
    return wasAdded;
  },

  renameMachineMasterLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    let renamed = false;
    set(state => {
      const currentOptions = state.machineMasterLookups[fieldKey] || [];
      const duplicate = currentOptions.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue);
      if (duplicate) return state;
      renamed = true;
      return {
        machineMasterLookups: {
          ...state.machineMasterLookups,
          [fieldKey]: currentOptions.map(o => o === oldValue ? cleaned : o),
        },
        machineMasterItems: state.machineMasterItems.map(m =>
          m[fieldKey] === oldValue ? { ...m, [fieldKey]: cleaned } : m
        ),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteMachineMasterLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().machineMasterItems.filter(m => m[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} machine(s).`, 'error');
      return false;
    }
    set(state => ({
      machineMasterLookups: {
        ...state.machineMasterLookups,
        [fieldKey]: (state.machineMasterLookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted from ${fieldKey}`, 'error');
    return true;
  },

  addPartyMaster: (partyData) => {
    const partyCode = partyData.partyCode || getNextPartyCodeFromItems(get().partyMasterItems, partyData.partyCategory);
    const newParty = {
      ...partyData,
      id: nextPartyMasterId++,
      partyCode,
      partyType: partyData.partyType || 'Domestic',
      msmeEnterpriseType: partyData.msmeEnterpriseType || 'Not Applicable',
      detailsSharedVia: partyData.detailsSharedVia || 'WhatsApp / Email',
      partyEnrollmentDate: partyData.partyEnrollmentDate || todayIsoDate(),
    };
    set(state => ({
      partyMasterItems: [newParty, ...state.partyMasterItems],
      partyMasterCurrentPage: 1,
    }));
    get().addNotification(`Party ${partyCode} created successfully!`, 'success');
  },

  updatePartyMaster: (id, partyData) => {
    set(state => ({
      partyMasterItems: state.partyMasterItems.map(party =>
        party.id === id
          ? {
            ...party,
            ...partyData,
            partyCode: partyData.partyCode || party.partyCode,
          }
          : party
      ),
    }));
    get().addNotification('Party master updated successfully!', 'success');
  },

  deletePartyMaster: (id) => {
    set(state => ({
      partyMasterItems: state.partyMasterItems.filter(party => party.id !== id),
    }));
    get().addNotification('Party master deleted successfully!', 'error');
  },

  addHsnSacMaster: (data) => {
    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      hsnSacMasterItems: [newItem, ...state.hsnSacMasterItems],
      hsnSacMasterCurrentPage: 1,
    }));
    get().addNotification('HSN/SAC master created successfully!', 'success');
  },

  updateHsnSacMaster: (id, data) => {
    set(state => ({
      hsnSacMasterItems: state.hsnSacMasterItems.map(item =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
    get().addNotification('HSN/SAC master updated successfully!', 'success');
  },

  deleteHsnSacMaster: (id) => {
    set(state => ({
      hsnSacMasterItems: state.hsnSacMasterItems.filter(item => item.id !== id),
    }));
    get().addNotification('HSN/SAC master deleted successfully!', 'error');
  },

  getNextTransporterCode: () => getNextTransporterCodeFromItems(get().transporterMasterItems),

  addTransporterMaster: (transporterData) => {
    const transporterCode = transporterData.transporterCode || getNextTransporterCodeFromItems(get().transporterMasterItems);
    const newTransporter = {
      ...transporterData,
      id: nextTransporterMasterId++,
      transporterCode,
      status: transporterData.status || 'Active',
      createdDate: transporterData.createdDate || todayIsoDate(),
    };
    set(state => ({
      transporterMasterItems: [newTransporter, ...state.transporterMasterItems],
      transporterMasterCurrentPage: 1,
    }));
    get().addNotification(`Transporter ${transporterCode} created successfully!`, 'success');
  },

  updateTransporterMaster: (id, transporterData) => {
    set(state => ({
      transporterMasterItems: state.transporterMasterItems.map(transporter =>
        transporter.id === id
          ? {
            ...transporter,
            ...transporterData,
            transporterCode: transporterData.transporterCode || transporter.transporterCode,
          }
          : transporter
      ),
    }));
    get().addNotification('Transport master updated successfully!', 'success');
  },

  deleteTransporterMaster: (id) => {
    set(state => ({
      transporterMasterItems: state.transporterMasterItems.filter(transporter => transporter.id !== id),
    }));
    get().addNotification('Transport master deleted successfully!', 'error');
  },

  addTransportMasterLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;

    let wasAdded = false;
    set(state => {
      const currentOptions = state.transportMasterLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;
      return {
        transportMasterLookups: {
          ...state.transportMasterLookups,
          [fieldKey]: [...currentOptions, cleaned],
        },
      };
    });
    if (wasAdded) get().addNotification(`${cleaned} added to dropdown`, 'success');
    return wasAdded;
  },

  renameTransportMasterLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;

    let renamed = false;
    set(state => {
      const currentOptions = state.transportMasterLookups[fieldKey] || [];
      const duplicate = currentOptions.some(option =>
        option.toLowerCase() === cleaned.toLowerCase() && option !== oldValue
      );
      if (duplicate) return state;

      renamed = true;
      return {
        transportMasterLookups: {
          ...state.transportMasterLookups,
          [fieldKey]: currentOptions.map(option => option === oldValue ? cleaned : option),
        },
        transporterMasterItems: state.transporterMasterItems.map(transporter =>
          transporter[fieldKey] === oldValue ? { ...transporter, [fieldKey]: cleaned } : transporter
        ),
      };
    });
    if (renamed) get().addNotification(`${oldValue} renamed to ${cleaned}`, 'success');
    return renamed;
  },

  deleteTransportMasterLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().transporterMasterItems.filter(transporter => transporter[fieldKey] === value).length;

    if (usedCount > 0) {
      get().addNotification(`Cannot delete ${value}; it is used in ${usedCount} transporter${usedCount > 1 ? 's' : ''}.`, 'error');
      return false;
    }

    set(state => ({
      transportMasterLookups: {
        ...state.transportMasterLookups,
        [fieldKey]: (state.transportMasterLookups[fieldKey] || []).filter(option => option !== value),
      },
    }));
    get().addNotification(`${value} deleted from dropdown`, 'error');
    return true;
  },

  // Weekly Modal controls
  openWeeklyModal: (mode, plan = null) => {
    set({ isWeeklyModalOpen: true, weeklyModalMode: mode, selectedWeeklyPlan: plan });
  },
  closeWeeklyModal: () => {
    set({ isWeeklyModalOpen: false, selectedWeeklyPlan: null });
  },
  openWeeklyDeleteConfirm: (plan) => {
    set({ isWeeklyDeleteConfirmOpen: true, weeklyPlanToDelete: plan });
  },
  closeWeeklyDeleteConfirm: () => {
    set({ isWeeklyDeleteConfirmOpen: false, weeklyPlanToDelete: null });
  },

  deleteSelectedOrders: () => {
    const { selectedOrders } = get();
    set(state => ({
      orders: state.orders.filter(o => !selectedOrders.includes(o.id)),
      selectedOrders: [],
    }));
    get().addNotification(`${selectedOrders.length} orders deleted!`, 'error');
  },

  // Modal controls
  openModal: (mode, order = null) => {
    set({ isModalOpen: true, modalMode: mode, selectedOrder: order });
  },
  closeModal: () => {
    set({ isModalOpen: false, selectedOrder: null });
  },
  openDeleteConfirm: (order) => {
    set({ isDeleteConfirmOpen: true, orderToDelete: order });
  },
  closeDeleteConfirm: () => {
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  // Selection
  toggleSelectOrder: (id) => {
    set(state => ({
      selectedOrders: state.selectedOrders.includes(id)
        ? state.selectedOrders.filter(sid => sid !== id)
        : [...state.selectedOrders, id],
    }));
  },
  toggleSelectAll: (visibleIds) => {
    const { selectedOrders } = get();
    const allSelected = visibleIds.every(id => selectedOrders.includes(id));
    set({
      selectedOrders: allSelected ? [] : visibleIds,
    });
  },
  clearSelection: () => set({ selectedOrders: [] }),

  // Filters & Search
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setFilterStatus: (s) => set({ filterStatus: s, currentPage: 1 }),
  setFilterPriority: (p) => set({ filterPriority: p, currentPage: 1 }),
  setFilterPoType: (t) => set({ filterPoType: t, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),
  setItemMasterSearchQuery: (q) => set({ itemMasterSearchQuery: q, itemMasterCurrentPage: 1 }),
  setItemMasterCategoryFilter: (category) => set({ itemMasterCategoryFilter: category, itemMasterCurrentPage: 1 }),
  setItemMasterStatusFilter: (status) => set({ itemMasterStatusFilter: status, itemMasterCurrentPage: 1 }),
  setItemMasterCurrentPage: (page) => set({ itemMasterCurrentPage: page }),
  setItemMasterItemsPerPage: (count) => set({ itemMasterItemsPerPage: count, itemMasterCurrentPage: 1 }),
  setPartyMasterSearchQuery: (query) => set({ partyMasterSearchQuery: query, partyMasterCurrentPage: 1 }),
  setPartyMasterTypeFilter: (type) => set({ partyMasterTypeFilter: type, partyMasterCurrentPage: 1 }),
  setPartyMasterMsmeFilter: (type) => set({ partyMasterMsmeFilter: type, partyMasterCurrentPage: 1 }),
  setPartyMasterCurrentPage: (page) => set({ partyMasterCurrentPage: page }),
  setPartyMasterItemsPerPage: (count) => set({ partyMasterItemsPerPage: count, partyMasterCurrentPage: 1 }),
  setHsnSacMasterSearchQuery: (query) => set({ hsnSacMasterSearchQuery: query, hsnSacMasterCurrentPage: 1 }),
  setHsnSacMasterCurrentPage: (page) => set({ hsnSacMasterCurrentPage: page }),
  setHsnSacMasterItemsPerPage: (count) => set({ hsnSacMasterItemsPerPage: count, hsnSacMasterCurrentPage: 1 }),
  setTransporterMasterSearchQuery: (query) => set({ transporterMasterSearchQuery: query, transporterMasterCurrentPage: 1 }),
  setTransporterMasterTypeFilter: (type) => set({ transporterMasterTypeFilter: type, transporterMasterCurrentPage: 1 }),
  setTransporterMasterStatusFilter: (status) => set({ transporterMasterStatusFilter: status, transporterMasterCurrentPage: 1 }),
  setTransporterMasterCurrentPage: (page) => set({ transporterMasterCurrentPage: page }),
  setTransporterMasterItemsPerPage: (count) => set({ transporterMasterItemsPerPage: count, transporterMasterCurrentPage: 1 }),
  setSortField: (field) => {
    set(state => ({
      sortField: field,
      sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  },

  // Computed selectors (getters)
  getFilteredOrders: () => {
    const { orders, searchQuery, filterStatus, filterPriority, filterPoType, sortField, sortDirection } = get();

    let filtered = orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        o.poNo.toLowerCase().includes(q) ||
        o.partyName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.partNo.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || o.finalStatus === filterStatus;
      const matchPriority = filterPriority === 'All' || o.priority === filterPriority;
      const matchPoType = filterPoType === 'All' || o.poType === filterPoType;
      return matchSearch && matchStatus && matchPriority && matchPoType;
    });

    filtered.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },

  getStats: () => {
    const { orders } = get();
    return {
      total: orders.length,
      pending: orders.filter(o => o.finalStatus === 'Pending Dispatch').length,
      dispatched: orders.filter(o => o.finalStatus === 'Dispatched').length,
      partial: orders.filter(o => o.finalStatus === 'Partial Dispatch').length,
      urgent: orders.filter(o => o.priority === 'Urgent' || o.priority === 'High').length,
      totalOrderQty: orders.reduce((s, o) => s + Number(o.orderQty), 0),
      totalDispatchQty: orders.reduce((s, o) => s + Number(o.dispatchQty), 0),
    };
  },

  getFilteredItemMasterItems: () => {
    const {
      itemMasterItems,
      itemMasterSearchQuery,
      itemMasterCategoryFilter,
      itemMasterStatusFilter,
    } = get();

    const query = itemMasterSearchQuery.toLowerCase().trim();

    return itemMasterItems.filter(item => {
      const matchesSearch =
        !query ||
        Object.values(item)
          .some(value => String(value || '').toLowerCase().includes(query));
      const matchesCategory = itemMasterCategoryFilter === 'All' || item.itemCategory === itemMasterCategoryFilter;
      const matchesStatus = itemMasterStatusFilter === 'All' || item.isActive === itemMasterStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  },

  getItemMasterStats: () => {
    const { itemMasterItems } = get();
    const categories = new Set(itemMasterItems.map(item => item.itemCategory).filter(Boolean));
    const active = itemMasterItems.filter(item => item.isActive === 'Yes').length;
    const products = itemMasterItems.filter(item => item.isProduct === 'Yes').length;
    const avgPrice = itemMasterItems.length
      ? itemMasterItems.reduce((sum, item) => sum + Number(item.itemPrice || 0), 0) / itemMasterItems.length
      : 0;

    return {
      total: itemMasterItems.length,
      active,
      products,
      categories: categories.size,
      avgPrice,
    };
  },

  getFilteredPartyMasterItems: () => {
    const {
      partyMasterItems,
      partyMasterSearchQuery,
      partyMasterTypeFilter,
      partyMasterMsmeFilter,
    } = get();

    const query = partyMasterSearchQuery.toLowerCase().trim();

    return partyMasterItems.filter(party => {
      const matchesSearch =
        !query ||
        Object.values(party)
          .some(value => String(value || '').toLowerCase().includes(query));
      const matchesType = partyMasterTypeFilter === 'All' || party.partyType === partyMasterTypeFilter;
      const matchesMsme = partyMasterMsmeFilter === 'All' || party.msmeEnterpriseType === partyMasterMsmeFilter;
      return matchesSearch && matchesType && matchesMsme;
    });
  },

  getPartyMasterStats: () => {
    const { partyMasterItems } = get();
    const types = new Set(partyMasterItems.map(party => party.partyType).filter(Boolean));
    const msme = partyMasterItems.filter(party =>
      party.msmeEnterpriseType && party.msmeEnterpriseType !== 'Not Applicable'
    ).length;
    const enrolledThisMonth = partyMasterItems.filter(party => {
      if (!party.partyEnrollmentDate) return false;
      const date = new Date(party.partyEnrollmentDate);
      const today = new Date();
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    return {
      total: partyMasterItems.length,
      types: types.size,
      msme,
      enrolledThisMonth,
    };
  },

  getFilteredHsnSacMasterItems: () => {
    const { hsnSacMasterItems, hsnSacMasterSearchQuery } = get();
    const query = hsnSacMasterSearchQuery.toLowerCase().trim();
    return hsnSacMasterItems.filter(item => {
      if (!query) return true;
      return Object.values(item).some(val => String(val || '').toLowerCase().includes(query));
    });
  },

  getHsnSacMasterStats: () => {
    const { hsnSacMasterItems } = get();
    return {
      total: hsnSacMasterItems.length,
    };
  },

  getFilteredTransporterMasterItems: () => {
    const {
      transporterMasterItems,
      transporterMasterSearchQuery,
      transporterMasterTypeFilter,
      transporterMasterStatusFilter,
    } = get();

    const query = transporterMasterSearchQuery.toLowerCase().trim();

    return transporterMasterItems.filter(transporter => {
      const matchesSearch =
        !query ||
        Object.values(transporter)
          .some(value => String(value || '').toLowerCase().includes(query));
      const matchesType = transporterMasterTypeFilter === 'All' || transporter.transporterType === transporterMasterTypeFilter;
      const matchesStatus = transporterMasterStatusFilter === 'All' || transporter.status === transporterMasterStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  },

  getTransporterMasterStats: () => {
    const { transporterMasterItems } = get();
    const active = transporterMasterItems.filter(transporter => transporter.status === 'Active').length;
    const inactiveOrHold = transporterMasterItems.filter(transporter =>
      transporter.status === 'Inactive' || transporter.status === 'On Hold'
    ).length;
    const blacklisted = transporterMasterItems.filter(transporter => transporter.status === 'Blacklisted').length;

    return {
      total: transporterMasterItems.length,
      active,
      inactiveOrHold,
      blacklisted,
    };
  },

  getFilteredMachineMasterItems: () => {
    const {
      machineMasterItems,
      machineMasterSearchQuery,
      machineMasterDepartmentFilter,
      machineMasterStatusFilter,
    } = get();

    const query = machineMasterSearchQuery.toLowerCase().trim();

    return machineMasterItems.filter(machine => {
      const matchesSearch =
        !query ||
        Object.values(machine)
          .some(value => String(value || '').toLowerCase().includes(query));
      const matchesDept = machineMasterDepartmentFilter === 'All' || machine.departmentOfUse === machineMasterDepartmentFilter;
      const matchesStatus = machineMasterStatusFilter === 'All' || machine.status === machineMasterStatusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  },

  getMachineMasterStats: () => {
    const { machineMasterItems } = get();
    const active = machineMasterItems.filter(m => m.status === 'Active').length;
    const inactive = machineMasterItems.filter(m => m.status === 'Inactive').length;
    
    return {
      total: machineMasterItems.length,
      active,
      inactive,
    };
  },

  getFilteredEmployeeMasterItems: () => {
    const {
      employeeMasterItems,
      employeeMasterSearchQuery,
      employeeMasterDepartmentFilter,
    } = get();

    const query = employeeMasterSearchQuery.toLowerCase().trim();

    return employeeMasterItems.filter(emp => {
      const matchesSearch =
        !query ||
        Object.values(emp)
          .some(value => String(value || '').toLowerCase().includes(query));
      const matchesDept = employeeMasterDepartmentFilter === 'All' || emp.department === employeeMasterDepartmentFilter;
      return matchesSearch && matchesDept;
    });
  },

  getEmployeeMasterStats: () => {
    const { employeeMasterItems } = get();
    const departments = new Set(employeeMasterItems.map(emp => emp.department).filter(Boolean));
    const permanent = employeeMasterItems.filter(emp => emp.employeeType === 'Permanent').length;
    const contract = employeeMasterItems.filter(emp => emp.employeeType === 'Contract').length;

    return {
      total: employeeMasterItems.length,
      departments: departments.size,
      permanent,
      contract,
    };
  },

  // Employee Master Actions
  addEmployeeMaster: (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: nextEmployeeMasterId++,
    };
    set(state => ({
      employeeMasterItems: [newEmployee, ...state.employeeMasterItems],
      employeeMasterCurrentPage: 1,
    }));
    get().addNotification('Employee created successfully!', 'success');
  },

  updateEmployeeMaster: (id, employeeData) => {
    set(state => ({
      employeeMasterItems: state.employeeMasterItems.map(emp =>
        emp.id === id ? { ...emp, ...employeeData } : emp
      ),
    }));
    get().addNotification('Employee updated successfully!', 'success');
  },

  deleteEmployeeMaster: (id) => {
    set(state => ({
      employeeMasterItems: state.employeeMasterItems.filter(emp => emp.id !== id),
    }));
    get().addNotification('Employee deleted successfully!', 'error');
  },

  addEmployeeMasterLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    let wasAdded = false;
    set(state => {
      const currentOptions = state.employeeMasterLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;
      return { employeeMasterLookups: { ...state.employeeMasterLookups, [fieldKey]: [...currentOptions, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added to dropdown`, 'success');
    return wasAdded;
  },

  renameEmployeeMasterLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    let renamed = false;
    set(state => {
      const currentOptions = state.employeeMasterLookups[fieldKey] || [];
      const duplicate = currentOptions.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue);
      if (duplicate) return state;
      renamed = true;
      return {
        employeeMasterLookups: {
          ...state.employeeMasterLookups,
          [fieldKey]: currentOptions.map(o => o === oldValue ? cleaned : o),
        },
        employeeMasterItems: state.employeeMasterItems.map(emp =>
          emp[fieldKey] === oldValue ? { ...emp, [fieldKey]: cleaned } : emp
        ),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteEmployeeMasterLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().employeeMasterItems.filter(emp => emp[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} employee(s).`, 'error');
      return false;
    }
    set(state => ({
      employeeMasterLookups: {
        ...state.employeeMasterLookups,
        [fieldKey]: (state.employeeMasterLookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted from dropdown`, 'error');
    return true;
  },

  // Enquiry Actions
  addEnquiry: (enquiryData) => {
    set(state => ({
      enquiryItems: [{ ...enquiryData, id: nextEnquiryId++ }, ...state.enquiryItems],
    }));
    get().addNotification('Enquiry created successfully!', 'success');
  },

  updateEnquiry: (id, enquiryData) => {
    set(state => ({
      enquiryItems: state.enquiryItems.map(item =>
        item.id === id ? { ...item, ...enquiryData } : item
      ),
    }));
    get().addNotification('Enquiry updated successfully!', 'success');
  },

  deleteEnquiry: (id) => {
    set(state => ({
      enquiryItems: state.enquiryItems.filter(item => item.id !== id),
    }));
    get().addNotification('Enquiry deleted successfully!', 'error');
  },

  addEnquiryLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    let wasAdded = false;
    set(state => {
      const currentOptions = state.enquiryLookups[fieldKey] || [];
      const exists = currentOptions.some(option => option.toLowerCase() === cleaned.toLowerCase());
      if (exists) return state;
      wasAdded = true;
      return { enquiryLookups: { ...state.enquiryLookups, [fieldKey]: [...currentOptions, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added to dropdown`, 'success');
    return wasAdded;
  },

  renameEnquiryLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    let renamed = false;
    set(state => {
      const currentOptions = state.enquiryLookups[fieldKey] || [];
      const duplicate = currentOptions.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue);
      if (duplicate) return state;
      renamed = true;
      return {
        enquiryLookups: {
          ...state.enquiryLookups,
          [fieldKey]: currentOptions.map(o => o === oldValue ? cleaned : o),
        },
        enquiryItems: state.enquiryItems.map(item =>
          item[fieldKey] === oldValue ? { ...item, [fieldKey]: cleaned } : item
        ),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteEnquiryLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().enquiryItems.filter(item => item[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} enquiry(s).`, 'error');
      return false;
    }
    set(state => ({
      enquiryLookups: {
        ...state.enquiryLookups,
        [fieldKey]: (state.enquiryLookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted from dropdown`, 'error');
    return true;
  },
}));
