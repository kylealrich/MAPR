// Cerner GL Transaction Mapper - Self Contained
// Generated for: CernerGLTrans_20251025.txt
// Mapping Configuration: CernerGL_MappingTable.csv
// Generation Type: Self Contained (Static)
// Generated: 2026-03-04

// Global counter for auto-increment fields
var incrementCounter = 0;

// CSV Parser Function
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/);
  var result = [];
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.trim() === '') continue;
    
    var row = [];
    var current = '';
    var inQuotes = false;
    
    for (var j = 0; j < line.length; j++) {
      var char = line[j];
      var nextChar = line[j + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current);
    result.push(row);
  }
  
  return result;
}

// Transformation Functions
function removeLeadingZeroes(value) {
  if (!value) return '';
  var trimmed = value.toString().trim();
  return trimmed.replace(/^0+/, '') || '0';
}

function leftSubstring(value, length) {
  if (!value) return '';
  return value.toString().substring(0, length);
}

function rightSubstring(value, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(str.length - length);
}

function dateReformat(dateStr, inputFormat, outputFormat) {
  if (!dateStr || dateStr.trim() === '') return '';
  
  var cleaned = dateStr.toString().trim();
  
  if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD') {
    if (cleaned.length === 8) {
      return cleaned.substring(4, 8) + cleaned.substring(0, 2) + cleaned.substring(2, 4);
    }
  }
  
  return cleaned;
}

// Main Mapping Function
function mapRecord(data) {
  var record = {};
  
  // Reset increment counter at start of each record
  incrementCounter++;
  
  try {
    // FinanceEnterpriseGroup - Hardcode '1'
    record.FinanceEnterpriseGroup = '1';
    
    // GLTransactionInterface.RunGroup - Column 1
    record['GLTransactionInterface.RunGroup'] = (data[0] || '').trim();
    
    // GLTransactionInterface.SequenceNumber - Increment By 1
    record['GLTransactionInterface.SequenceNumber'] = incrementCounter.toString();
    
    // AccountingEntity - RemoveLeadingZeroes(Column3)
    record.AccountingEntity = removeLeadingZeroes(data[2] || '');
    
    // Status - Hardcode '0'
    record.Status = '0';
    
    // ToAccountingEntity - Column 3
    record.ToAccountingEntity = (data[2] || '').trim();
    
    // AccountCode - Left(Column5,6)
    record.AccountCode = leftSubstring(data[4] || '', 6);
    
    // GeneralLedgerEvent - If Column6 == '' Then 'TC' Else Column6
    var col6 = (data[5] || '').trim();
    record.GeneralLedgerEvent = (col6 === '') ? 'TC' : col6;
    
    // JournalCode - Trim(Column16)
    record.JournalCode = (data[15] || '').trim();
    
    // TransactionDate - DateReformat(Column18,'MMDDYYYY','YYYYMMDD')
    record.TransactionDate = dateReformat(data[17] || '', 'MMDDYYYY', 'YYYYMMDD');
    
    // Reference - Column 8
    record.Reference = (data[7] || '').trim();
    
    // Description - Column 9
    record.Description = (data[8] || '').trim();
    
    // CurrencyCode - Column 10
    record.CurrencyCode = (data[9] || '').trim();
    
    // UnitsAmount - '0'
    record.UnitsAmount = '0';
    
    // TransactionAmount - Column 12
    record.TransactionAmount = (data[11] || '').trim();
    
    // System - If Column15 == '' Then 'GL' Else Column15
    var col15 = (data[14] || '').trim();
    record.System = (col15 === '') ? 'GL' : col15;
    
    // AutoReverse - If Column17 == '' Then 'N' Else Column17
    var col17 = (data[16] || '').trim();
    record.AutoReverse = (col17 === '') ? 'N' : col17;
    
    // PostingDate - DateReformat(Column18,'MMDDYYYY','YYYYMMDD')
    record.PostingDate = dateReformat(data[17] || '', 'MMDDYYYY', 'YYYYMMDD');
    
    // Project - Column 19
    record.Project = (data[18] || '').trim();
    
    // FinanceDimension1 - Right(Column4,3)
    record.FinanceDimension1 = rightSubstring(data[3] || '', 3);
    
    // FinanceDimension3 - Column 20
    record.FinanceDimension3 = (data[19] || '').trim();
    
    // DocumentNumber - Column 21
    record.DocumentNumber = (data[20] || '').trim();
    
  } catch (error) {
    throw new Error('Error mapping record: ' + error.message);
  }
  
  return record;
}

// Process File Function
function processFile(fileContent) {
  var rows = parseCSV(fileContent, ',');
  var results = [];
  
  // Reset increment counter
  incrementCounter = 0;
  
  // Skip header rows (0 rows specified)
  var startRow = 0;
  
  for (var i = startRow; i < rows.length; i++) {
    try {
      var mappedRecord = mapRecord(rows[i]);
      results.push(mappedRecord);
    } catch (error) {
      console.error('Error processing row ' + (i + 1) + ': ' + error.message);
    }
  }
  
  return results;
}

// Generate CSV Output
function generateCSV(records) {
  if (records.length === 0) return '';
  
  var headers = Object.keys(records[0]);
  var csvLines = [headers.join(',')];
  
  records.forEach(function(record) {
    var row = headers.map(function(header) {
      var value = record[header] != null ? record[header].toString() : '';
      if (/[",\n]/.test(value)) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    });
    csvLines.push(row.join(','));
  });
  
  return csvLines.join('\n');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processFile: processFile,
    generateCSV: generateCSV,
    mapRecord: mapRecord,
    parseCSV: parseCSV
  };
}

// Example usage:
// var fs = require('fs');
// var fileContent = fs.readFileSync('input/CernerGLTrans_20251025.txt', 'utf8');
// var records = processFile(fileContent);
// var csvOutput = generateCSV(records);
// fs.writeFileSync('output/CernerGLTrans_Mapped_20251025.csv', csvOutput);
