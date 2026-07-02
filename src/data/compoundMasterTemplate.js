export const COMPOUND_MASTER_FIELDS = [
  // Compound Details
  {
    key: 'compoundCode',
    label: 'Compound Code',
    type: 'text',
    section: 'Compound Details',
  },
  {
    key: 'compoundName',
    label: 'Compound Name',
    type: 'text',
    section: 'Compound Details',
  },
  {
    key: 'compoundColour',
    label: 'Compound Colour',
    type: 'creatable-select',
    options: [
      'Black',
      'Red',
      'Blue',
      'Green',
      'Yellow',
      'White',
      'Translucent',
      'Grey',
      'Orange',
      'Brown',
    ],
    section: 'Compound Details',
  },

  // Quality Tab
  {
    key: 'hardnessShoreA',
    label: 'Hardness (Shore A)',
    type: 'text',
    placeholder: 'e.g. 60 ± 5',
    section: 'Quality Tab',
  },
  {
    key: 'specificGravity',
    label: 'Specific Gravity',
    type: 'text',
    placeholder: 'e.g. 1.15 ± 0.03',
    section: 'Quality Tab',
  },
  {
    key: 'mooneyViscosity',
    label: 'Mooney Viscosity',
    type: 'text',
    placeholder: 'e.g. 45 ML(1+4)@100°C',
    section: 'Quality Tab',
  },
  {
    key: 'tensileStrengthMpa',
    label: 'Tensile Strength (MPa)',
    type: 'text',
    placeholder: 'e.g. 12.5 MPa',
    section: 'Quality Tab',
  },
  {
    key: 'elongationPercent',
    label: 'Elongation (%)',
    type: 'text',
    placeholder: 'e.g. 350%',
    section: 'Quality Tab',
  },
  {
    key: 'tearStrength',
    label: 'Tear Strength',
    type: 'text',
    placeholder: 'e.g. 25 N/mm',
    section: 'Quality Tab',
  },
  {
    key: 'compressionSetPercent',
    label: 'Compression Set (%)',
    type: 'text',
    placeholder: 'e.g. 20% max @ 22h/70°C',
    section: 'Quality Tab',
  },

  // Storage and Life
  {
    key: 'shelfLifeDays',
    label: 'Shelf Life (Days)',
    type: 'number',
    section: 'Storage and Life',
  },
  {
    key: 'storageLifeDays',
    label: 'Storage Life (Days)',
    type: 'number',
    section: 'Storage and Life',
  },
  {
    key: 'storageCondition',
    label: 'Storage Condition',
    type: 'creatable-select',
    options: [
      'Store in a cool, dry place below 25°C away from direct sunlight',
      'Room Temperature (20-25°C)',
      'Refrigerated (2-8°C)',
      'Air-conditioned warehouse below 20°C',
      'Store in dry condition, sealed bags',
    ],
    section: 'Storage and Life',
  },

  // Special Instruction
  {
    key: 'specialInstruction',
    label: 'Special Instruction',
    type: 'textarea',
    section: 'Special Instruction',
  },

  // Details
  {
    key: 'revisionNumber',
    label: 'Revision Number',
    type: 'number',
    section: 'Details',
  },
  {
    key: 'revisionDate',
    label: 'Revision Date',
    type: 'date',
    section: 'Details',
  },

  // Status
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Active', 'Inactive', 'Under Review', 'Obsolete'],
    section: 'Status',
  },

  // Remarks
  {
    key: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    section: 'Remarks',
  },

  // Documents & Attachments
  {
    key: 'attachments',
    label: 'Documents & Attachments',
    type: 'attachments',
    section: 'Documents & Attachments',
  },
];
