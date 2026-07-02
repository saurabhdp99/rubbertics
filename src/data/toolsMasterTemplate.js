export const TOOLS_MASTER_FIELDS = [
  // Basic Details
  {
    key: 'toolCode',
    label: 'Tool Code',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'toolName',
    label: 'Tool Name / Description',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'linkedPartName',
    label: 'Linked Part Name',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'partRevision',
    label: 'Part Revision',
    type: 'text',
    section: 'Basic Details',
  },

  // Technical
  {
    key: 'process',
    label: 'Process',
    type: 'creatable-select',
    options: [
      'Compression Moulding',
      'Injection Moulding',
      'Transfer Moulding',
      'Extrusion',
      'Trimming Die',
      'Deflashing Mold',
    ],
    section: 'Technical',
  },
  {
    key: 'numberOfCavities',
    label: 'Number of Cavities',
    type: 'number',
    section: 'Technical',
  },
  {
    key: 'cycleTime',
    label: 'Cycle Time',
    type: 'text',
    section: 'Technical',
  },
  {
    key: 'pressTonnage',
    label: 'Press Tonnage',
    type: 'text',
    section: 'Technical',
  },
  {
    key: 'toolMaterial',
    label: 'Tool Material',
    type: 'creatable-select',
    options: [
      'P20 Steel',
      'H13 Tool Steel',
      'EN8 Steel',
      'EN31 Steel',
      'D2 Steel',
      'Mild Steel (MS)',
      'Aluminum 7075',
      'Beryllium Copper',
    ],
    section: 'Technical',
  },
  {
    key: 'weight',
    label: 'Weight',
    type: 'text',
    section: 'Technical',
  },
  {
    key: 'dimensions',
    label: 'Dimensions',
    type: 'text',
    section: 'Technical',
  },
  {
    key: 'moldType',
    label: 'Mold Type',
    type: 'creatable-select',
    options: [
      'Two-Plate Mold',
      'Three-Plate Mold',
      'Hot Runner',
      'Cold Runner',
      'Compression Mold',
      'Transfer Mold',
      'Multi-Cavity Mold',
    ],
    section: 'Technical',
  },
  {
    key: 'shrinkageFactor',
    label: 'Shrinkage Factor',
    type: 'text',
    section: 'Technical',
  },

  // Maintenance
  {
    key: 'lastMaintenanceDate',
    label: 'Last Maintenance Date',
    type: 'date',
    section: 'Maintenance',
  },
  {
    key: 'nextMaintenanceDue',
    label: 'Next Maintenance Due',
    type: 'date',
    section: 'Maintenance',
  },
  {
    key: 'maintenanceFrequency',
    label: 'Maintenance Frequency',
    type: 'creatable-select',
    options: [
      'Every 10,000 Shots',
      'Every 25,000 Shots',
      'Every 50,000 Shots',
      'Every 100,000 Shots',
      'Monthly',
      'Quarterly',
      'Half-Yearly',
      'Yearly',
    ],
    section: 'Maintenance',
  },
  {
    key: 'totalShotCount',
    label: 'Total Shot Count',
    type: 'number',
    section: 'Maintenance',
  },
  {
    key: 'maximumToolLife',
    label: 'Maximum Tool Life',
    type: 'text',
    section: 'Maintenance',
  },

  // Cost & Supplier
  {
    key: 'toolMaker',
    label: 'Tool Maker',
    type: 'text',
    section: 'Cost & Supplier',
  },
  {
    key: 'supplierContact',
    label: 'Supplier Contact',
    type: 'text',
    section: 'Cost & Supplier',
  },
  {
    key: 'toolCost',
    label: 'Tool Cost',
    type: 'number',
    section: 'Cost & Supplier',
  },
  {
    key: 'purchaseDate',
    label: 'Purchase Date',
    type: 'date',
    section: 'Cost & Supplier',
  },
  {
    key: 'warrantyExpiry',
    label: 'Warranty Expiry',
    type: 'date',
    section: 'Cost & Supplier',
  },

  // Status & Remarks
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    section: 'Status & Remarks',
  },
  {
    key: 'remarks',
    label: 'Remarks',
    type: 'text',
    section: 'Status & Remarks',
  },

  // Documents
  {
    key: 'toolAttachments',
    label: 'Tool Attachments',
    type: 'attachments',
    section: 'Documents & Attachments',
  },
];
