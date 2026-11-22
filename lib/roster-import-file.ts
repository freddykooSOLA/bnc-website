import ExcelJS from 'exceljs';
import {
  mergeJerseyConflicts,
  parseCsvUtf8,
  rowsFromSheetMatrix,
  type RosterImportPreview,
} from '@/lib/roster-import';

const MAX_BYTES = 1024 * 1024;

export async function previewRosterUpload(
  buffer: Buffer,
  filename: string,
  existingJerseys: number[]
): Promise<RosterImportPreview> {
  if (buffer.length > MAX_BYTES) {
    throw new Error('file_too_large');
  }

  const lower = filename.toLowerCase();
  let dataRows: string[][];

  if (lower.endsWith('.csv')) {
    const matrix = parseCsvUtf8(buffer.toString('utf8'));
    dataRows = matrix.slice(1);
  } else if (lower.endsWith('.xlsx')) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const sheet = wb.worksheets[0];
    if (!sheet) throw new Error('empty_workbook');
    const matrix: string[][] = [];
    sheet.eachRow((row) => {
      const values = row.values;
      const cells = (Array.isArray(values) ? values.slice(1) : []).map((v) =>
        v == null ? '' : String(v)
      );
      matrix.push(cells);
    });
    dataRows = matrix.slice(1);
  } else {
    throw new Error('unsupported_type');
  }

  const base = rowsFromSheetMatrix(dataRows);
  let preview = mergeJerseyConflicts(base, existingJerseys);

  const totalIfAppend = existingJerseys.length + preview.valid.length;
  if (totalIfAppend > 20) {
    preview = {
      ...preview,
      hasErrors: true,
      rows: preview.rows.map((r) =>
        r.errors.length === 0
          ? { ...r, errors: [...r.errors, '匯入後將超過 20 人'] }
          : r
      ),
      valid: [],
    };
  }

  return preview;
}