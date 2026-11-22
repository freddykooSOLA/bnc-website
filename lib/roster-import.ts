import { ID_PARTIAL_RE } from '@/lib/competition-entry-validation';

export const ROSTER_IMPORT_HEADERS = [
  '中文姓名',
  '英文姓名',
  '身份證首4位',
  '職員編號',
  '球衣號碼',
  '隊長',
] as const;

export interface ParsedRosterRow {
  rowNumber: number;
  nameZh: string;
  nameEn: string;
  idPartial: string;
  staffId?: string;
  jerseyNumber: number;
  isCaptain: boolean;
  errors: string[];
}

export interface RosterImportPreview {
  rows: ParsedRosterRow[];
  valid: ParsedRosterRow[];
  hasErrors: boolean;
}

function parseCaptain(val: string): boolean {
  const v = val.trim().toUpperCase();
  return v === 'Y' || v === 'YES' || v === '是';
}

export function rowsFromSheetMatrix(matrix: string[][]): RosterImportPreview {
  const rows: ParsedRosterRow[] = [];
  const jerseySeen = new Set<number>();

  matrix.forEach((cells, index) => {
    const rowNumber = index + 1;
    const joined = cells.map((c) => String(c ?? '').trim()).join('');
    if (!joined) return;

    const nameZh = String(cells[0] ?? '').trim();
    if (index === 0 && (nameZh.includes('中文姓名') || nameZh.toLowerCase() === 'name')) {
      return;
    }
    const nameEn = String(cells[1] ?? '').trim();
    const idPartial = String(cells[2] ?? '').trim().toUpperCase();
    const staffId = String(cells[3] ?? '').trim();
    const jerseyRaw = String(cells[4] ?? '').trim();
    const captainRaw = String(cells[5] ?? '').trim();

  if (rowNumber === 2 && /示例|example/i.test(nameZh + nameEn)) {
      return;
    }

    const errors: string[] = [];
    if (!nameZh && !nameEn) errors.push('缺少姓名');
    if (!idPartial) errors.push('缺少身份證首4位');
    else if (!ID_PARTIAL_RE.test(idPartial)) errors.push('身份證格式應為字母＋4位數字');

    const jerseyNumber = Number.parseInt(jerseyRaw, 10);
    if (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      errors.push('球衣號碼須為 0–99');
    } else if (jerseySeen.has(jerseyNumber)) {
      errors.push('球衣號碼重複');
    } else {
      jerseySeen.add(jerseyNumber);
    }

    rows.push({
      rowNumber,
      nameZh,
      nameEn,
      idPartial,
      staffId: staffId || undefined,
      jerseyNumber,
      isCaptain: parseCaptain(captainRaw),
      errors,
    });
  });

  const withGlobal: ParsedRosterRow[] = rows.map((r) => ({ ...r }));
  const validCount = withGlobal.filter((r) => r.errors.length === 0).length;
  if (validCount > 20) {
    withGlobal.forEach((r) => {
      if (r.errors.length === 0) r.errors.push('超過 20 名球員');
    });
  }

  const valid = withGlobal.filter((r) => r.errors.length === 0);
  return {
    rows: withGlobal,
    valid,
    hasErrors: withGlobal.some((r) => r.errors.length > 0) || valid.length > 20,
  };
}

export function mergeJerseyConflicts(
  preview: RosterImportPreview,
  existingJerseys: number[]
): RosterImportPreview {
  const taken = new Set(existingJerseys);
  const rows = preview.rows.map((r) => {
    const errors = [...r.errors];
    if (errors.length === 0 && taken.has(r.jerseyNumber)) {
      errors.push('球衣號碼與現有名單重複');
    }
    return { ...r, errors };
  });
  const valid = rows.filter((r) => r.errors.length === 0);
  return { rows, valid, hasErrors: rows.some((r) => r.errors.length > 0) || valid.length > 20 };
}

export function parseCsvUtf8(text: string): string[][] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  return lines
    .map((line) => {
      const cells: string[] = [];
      let cur = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuote = !inQuote;
          continue;
        }
        if (ch === ',' && !inQuote) {
          cells.push(cur);
          cur = '';
          continue;
        }
        cur += ch;
      }
      cells.push(cur);
      return cells;
    })
    .filter((row) => row.some((c) => c.trim()));
}