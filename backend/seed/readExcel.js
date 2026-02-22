const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.resolve(__dirname, '../../art forms makreting project.xlsx');

/**
 * Read Excel file and return array of row objects (first row = headers).
 * Tries multiple sheet names if the first is empty.
 */
function readExcelRows() {
  let workbook;
  try {
    workbook = XLSX.readFile(EXCEL_PATH);
  } catch (e) {
    throw new Error(`Could not read Excel file at: ${EXCEL_PATH}. ${e.message}`);
  }
  const sheetName = workbook.SheetNames[0] || workbook.SheetNames.find(Boolean);
  if (!sheetName) throw new Error('No sheets found in Excel file.');
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  return rows;
}

/**
 * Normalize header/key: trim, lowercase, replace spaces/special with underscore.
 */
function normalizeKey(str) {
  if (str == null || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Build a map of normalized column name -> original key for first row.
 */
function getColumnMap(row) {
  const map = {};
  for (const key of Object.keys(row)) {
    const n = normalizeKey(key);
    if (n) map[n] = key;
  }
  return map;
}

/**
 * Get value from row using any of the possible keys (normalized).
 */
function get(row, columnMap, ...possibleNormalizedKeys) {
  for (const k of possibleNormalizedKeys) {
    const original = columnMap[k];
    if (original != null && row[original] != null && String(row[original]).trim() !== '') {
      return String(row[original]).trim();
    }
  }
  return '';
}

module.exports = { readExcelRows, getColumnMap, get, normalizeKey };
