export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount));
}

export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US').format(Number(val));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  // If format is YYYY-MM-DD or standard
  const parts = String(dateStr).split('T')[0];
  return parts;
}
