export const MACHINE_MASTER_FIELDS = [
  // Basic Details
  {
    key: 'machineCode',
    label: 'Machine Code',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'machineName',
    label: 'Machine Name',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'machineMake',
    label: 'Machine Make',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'machineModel',
    label: 'Machine Model',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'serialNo',
    label: 'Serial No',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'machineSize',
    label: 'Machine Size',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'capacity',
    label: 'Capacity',
    type: 'number',
    section: 'Basic Details',
  },
  {
    key: 'capacityUnit',
    label: 'Capacity Unit',
    type: 'text',
    section: 'Basic Details',
  },
  {
    key: 'departmentOfUse',
    label: 'Department of Use',
    type: 'text',
    section: 'Basic Details',
  },

  // Maintenance & Specs
  {
    key: 'locationArea',
    label: 'Location / Area',
    type: 'text',
    section: 'Maintenance & Specs',
  },
  {
    key: 'rubberProcess',
    label: 'Process',
    type: 'creatable-select',
    options: [
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
    section: 'Maintenance & Specs',
  },
  {
    key: 'powerHpKw',
    label: 'Power HP / KW',
    type: 'number',
    section: 'Maintenance & Specs',
  },
  {
    key: 'installationDate',
    label: 'Installation Date',
    type: 'date',
    section: 'Maintenance & Specs',
  },
  {
    key: 'pmFrequency',
    label: 'Preventive Maintenance Frequency',
    type: 'pm-frequency',
    section: 'Maintenance & Specs',
  },
  {
    key: 'noOfStroke',
    label: 'No of Stroke',
    type: 'number',
    section: 'Maintenance & Specs',
  },

  {
    key: 'criticality',
    label: 'Criticality',
    type: 'creatable-select',
    options: ['Critical', 'High', 'Medium', 'Low', 'Standby'],
    section: 'Maintenance & Specs',
  },
  {
    key: 'machineCondition',
    label: 'Machine Condition',
    type: 'text',
    section: 'Maintenance & Specs',
  },

  // Status & Responsibilities
  {
    key: 'responsiblePerson',
    label: 'Responsible Person',
    type: 'text',
    section: 'Status & Responsibilities',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    section: 'Status & Responsibilities',
  },
  {
    key: 'remarks',
    label: 'Remarks',
    type: 'text',
    section: 'Status & Responsibilities',
  },

  // Documents
  {
    key: 'machineAttachments',
    label: 'Machine Attachments',
    type: 'attachments',
    section: 'Documents & Attachments',
  },
];
