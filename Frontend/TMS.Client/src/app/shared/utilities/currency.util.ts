const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric amount in Indian Rupees (₹) using en-IN digit grouping.
 */
export function formatInr(amount: number): string {
  return INR_FORMATTER.format(amount);
}
