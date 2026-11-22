import assert from 'node:assert/strict';
import {
  mergeJerseyConflicts,
  parseCsvUtf8,
  replaceModeKeptJerseys,
  rowsFromSheetMatrix,
} from '../lib/roster-import';

function okPreview(matrix: string[][], existing: number[] = []) {
  return mergeJerseyConflicts(rowsFromSheetMatrix(matrix), existing);
}

const header = ['中文姓名', '英文姓名', '身份證首4位', '職員編號', '球衣號碼', '隊長'];

{
  const p = okPreview([
    header,
    ['陳大文', 'Chan Tai Man', 'A1234', 'E001', '4', 'Y'],
    ['李小明', 'Lee Siu Ming', 'B5678', '', '7', ''],
  ]);
  assert.equal(p.hasErrors, false);
  assert.equal(p.valid.length, 2);
}

{
  const p = okPreview([header, ['無證', 'No Id', '', '', '5', '']]);
  assert.ok(p.rows[0].errors.some((e) => e.includes('身份證')));
}

{
  const p = okPreview([
    header,
    ['甲', 'A', 'A1111', '', '9', ''],
    ['乙', 'B', 'A2222', '', '9', ''],
  ]);
  assert.ok(p.hasErrors);
}

{
  const p = okPreview([header, ['丙', 'C', '12345', '', '3', '']]);
  assert.ok(p.rows[0].errors.length > 0);
}

{
  const rows = [header];
  for (let i = 1; i <= 21; i++) {
    rows.push([`球員${i}`, `P${i}`, `A${String(1000 + i).slice(-4)}`, '', String(i), '']);
  }
  const p = okPreview(rows);
  assert.ok(p.hasErrors);
}

{
  const p = okPreview([header, ['', '', '', '', '', '']]);
  assert.equal(p.rows.length, 0);
}

{
  const p = okPreview([header, ['丁', 'D', 'C1234', '', '4', '']], [4]);
  assert.ok(p.rows[0].errors.some((e) => e.includes('現有')));
}

{
  const csv = '\uFEFF' + header.join(',') + '\n' + 'Test,Test,A1234,,8,Y';
  const matrix = parseCsvUtf8(csv);
  assert.equal(matrix[0][0], '中文姓名');
}

{
  const kept = replaceModeKeptJerseys([
    { memberId: 'user-1', jerseyNumber: 7 },
    { memberId: null, jerseyNumber: 4 },
    { memberId: 'user-2', jerseyNumber: 11 },
  ]);
  assert.deepEqual(kept, [7, 11]);
  const p = okPreview([header, ['新丁', 'New', 'A1234', '', '7', '']], kept);
  assert.ok(p.rows[0].errors.some((e) => e.includes('現有')));
}

console.log('roster-import tests OK');