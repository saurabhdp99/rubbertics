export const formatTableDate = (value, columnKey) => {
  const dateKeys = [
    'date', 'deliveryDate', 'createdDate', 'createdAt', 'updatedAt',
    'purchaseDate', 'installationDate', 'lastTrainingDate', 'nextTrainingDue',
    'invoiceDate', 'dispatchDate', 'complaintDate', 'expectedDelivery', 'effectiveFrom'
  ];
  
  if (dateKeys.includes(columnKey)) {
    if (!value) return '-';
    // Only format strings that look like dates (YYYY-MM-DD or ISO)
    if (typeof value === 'string' && (value.includes('-') || value.includes('T'))) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB');
    }
    return value;
  }
  
  return null; // Return null if it's not a date column, so the caller can continue with other formatting
};
