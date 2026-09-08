export const DISPATCH_STATUS_OPTIONS = [
  'Dispatched',
  'Partial Dispatch',
  'In Transit',
  'Delivered',
  'Pending LR Entry',
];

export const INITIAL_DISPATCH_DATA = [
  {
    id: 'disp-1',
    srNo: 1,
    invDate: '2026-01-02',
    invoiceNo: 'NP/25-26/2068',
    saleOrderNo: 'P20260034385',
    partyName: 'RAYCHEM RPG PVT LTD',
    partNo: 'OS D4B4001209',
    materialDescription: 'LABOUR CHARG.MOULD ELASTOMER 2T SQ',
    quantity: 42,
    transport: 'TEMPO DELIVERY',
    vehicleNo: 'MH-04-AZ-1122',
    lrNo: '',
    lrDate: '',
    noOfBags: '4',
    dispatchStatus: 'Pending LR Entry',
    driverName: 'Ramesh Patil',
    driverPhone: '9820112233',
    remarks: 'Dispatched via local tempo, LR copy pending',
  },
  {
    id: 'disp-2',
    srNo: 2,
    invDate: '2026-01-02',
    invoiceNo: 'NP/25-26/2069',
    saleOrderNo: 'P20260033827',
    partyName: 'RAYCHEM RPG PVT LTD',
    partNo: 'OS D4B4000802',
    materialDescription: 'LABOUR CHARG. RUBBER ELASTOMER 4.7T',
    quantity: 36,
    transport: 'TEMPO DELIVERY',
    vehicleNo: 'MH-04-AZ-1122',
    lrNo: '',
    lrDate: '',
    noOfBags: '3',
    dispatchStatus: 'Pending LR Entry',
    driverName: 'Ramesh Patil',
    driverPhone: '9820112233',
    remarks: 'Urgent lot delivery',
  },
  {
    id: 'disp-3',
    srNo: 3,
    invDate: '2026-01-03',
    invoiceNo: 'NP/25-26/2070',
    saleOrderNo: '42873',
    partyName: 'JYOTI WORLD PRIVATE LIMITED',
    partNo: '1008000076',
    materialDescription: 'PTRB63H O-RING',
    quantity: 90000,
    transport: 'NANDWANA CARRIER',
    vehicleNo: 'GJ-01-TY-4589',
    lrNo: '12345',
    lrDate: '2026-01-03',
    noOfBags: '10',
    dispatchStatus: 'Dispatched',
    driverName: 'Suresh Bhai',
    driverPhone: '9898234567',
    remarks: 'Full consignment dispatched with invoice and test certificate',
  },
];

export const getNextInvoiceNo = (items = []) => {
  const currentYear = new Date().getFullYear();
  const nextYear = (currentYear + 1).toString().slice(-2);
  const currentYearShort = currentYear.toString().slice(-2);
  const fyPrefix = `NP/${currentYearShort}-${nextYear}/`;

  let maxNum = 2070;
  items.forEach((item) => {
    if (item.invoiceNo) {
      const parts = item.invoiceNo.split('/');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  return `${fyPrefix}${maxNum + 1}`;
};

export const getNextSrNo = (items = []) => {
  const maxSr = items.reduce((max, item) => Math.max(max, Number(item.srNo) || 0), 0);
  return maxSr + 1;
};
