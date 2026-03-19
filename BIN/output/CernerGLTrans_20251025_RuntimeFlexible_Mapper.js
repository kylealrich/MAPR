// Runtime Flexible Mapper - Generated 3/17/2026, 9:43:22 PM
// This mapper dynamically applies transformation rules at runtime.
var fs = require('fs');

// ─── Embedded Core Engine ───
var incrementCounter = 0;

function parseCSV() { [native code] }

function normalizeKey() { [native code] }

function applyLogic() { [native code] }

function createDynamicMapper() { [native code] }

function transformData() { [native code] }

// ─── Mapping Configuration ───
var MAPPING_TABLE = [
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "FinanceEnterpriseGroup",
    "required": "Y",
    "inputcolumnnumber": "",
    "mappinglogic": "Hardcode '1'",
    "samplevalue": "1"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "GLTransactionInterface.RunGroup",
    "required": "Y",
    "inputcolumnnumber": "1",
    "mappinglogic": "",
    "samplevalue": "GLGrp001"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "GLTransactionInterface.SequenceNumber",
    "required": "Y",
    "inputcolumnnumber": "",
    "mappinglogic": "Increment By 1",
    "samplevalue": "1"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "AccountingEntity",
    "required": "Y",
    "inputcolumnnumber": "",
    "mappinglogic": "RemoveLeadingZeroes(Column3)",
    "samplevalue": "100"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "Status",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "Hardcode '0'",
    "samplevalue": "0"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "ToAccountingEntity",
    "required": "Y",
    "inputcolumnnumber": "3",
    "mappinglogic": "",
    "samplevalue": "100"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "AccountCode",
    "required": "Y",
    "inputcolumnnumber": "",
    "mappinglogic": "Left(Column5,6)",
    "samplevalue": "102002"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "GeneralLedgerEvent",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "If Column6 == '' Then 'TC' Else Column6",
    "samplevalue": "TC"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "JournalCode",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "Trim(Column16)",
    "samplevalue": "PROG01"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "TransactionDate",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "DateReformat(Column18,'MMDDYYYY','YYYYMMDD')",
    "samplevalue": "20250101"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "Reference",
    "required": "N",
    "inputcolumnnumber": "8",
    "mappinglogic": "",
    "samplevalue": "REF001"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "Description",
    "required": "N",
    "inputcolumnnumber": "9",
    "mappinglogic": "",
    "samplevalue": "Test Transaction"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "CurrencyCode",
    "required": "N",
    "inputcolumnnumber": "10",
    "mappinglogic": "",
    "samplevalue": "USD"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "UnitsAmount",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "'0'",
    "samplevalue": "0"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "TransactionAmount",
    "required": "N",
    "inputcolumnnumber": "12",
    "mappinglogic": "",
    "samplevalue": "100"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "System",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "If Column15 == '' Then 'GL' Else Column15",
    "samplevalue": "GL"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "AutoReverse",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "If Column17 == '' Then 'N' Else Column17",
    "samplevalue": "N"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "PostingDate",
    "required": "Y",
    "inputcolumnnumber": "",
    "mappinglogic": "DateReformat(Column18,'MMDDYYYY','YYYYMMDD')",
    "samplevalue": "20251025"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "Project",
    "required": "N",
    "inputcolumnnumber": "19",
    "mappinglogic": "",
    "samplevalue": "PROJ001"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "FinanceDimension1",
    "required": "N",
    "inputcolumnnumber": "",
    "mappinglogic": "Right(Column4,3)",
    "samplevalue": "101"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "FinanceDimension3",
    "required": "N",
    "inputcolumnnumber": "20",
    "mappinglogic": "",
    "samplevalue": "CAT01"
  },
  {
    "targettablename": "GLTransactionInterface",
    "targetfieldname": "DocumentNumber",
    "required": "N",
    "inputcolumnnumber": "21",
    "mappinglogic": "",
    "samplevalue": "DOC001"
  }
];

// ─── Process Function ───
function processFile(inputPath, outputPath, delimiter, skipRows) {
  var inputText = fs.readFileSync(inputPath, 'utf8');
  var mapper = createDynamicMapper(MAPPING_TABLE);
  var allData = parseCSV(inputText, delimiter);
  var inputData = allData.slice(skipRows || 0);
  var results = inputData.map(function(row, idx) { return mapper.mapRecord(row, idx); });
  var csvLines = [mapper.headers.join(',')];
  results.forEach(function(r) {
    var row = mapper.headers.map(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""')+'"' : v;
    });
    csvLines.push(row.join(','));
  });
  fs.writeFileSync(outputPath, csvLines.join('\n'));
  console.log('Processed ' + results.length + ' records -> ' + outputPath);
  return { success: true, count: results.length };
}

// ─── CLI Entry Point ───
if (require.main === module) {
  var args = process.argv.slice(2);
  if (args.length < 2) { console.log('Usage: node mapper.js <input> <output> [delimiter] [skipRows]'); process.exit(1); }
  processFile(args[0], args[1], args[2] || ',', parseInt(args[3]) || 0);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { processFile: processFile, transformData: transformData, applyLogic: applyLogic };
}