// OMRQ Multi-Record Fixed-Length Mapper (Runtime Flexible)
// Generated: 2026-03-17
// Input: omrq.bcs.20250405101502.txt
// Type: Fixed-Length Multi-Record (Header/Line/Detail/Comment)

var fs = require('fs');
var path = require('path');

// ============================================================
// CSV Parser
// ============================================================
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  });
}

function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

// ============================================================
// Global counter for Increment By 1
// ============================================================
var incrementCounter = 0;

// ============================================================
// Transformation Logic Engine
// ============================================================
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
    if (col) return (data[col[1] - 1] || '').replace(/^0+/, '') || '0';
  }
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').trim();
  }
  if (/^Concat\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return cols.map(function(c) { var n = c.match(/\d+/)[0]; return data[n - 1] || ''; }).join('');
  }
  if (/^Sum\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) {
      var sum = 0;
      cols.forEach(function(col) {
        var n = col.match(/\d+/)[0];
        var val = data[n - 1] || '0';
        if (!/^-?\d*\.?\d+$/.test(val.toString().trim())) throw new Error('Non-numeric value in Sum: ' + val);
        sum += parseFloat(val);
      });
      return sum;
    }
  }
  if (/^Uppercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').toUpperCase();
  }
  if (/^Lowercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').toLowerCase();
  }
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1] - 1] || '').substring(0, parseInt(match[2]));
  }
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1] - 1] || '').slice(-parseInt(match[2]));
  }
  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var dateStr = data[match[1] - 1] || '';
      var inputFormat = match[2].toUpperCase();
      var outputFormat = match[3].toUpperCase();
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }
  if (/^Today\(/i.test(logic)) {
    var today = new Date();
    function pad(n) { return n < 10 ? '0' + n : n; }
    var match = logic.match(/Today\('([^']*)'\)/i);
    if (match) {
      switch (match[1].toUpperCase()) {
        case 'YYYYMMDD': return today.getFullYear() + '' + pad(today.getMonth() + 1) + pad(today.getDate());
        case 'MM/DD/YYYY': return pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();
        default: return today.toLocaleDateString('en-US');
      }
    }
    return today.toLocaleDateString('en-US');
  }
  if (/^Now\(/i.test(logic)) {
    return new Date().toLocaleString('en-US');
  }

  // Conditional Logic
  if (/^If\s/i.test(logic)) {
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var condRef = simpleMatch[1].trim();
      if (/Column(\d+)/i.test(condRef)) {
        var colNum = condRef.match(/Column(\d+)/i)[1];
        condRef = data[colNum - 1] || '';
      }
      var op = simpleMatch[2];
      var cmpVal = simpleMatch[3];
      var thenRes = simpleMatch[4];
      var elseRes = simpleMatch[5] || '';
      if (/Column(\d+)/i.test(thenRes)) { thenRes = data[thenRes.match(/Column(\d+)/i)[1] - 1] || ''; }
      if (/Column(\d+)/i.test(elseRes)) { elseRes = data[elseRes.match(/Column(\d+)/i)[1] - 1] || ''; }
      var cond = false;
      if (op === '==' || op === '=') cond = condRef == cmpVal;
      else if (op === '!=') cond = condRef != cmpVal;
      else if (op === '>') cond = parseFloat(condRef) > parseFloat(cmpVal);
      else if (op === '<') cond = parseFloat(condRef) < parseFloat(cmpVal);
      else if (op === '>=') cond = parseFloat(condRef) >= parseFloat(cmpVal);
      else if (op === '<=') cond = parseFloat(condRef) <= parseFloat(cmpVal);
      return cond ? thenRes : elseRes;
    }
  }

  // Static values in quotes
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  // Column reference
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
}

// ============================================================
// Fixed-Length Field Extractor
// ============================================================
function extractFixedFields(line, mappingRules) {
  var data = [];
  for (var i = 0; i < mappingRules.length; i++) {
    var rule = mappingRules[i];
    var start = rule.start - 1;
    var end = rule.end;
    var raw = line.substring(start, end);
    data.push(raw);
  }
  return data;
}

// ============================================================
// Load and Parse Mapping File
// ============================================================
function loadMapping(filePath) {
  var text = fs.readFileSync(filePath, 'utf8');
  var rows = parseCSV(text, ',');
  var headers = rows[0].map(normalizeKey);
  var rules = [];

  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (rows[i][j] || '').trim();
    }
    rules.push({
      fieldName: obj['fieldname'] || obj['field name'] || '',
      start: parseInt(obj['start']) || 0,
      end: parseInt(obj['end']) || 0,
      length: parseInt(obj['length']) || 0,
      required: (obj['required'] || '').toUpperCase() === 'Y',
      mappingLogic: obj['mappinglogic'] || obj['mapping logic'] || '',
      padCharacter: obj['padcharacter'] || obj['pad character'] || ' ',
      justify: (obj['justify'] || 'left').toLowerCase(),
      defaultValue: obj['defaultvalue'] || obj['default value'] || '',
      description: obj['description'] || ''
    });
  }
  return rules;
}

// ============================================================
// Load Record Type Config
// ============================================================
function loadRecordTypeConfig(filePath) {
  var text = fs.readFileSync(filePath, 'utf8');
  var rows = parseCSV(text, ',');
  var headers = rows[0].map(normalizeKey);
  var config = [];

  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (rows[i][j] || '').trim();
    }
    config.push({
      recordType: obj['recordtype'] || obj['record type'] || '',
      typeIndicatorPos: parseInt(obj['typeindicatorposition'] || obj['type indicator position']) || 1,
      typeIndicatorValue: obj['typeindicatorvalue'] || obj['type indicator value'] || '',
      mappingFile: obj['mappingfile'] || obj['mapping file'] || '',
      parentRecordType: obj['parentrecordtype'] || obj['parent record type'] || '',
      outputName: obj['outputname'] || obj['output name'] || ''
    });
  }
  return config;
}

// ============================================================
// Transform a Single Fixed-Length Record
// ============================================================
function transformRecord(line, mappingRules, rowIndex) {
  var data = extractFixedFields(line, mappingRules);
  var record = {};
  var errors = [];

  for (var i = 0; i < mappingRules.length; i++) {
    var rule = mappingRules[i];
    var fieldName = rule.fieldName;
    var value = null;

    try {
      if (rule.mappingLogic && rule.mappingLogic.trim()) {
        value = applyLogic(rule.mappingLogic, data, fieldName, rowIndex);
      } else {
        value = (data[i] || '').trim();
      }
    } catch (e) {
      errors.push('Field "' + fieldName + '": ' + e.message);
      value = (data[i] || '').trim();
    }

    // Apply default if empty
    if ((!value || !value.toString().trim()) && rule.defaultValue) {
      value = rule.defaultValue;
    }

    // Trim the value
    if (value !== null && value !== undefined) {
      value = value.toString().trim();
    }

    // Required field check
    if (rule.required && (!value || !value.toString().trim())) {
      errors.push('Required field "' + fieldName + '" is empty at row ' + (rowIndex + 1));
    }

    record[fieldName] = value;
  }

  return { record: record, errors: errors };
}

// ============================================================
// CSV Escape Helper
// ============================================================
function csvEscape(val) {
  var v = val != null ? val.toString() : '';
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

// ============================================================
// Detect Uniform Record Length from Single-Line Input
// ============================================================
function detectRecordLength(text, recordTypes) {
  // Build set of valid type indicator values
  var validTypes = {};
  for (var r = 0; r < recordTypes.length; r++) {
    validTypes[recordTypes[r].typeIndicatorValue] = true;
  }

  // Scan for record start positions (type indicator followed by digits)
  var positions = [];
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    if (validTypes[ch]) {
      var next4 = text.substring(i + 1, i + 5);
      if (/^\d{4}$/.test(next4)) {
        positions.push(i);
      }
    }
  }

  if (positions.length < 2) return 0;

  // Calculate the gap between first two records as the uniform length
  var recordLen = positions[1] - positions[0];

  // Verify all gaps are consistent
  for (var i = 2; i < positions.length; i++) {
    if (positions[i] - positions[i - 1] !== recordLen) {
      console.log('WARNING: Non-uniform record lengths detected. Gap at record ' + i + ': ' + (positions[i] - positions[i - 1]) + ' vs expected ' + recordLen);
      return 0;
    }
  }

  return recordLen;
}

// ============================================================
// Main Multi-Record Processing
// ============================================================
function processMultiRecord(inputFile, configFile, inputDir) {
  console.log('=== OMRQ Multi-Record Fixed-Length Mapper ===');
  console.log('Input file: ' + inputFile);
  console.log('Config file: ' + configFile);
  console.log('');

  // Load record type config
  var configPath = path.join(inputDir, configFile);
  var recordTypes = loadRecordTypeConfig(configPath);
  console.log('Record types found: ' + recordTypes.length);

  // Load mapping rules for each record type
  var mappings = {};
  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    var mappingPath = path.join(inputDir, rt.mappingFile);
    console.log('Loading mapping: ' + rt.recordType + ' -> ' + rt.mappingFile);
    mappings[rt.typeIndicatorValue] = {
      config: rt,
      rules: loadMapping(mappingPath)
    };
  }

  // Read input file
  var inputPath = path.join(inputDir, inputFile);
  var rawInput = fs.readFileSync(inputPath, 'utf8');

  // Split into individual records
  var lines = [];
  if (rawInput.indexOf('\n') !== -1 || rawInput.indexOf('\r') !== -1) {
    // Multi-line file: each line is a record
    lines = rawInput.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
    console.log('Input format: Multi-line (' + lines.length + ' lines)');
  } else {
    // Single-line file: detect uniform record length
    var recordLen = detectRecordLength(rawInput, recordTypes);
    if (recordLen > 0) {
      console.log('Input format: Single-line, detected record length: ' + recordLen);
      var pos = 0;
      while (pos + recordLen <= rawInput.length) {
        lines.push(rawInput.substring(pos, pos + recordLen));
        pos += recordLen;
      }
      // Handle any trailing partial record
      if (pos < rawInput.length) {
        var remainder = rawInput.substring(pos).trim();
        if (remainder.length > 0) {
          lines.push(remainder);
        }
      }
    } else {
      console.log('WARNING: Could not detect uniform record length. Treating as single record.');
      lines.push(rawInput);
    }
  }

  console.log('Total records found: ' + lines.length);
  console.log('');

  // Process each record
  var results = {};
  var allErrors = [];
  var counters = {};

  // Initialize result containers per record type
  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    results[rt.typeIndicatorValue] = [];
    counters[rt.typeIndicatorValue] = 0;
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || !line.trim()) continue;

    // Determine record type from indicator position
    var typeChar = null;
    for (var r = 0; r < recordTypes.length; r++) {
      var rt = recordTypes[r];
      var indicatorPos = rt.typeIndicatorPos - 1;
      var charAtPos = line.charAt(indicatorPos);
      if (charAtPos === rt.typeIndicatorValue) {
        typeChar = rt.typeIndicatorValue;
        break;
      }
    }

    if (!typeChar || !mappings[typeChar]) {
      allErrors.push('Unknown record type at record ' + (i + 1) + ': "' + line.charAt(0) + '"');
      continue;
    }

    var mapping = mappings[typeChar];
    counters[typeChar]++;

    var result = transformRecord(line, mapping.rules, i);
    results[typeChar].push(result.record);

    if (result.errors.length > 0) {
      allErrors = allErrors.concat(result.errors);
    }
  }

  // Print summary
  console.log('--- Processing Summary ---');
  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    console.log(rt.recordType + ' (' + rt.typeIndicatorValue + '): ' + counters[rt.typeIndicatorValue] + ' records');
  }
  if (allErrors.length > 0) {
    console.log('');
    console.log('Warnings/Errors: ' + allErrors.length);
    allErrors.forEach(function(e) { console.log('  - ' + e); });
  }
  console.log('');

  return {
    results: results,
    recordTypes: recordTypes,
    mappings: mappings,
    errors: allErrors,
    counters: counters
  };
}

// ============================================================
// Generate CSV Output for Each Record Type
// ============================================================
function generateCSVOutputs(processedData, outputDir) {
  var recordTypes = processedData.recordTypes;
  var results = processedData.results;
  var mappings = processedData.mappings;
  var outputFiles = [];

  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    var typeVal = rt.typeIndicatorValue;
    var records = results[typeVal];
    var rules = mappings[typeVal].rules;

    if (records.length === 0) continue;

    // Build headers from field names
    var headers = rules.map(function(rule) { return rule.fieldName; });

    // Build CSV lines
    var csvLines = [headers.map(csvEscape).join(',')];
    records.forEach(function(rec) {
      var row = headers.map(function(h) { return csvEscape(rec[h]); });
      csvLines.push(row.join(','));
    });

    var outputName = rt.outputName || rt.recordType;
    var outputFile = 'OMRQ_' + outputName + '_Output.csv';
    var outputPath = path.join(outputDir, outputFile);

    fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
    console.log('Generated: ' + outputFile + ' (' + records.length + ' records)');
    outputFiles.push({ file: outputFile, recordType: rt.recordType, count: records.length });
  }

  return outputFiles;
}

// ============================================================
// Generate Combined CSV Output (All Record Types)
// ============================================================
function generateCombinedCSV(processedData, outputDir) {
  var recordTypes = processedData.recordTypes;
  var results = processedData.results;
  var mappings = processedData.mappings;

  // Collect all unique field names across all record types
  var allFields = ['_RecordType'];
  var fieldSet = { '_RecordType': true };

  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    var rules = mappings[rt.typeIndicatorValue].rules;
    rules.forEach(function(rule) {
      var key = rule.fieldName;
      if (!fieldSet[key]) {
        allFields.push(key);
        fieldSet[key] = true;
      }
    });
  }

  // Build combined CSV
  var csvLines = [allFields.map(csvEscape).join(',')];

  for (var r = 0; r < recordTypes.length; r++) {
    var rt = recordTypes[r];
    var records = results[rt.typeIndicatorValue];
    records.forEach(function(rec) {
      var row = allFields.map(function(f) {
        if (f === '_RecordType') return csvEscape(rt.recordType);
        return csvEscape(rec[f] || '');
      });
      csvLines.push(row.join(','));
    });
  }

  var outputFile = 'OMRQ_Combined_Output.csv';
  var outputPath = path.join(outputDir, outputFile);
  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
  console.log('Generated: ' + outputFile + ' (all records combined)');

  return outputFile;
}

// ============================================================
// Main Execution
// ============================================================
function main() {
  var inputDir = path.join(__dirname, '..', 'input');
  var outputDir = __dirname;

  var inputFile = 'omrq.bcs.20250405101502.txt';
  var configFile = 'OMRQ_RecordType_Config.csv';

  try {
    var processed = processMultiRecord(inputFile, configFile, inputDir);

    console.log('--- Generating Output Files ---');
    var outputFiles = generateCSVOutputs(processed, outputDir);
    generateCombinedCSV(processed, outputDir);

    console.log('');
    console.log('=== Processing Complete ===');
    console.log('Total errors: ' + processed.errors.length);

    return {
      success: true,
      outputFiles: outputFiles,
      errors: processed.errors
    };
  } catch (error) {
    console.error('FATAL ERROR: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run
main();

// ============================================================
// Module Exports for IPA Integration
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    applyLogic: applyLogic,
    loadMapping: loadMapping,
    loadRecordTypeConfig: loadRecordTypeConfig,
    transformRecord: transformRecord,
    processMultiRecord: processMultiRecord,
    generateCSVOutputs: generateCSVOutputs,
    generateCombinedCSV: generateCombinedCSV
  };
}
