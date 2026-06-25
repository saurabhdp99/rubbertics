export const HSN_SAC_MASTER_FIELDS = [
  {
    key: 'hsnCode',
    label: 'HSN/SAC Code',
    type: 'text',
    required: true,
  },
  {
    key: 'description',
    label: 'Product Classification Description',
    type: 'textarea',
    wide: true,
  },
  {
    key: 'gstPercentage',
    label: 'GST %',
    type: 'number',
  },
  {
    key: 'effectiveFrom',
    label: 'Effective From',
    type: 'date',
  },
  {
    key: 'effectiveTo',
    label: 'Effective To',
    type: 'date',
  },
];
