// Generated Mapper for Cerner GL Transaction Processing
// Generated: 2026-03-03
// Input File: CernerGLTrans_20251025.txt
// Mapping File: CernerGL_MappingTable.csv

// Global counter for Increment By 1 functionality
var incrementCounter = 0;

// CSV Parser
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });
}

// Key Normalizer
function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

// Apply Logic Function
function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }
  
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }
  
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').trim();
  }
  
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(0, parseInt(match[2]));
  }
  
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').slice(-parseInt(match[2]));
  }

  if (/^If\s/i.test(logic)) {
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var conditionRef = simpleMatch[1].trim();
      if (/Column(\d+)/i.test(conditionRef)) {
        var colNum = conditionRef.match(/Column(\d+)/i)[1];
        conditionRef = data[colNum - 1] || '';
      }
      var operator = simpleMatch[2];
      var compareValue = simpleMatch[3];
      var thenResult = simpleMatch[4];
      var elseResult = simpleMatch[5] || '';
      
      if (/Column(\d+)/i.test(thenResult)) {
        var colNum = thenResult.match(/Column(\d+)/i)[1];
        thenResult = data[colNum - 1] || '';
      }
      if (/Column(\d+)/i.test(elseResult)) {
        var colNum = elseResult.match(/Column(\d+)/i)[1];
        elseResult = data[colNum - 1] || '';
      }
      
      var condition = false;
      if (operator === '==' || operator === '=') condition = conditionRef == compareValue;
      else if (operator === '!=') condition = conditionRef != compareValue;
      
      return condition ? thenResult : elseResult;
    }
  }

  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var dateStr = data[match[1]-1] || '';
      var inputFormat = match[2].toUpperCase();
      var outputFormat = match[3].toUpperCase();
      
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }

  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
}

// Main Mapper Function
function mapCernerGLTransaction(inputData) {
  incrementCounter = 0;
  var results = [];
  
  for (var i = 0; i < inputData.length; i++) {
    var data = inputData[i];
    var record = {};
    
    record['FinanceEnterpriseGroup'] = '1';
    record['GLTransactionInterface.RunGroup'] = data[0] || '';
    record['GLTransactionInterface.SequenceNumber'] = (function() { incrementCounter++; return incrementCounter; })();
    record['AccountingEntity'] = (data[2] || '').replace(/^0+/, '') || '0';
    record['Status'] = '0';
    record['ToAccountingEntity'] = data[2] || '';
    record['AccountCode'] = (data[4] || '').substring(0, 6);
    record['GeneralLedgerEvent'] = (data[5] || '') == '' ? 'TC' : data[5] || '';
    record['JournalCode'] = (data[15] || '').trim();
    record['TransactionDate'] = (function() {
      var dateStr = data[17] || '';
      if (dateStr.length === 8) return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      return dateStr;
    })();
    record['Reference'] = data[7] || '';
    record['Description'] = data[8] || '';
    record['CurrencyCode'] = data[9] || '';
    record['UnitsAmount'] = '0';
    record['TransactionAmount'] = data[11] || '';
    record['System'] = (data[14] || '') == '' ? 'GL' : data[14] || '';
    record['AutoReverse'] = (data[16] || '') == '' ? 'N' : data[16] || '';
    record['PostingDate'] = (function() {
      var dateStr = data[17] || '';
      if (dateStr.length === 8) return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      return dateStr;
    })();
    record['Project'] = data[18] || '';
    record['FinanceDimension1'] = (data[3] || '').slice(-3);
    record['FinanceDimension3'] = data[19] || '';
    record['DocumentNumber'] = data[20] || '';
    
    results.push(record);
  }
  
  return results;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    mapCernerGLTransaction: mapCernerGLTransaction
  };
}
