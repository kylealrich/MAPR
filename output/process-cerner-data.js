// Process Cerner GL Transaction Data
// This script reads the input file, applies the mapping, and generates CSV output

var fs = require('fs');
var path = require('path');

// Load the mapper
var mapper = require('./CernerGLTrans_Mapper_20251025.js');

// Read input file
var inputPath = path.join(__dirname, '..', 'input', 'CernerGLTrans_20251025.txt');
var inputText = fs.readFileSync(inputPath, 'utf8');

// Parse CSV with comma delimiter
var inputData = mapper.parseCSV(inputText, ',');

// Skip 0 rows from top (as specified by user)
var dataToProcess = inputData.slice(0);

// Apply mapping
var mappedData = mapper.mapCernerGLTransaction(dataToProcess);

// Generate CSV output
var headers = [
  'FinanceEnterpriseGroup',
  'GLTransactionInterface.RunGroup',
  'GLTransactionInterface.SequenceNumber',
  'AccountingEntity',
  'Status',
  'ToAccountingEntity',
  'AccountCode',
  'GeneralLedgerEvent',
  'JournalCode',
  'TransactionDate',
  'Reference',
  'Description',
  'CurrencyCode',
  'UnitsAmount',
  'TransactionAmount',
  'System',
  'AutoReverse',
  'PostingDate',
  'Project',
  'FinanceDimension1',
  'FinanceDimension3',
  'DocumentNumber'
];

var csvLines = [headers.join(',')];

mappedData.forEach(function(record) {
  var row = headers.map(function(header) {
    var value = record[header] != null ? record[header].toString() : '';
    return /[",\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
  });
  csvLines.push(row.join(','));
});

var csvOutput = csvLines.join('\n');

// Write output file
var outputPath = path.join(__dirname, 'CernerGLTrans_Mapped_20251025.csv');
fs.writeFileSync(outputPath, csvOutput, 'utf8');

console.log('Processing complete!');
console.log('Input records: ' + dataToProcess.length);
console.log('Output records: ' + mappedData.length);
console.log('Output file: ' + outputPath);
