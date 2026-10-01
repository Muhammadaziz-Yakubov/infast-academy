export function formatGraduateId(sequence: number, year = 2026): string {
  const padded = String(sequence).padStart(3, '0');
  return `IF-GRAD-${year}-${padded}`;
}

export function formatAwardId(sequence: number, year = 2026): string {
  const padded = String(sequence).padStart(3, '0');
  return `IF-AWARD-${year}-${padded}`;
}

export const MONTHS_UZ: { [key: string]: string } = {
  '01': 'Yanvar',
  '02': 'Fevral',
  '03': 'Mart',
  '04': 'Aprel',
  '05': 'May',
  '06': 'Iyun',
  '07': 'Iyul',
  '08': 'Avgust',
  '09': 'Sentabr',
  '10': 'Oktabr',
  '11': 'Noyabr',
  '12': 'Dekabr',
};

export function formatUzbekDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  // formats like "02.10.2026" or "2026-10-02"
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parts[0];
      const month = MONTHS_UZ[parts[1]] || parts[1];
      const year = parts[2];
      return `${day} ${month} ${year}`;
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = MONTHS_UZ[parts[1]] || parts[1];
      const day = parts[2];
      return `${day} ${month} ${year}`;
    }
  }
  return dateStr;
}

export const STANDARD_NOMINATIONS = [
  'Best Full-Stack Developer',
  'Fastest Progress',
  'Best Problem Solver',
  'Best Frontend Developer',
  'Best Backend Developer',
  'Most Consistent',
  'Top Code Architecture',
  'Best Team Leader',
  'Best UI/UX Implementer',
  'Outstanding Achievement',
];
