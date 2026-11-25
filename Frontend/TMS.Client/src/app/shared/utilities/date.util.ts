/**
 * Formats a local Date into an ASP.NET Core DateOnly string (YYYY-MM-DD)
 * without shifting days across UTC timezones.
 */
export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses an ISO DateOnly string (YYYY-MM-DD) into a local Date at midnight
 * so Material Datepicker displays the exact calendar date regardless of timezone.
 */
export function parseDateOnly(dateOnly: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOnly);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}
