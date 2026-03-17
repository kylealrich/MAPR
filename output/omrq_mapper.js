// ============================================================
// OMRQ Fixed-Length Mapper - Runtime Flexible
// Generated: 2026-03-17
// Input: omrq.bcs.20250405101502.txt
// Mapping: Fixed Length Mapping.csv
// Mode: Runtime Flexible (Dynamic)
// Record Type: H (Header) - Single Record Type
// ============================================================

var fs = require('fs');
var path = require('path');

// ---- CSV Parser ----
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

// ---- Key Normalizer ----
function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

// ---- Position Parser ----
// Handles formats: "1", "5-Feb" (Excel-mangled "2-5"), "12-Jun" (Excel-mangled "6-12"), "19-28", etc.
function parsePosition(posStr) {
  if (!posStr || !posStr.toString().trim()) return null;
  posStr = posStr.toString().trim();

  // Direct single position: "1", "135", etc.
  if (/^\d+$/.test(posStr)) {
    var p = parseInt(posStr);
    return { start: p, end: p };
  }

  // Standard range: "19-28", "34-41", etc.
  var rangeMatch = posStr.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    var a = parseInt(rangeMatch[1]);
    var b = parseInt(rangeMatch[2]);
    return { start: Math.min(a, b), end: Math.max(a, b) };
  }

  // Excel-mangled month format: "5-Feb" => 2-5, "12-Jun" => 6-12, "13-18" already handled above
  var monthMap = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  var monthMatch = posStr.match(/^(\d+)-([A-Za-z]+)$/);
  if (monthMatch) {
    var num = parseInt(monthMatch[1]);
    var monthNum = monthMap[monthMatch[2].toLowerCase()];
    if (monthNum !== undefined) {
      return { start: Math.min(num, monthNum), end: Math.max(num, monthNum) };
    }
  }

  return null;
}

// ---- Fixed-Length Field Extractor ----
function extractField(line, start, end) {
  // Positions are 1-based in the mapping
  return line.substring(start - 1, end);
}

// ---- Transformation Functions ----
var incrementCounter = 0;

function applyTransform(value, remarks, fieldName) {
  // Always trim the raw extracted value first
  var trimmed = (value || '').trim();
  if (!remarks) return trimmed;
  var r = remarks.toLowerCase().trim();

  // Trim leading zeroes
  if (r.indexOf('trim leading zeroes') !== -1 || r.indexOf('trim leading zeros') !== -1) {
    var result = trimmed.replace(/^0+/, '');
    // Also check if the remaining value is all zeros -> BLANK
    if (r.indexOf('translate string of zero value to blank') !== -1 && /^0*$/.test(trimmed)) {
      return '';
    }
    return result || '';
  }

  // Translate string of zero value to BLANK
  if (r.indexOf('translate string of zero value to blank') !== -1) {
    if (/^0+$/.test(trimmed) || trimmed === '0') {
      return '';
    }
    return trimmed;
  }

  // Translate to Boolean (Y/N -> true/false)
  if (r.indexOf('translate to boolean') !== -1) {
    var v = trimmed.toUpperCase();
    if (v === 'Y' || v === 'YES') return 'true';
    if (v === 'N' || v === 'NO') return 'false';
    return v;
  }

  // Translate to equivalent value (for OneSourceOnePO)
  if (r.indexOf('translate to equivalent value') !== -1) {
    return trimmed;
  }

  // Expected to be BLANK
  if (r.indexOf('expected to be blank') !== -1) {
    return trimmed;
  }

  // Take value as-is / crosswalk / assumed to be the same
  if (r.indexOf('take the value') !== -1 || r.indexOf('as it is') !== -1 ||
      r.indexOf('crosswalk') !== -1 || r.indexOf('assumed to be the same') !== -1) {
    return trimmed;
  }

  // Date format translation
  if (r.indexOf('translate to required date format') !== -1) {
    // If all zeros, treat as blank
    if (/^0+$/.test(trimmed)) return '';
    return trimmed;
  }

  return trimmed;
}

// ---- Load Mapping Configuration ----
function loadMappingConfig(mappingFilePath) {
  var mappingText = fs.readFileSync(mappingFilePath, 'utf8');
  var rows = parseCSV(mappingText, ',');
  if (rows.length < 2) {
    throw new Error('Mapping file must have at least a header row and one data row.');
  }

  var headers = rows[0].map(normalizeKey);
  var rules = [];

  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (rows[i][j] || '').trim();
    }

    // Skip continuation/description rows (no position)
    var pos = parsePosition(obj['position']);
    if (!pos) continue;

    // Skip rows without a field name
    var fieldName = obj['fieldname'] || obj['field name'] || '';
    if (!fieldName) continue;

    rules.push({
      position: pos,
      fieldName: fieldName,
      fieldType: obj['fieldtypeandlength'] || obj['field type and length'] || '',
      description: obj['description'] || '',
      sampleValues: obj['samplevalues'] || obj['sample values'] || '',
      tableField: obj['table-field'] || obj['tablefield'] || '',
      field: obj['field'] || '',
      remarks: obj['remarks'] || ''
    });
  }

  return rules;
}

// ---- Extract Record from Fixed-Length Line ----
function extractRecord(line, rules) {
  var record = {};
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var rawValue = extractField(line, rule.position.start, rule.position.end);
    var transformed = applyTransform(rawValue, rule.remarks, rule.fieldName);
    record[rule.fieldName] = transformed;
  }
  return record;
}

// ---- CSV Output Escaping ----
function escapeCSV(value) {
  var v = (value != null) ? value.toString() : '';
  if (/[",\n\r]/.test(v)) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

// ---- Main Processing Function ----
function processFixedLength(inputFilePath, mappingFilePath, outputFilePath) {
  console.log('=== OMRQ Fixed-Length Mapper ===');
  console.log('Input:   ' + inputFilePath);
  console.log('Mapping: ' + mappingFilePath);
  console.log('Output:  ' + outputFilePath);
  console.log('');

  // Load mapping rules
  var rules = loadMappingConfig(mappingFilePath);
  console.log('Loaded ' + rules.length + ' mapping rules.');

  // Read input file
  var inputText = fs.readFileSync(inputFilePath, 'utf8');
  var lines = inputText.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  console.log('Read ' + lines.length + ' line(s) from input file.');

  // For this single-record-type mapping, we process the H (Header) records
  // The mapping file defines Header record layout starting at position 1 with Record Type = 'H'
  // Filter lines that start with 'H' for header records
  var targetLines = [];
  for (var i = 0; i < lines.length; i++) {
    var recType = lines[i].charAt(0);
    if (recType === 'H') {
      targetLines.push(lines[i]);
    }
  }
  console.log('Found ' + targetLines.length + ' Header (H) record(s) to process.');

  if (targetLines.length === 0) {
    console.log('WARNING: No Header records found. Processing all lines instead.');
    targetLines = lines;
  }

  // Reset increment counter
  incrementCounter = 0;

  // Extract headers from rules
  var csvHeaders = rules.map(function(r) { return r.fieldName; });

  // Process each record
  var outputRows = [];
  var errors = [];

  for (var i = 0; i < targetLines.length; i++) {
    try {
      var record = extractRecord(targetLines[i], rules);
      var row = csvHeaders.map(function(h) {
        return escapeCSV(record[h]);
      });
      outputRows.push(row.join(','));
    } catch (err) {
      errors.push('Row ' + (i + 1) + ': ' + err.message);
    }
  }

  // Build CSV output
  var csvOutput = csvHeaders.join(',') + '\n' + outputRows.join('\n') + '\n';

  // Write output file
  var outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFilePath, csvOutput, 'utf8');

  console.log('');
  console.log('Processing complete.');
  console.log('Records processed: ' + outputRows.length);
  if (errors.length > 0) {
    console.log('Errors encountered: ' + errors.length);
    errors.forEach(function(e) { console.log('  - ' + e); });
  }
  console.log('Output written to: ' + outputFilePath);

  return {
    success: true,
    recordsProcessed: outputRows.length,
    errors: errors,
    csvOutput: csvOutput,
    headers: csvHeaders
  };
}

// ---- Execute ----
var inputFile = path.resolve(__dirname, '..', 'input', 'omrq.bcs.20250405101502.txt');
var mappingFile = path.resolve(__dirname, '..', 'input', 'Fixed Length Mapping.csv');
var outputFile = path.resolve(__dirname, 'omrq_mapped_output.csv');

var result = processFixedLength(inputFile, mappingFile, outputFile);

if (!result.success) {
  console.error('Processing failed.');
  process.exit(1);
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    parsePosition: parsePosition,
    extractField: extractField,
    applyTransform: applyTransform,
    loadMappingConfig: loadMappingConfig,
    extractRecord: extractRecord,
    processFixedLength: processFixedLength
  };
}