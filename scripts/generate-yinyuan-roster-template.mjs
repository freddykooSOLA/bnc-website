import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public', 'downloads', 'yinyuan-cup-2027-roster-template.xlsx');

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('Roster');
ws.addRow(['中文姓名', '英文姓名', '身份證首4位', '職員編號', '球衣號碼', '隊長']);
const sample = ws.addRow(['示例球員', 'Sample Player', 'A1234', '', '7', 'Y']);
sample.font = { color: { argb: 'FF888888' } };
ws.getCell('A2').note = '示例列匯入時會自動略過';

await wb.xlsx.writeFile(out);
console.log('Wrote', out);