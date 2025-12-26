export function formatDateISO(input: string): string {
  if (!input) return '';
  // Accepts 'YYYY-MM-DD' or Date strings, returns 'YYYY-MM-DD'
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    // Already ISO date string?
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(input);
    return m ? input : '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isValidDateRange(ini: string, fin: string): boolean {
  if (!ini || !fin) return true;
  const a = new Date(ini).getTime();
  const b = new Date(fin).getTime();
  return !Number.isNaN(a) && !Number.isNaN(b) && a <= b;
}

export function normalizePhone(input?: string): string | undefined {
  if (!input) return input;
  return input.replace(/[^0-9+]/g, '').trim();
}
