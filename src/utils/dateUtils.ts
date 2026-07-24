/**
 * Returns today's date string formatted as YYYY-MM-DD in local time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Compares two date strings (YYYY-MM-DD) for equality.
 */
export function isSameDay(dateStr1?: string, dateStr2?: string): boolean {
  if (!dateStr1 || !dateStr2) return false;
  return dateStr1.trim() === dateStr2.trim();
}
