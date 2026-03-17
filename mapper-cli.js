#!/usr/bin/env node
// JavaScript Mapper CLI - Standalone Executable
// Replicates all mapper-core.js functionality as a command-line tool

var fs = require('fs');
var path = require('path');
var readline = require('readline');

// ============================================================
// CORE MAPPER ENGINE (from mapper-core.js)
// ============================================================

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

// Global counter for Increment By 1
var incrementCounter = 0;

// Apply Logic Directly
function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();

  // Increment By 1
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }

  // Hardcode
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  // RemoveLeadingZeroes
  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }

  // RemoveTrailingSpaces
  if (/^RemoveTrailingSpaces\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/\s+$/, '');
  }

  // Trim
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').trim();
  }

  // Concat
  if (/^Concat\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return cols.map(function(c) { var n = c.match(/\d+/)[0]; return data[n-1] || ''; }).join('');
  }

  // Substring
  if (/^Substring\(/i.test(logic)) {
    var match = logic.match(/Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(parseInt(match[2]) - 1, parseInt(match[2]) - 1 + parseInt(match[3]));
  }

  // Sum
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

  // Multiply
  if (/^Multiply\(/i.test(logic)) {
    var match = logic.match(/Multiply\(Column(\d+),\s*Column(\d+)\)/i);
    if (match) {
      var v1 = parseFloat(data[match[1]-1] || '0');
      var v2 = parseFloat(data[match[2]-1] || '0');
      return v1 * v2;
    }
  }

  // Divide
  if (/^Divide\(/i.test(logic)) {
    var match = logic.match(/Divide\(Column(\d+),\s*Column(\d+)\)/i);
    if (match) {
      var v1 = parseFloat(data[match[1]-1] || '0');
      var v2 = parseFloat(data[match[2]-1] || '1');
      if (v2 === 0) throw new Error('Division by zero in field: ' + field);
      return v1 / v2;
    }
  }

  // Round
  if (/^Round\(/i.test(logic)) {
    var match = logic.match(/Round\(Column(\d+),\s*(\d+)\)/i);
    if (match) {
      var val = parseFloat(data[match[1]-1] || '0');
      var dec = parseInt(match[2]);
      return parseFloat(val.toFixed(dec));
    }
  }

  // Abs
  if (/^Abs\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return Math.abs(parseFloat(data[col[1]-1] || '0'));
  }

  // Max
  if (/^Max\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) {
      var vals = cols.map(function(c) { var n = c.match(/\d+/)[0]; return parseFloat(data[n-1] || '0'); });
      return Math.max.apply(null, vals);
    }
  }

  // Min
  if (/^Min\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) {
      var vals = cols.map(function(c) { var n = c.match(/\d+/)[0]; return parseFloat(data[n-1] || '0'); });
      return Math.min.apply(null, vals);
    }
  }

  // Uppercase
  if (/^Uppercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').toUpperCase();
  }

  // Lowercase
  if (/^Lowercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').toLowerCase();
  }

  // Left
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(0, parseInt(match[2]));
  }

  // Right
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').slice(-parseInt(match[2]));
  }

  // Replace
  if (/^Replace\(/i.test(logic)) {
    var match = logic.match(/Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) return (data[match[1]-1] || '').split(match[2]).join(match[3]);
  }

  // PadLeft
  if (/^PadLeft\(/i.test(logic)) {
    var match = logic.match(/PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (match) {
      var val = (data[match[1]-1] || '').toString();
      var len = parseInt(match[2]);
      var ch = match[3];
      while (val.length < len) val = ch + val;
      return val;
    }
  }

  // PadRight
  if (/^PadRight\(/i.test(logic)) {
    var match = logic.match(/PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (match) {
      var val = (data[match[1]-1] || '').toString();
      var len = parseInt(match[2]);
      var ch = match[3];
      while (val.length < len) val = val + ch;
      return val;
    }
  }

  // AddLeft
  if (/^AddLeft\(/i.test(logic)) {
    var match = logic.match(/AddLeft\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (match) {
      var val = (data[match[1]-1] || '').toString();
      var ch = match[2];
      var count = parseInt(match[3]);
      for (var i = 0; i < count; i++) val = ch + val;
      return val;
    }
  }

  // AddRight
  if (/^AddRight\(/i.test(logic)) {
    var match = logic.match(/AddRight\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (match) {
      var val = (data[match[1]-1] || '').toString();
      var ch = match[2];
      var count = parseInt(match[3]);
      for (var i = 0; i < count; i++) val = val + ch;
      return val;
    }
  }

  // String concatenation with + operator
  if (/\+/.test(logic) && !/^If\s/i.test(logic)) {
    return logic.replace(/Right\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col-1] || '').slice(-parseInt(len));
    }).replace(/Left\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col-1] || '').substring(0, parseInt(len));
    }).replace(/Column(\d+)/gi, function(match, col) {
      return data[col-1] || '';
    }).replace(/\s*\+\s*/g, '');
  }

  // Conditional Logic - If...ElseIf...Else
  if (/^If\s/i.test(logic)) {
    // Handle ElseIf chains
    var elseIfMatch = logic.match(/^If\s+(.+?)\s+Then\s+'([^']*)'\s+ElseIf\s+(.+?)\s+Then\s+'([^']*)'\s+Else\s+'([^']*)'/i);
    if (elseIfMatch) {
      var cond1 = evaluateCondition(elseIfMatch[1], data);
      if (cond1) return elseIfMatch[2];
      var cond2 = evaluateCondition(elseIfMatch[3], data);
      if (cond2) return elseIfMatch[4];
      return elseIfMatch[5];
    }

    // Simple If...Then...Else
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var conditionRef = simpleMatch[1].trim();
      if (/Column(\d+)/i.test(conditionRef)) {
        var colNum = conditionRef.match(/Column(\d+)/i)[1];
        conditionRef = data[colNum - 1] || '';
      }
      // Handle function in condition (e.g., Left(Column1, 1))
      if (/^Left\(/i.test(conditionRef)) {
        var lm = conditionRef.match(/Left\(Column(\d+),\s*(\d+)\)/i);
        if (lm) conditionRef = (data[lm[1]-1] || '').substring(0, parseInt(lm[2]));
      }
      if (/^Right\(/i.test(conditionRef)) {
        var rm = conditionRef.match(/Right\(Column(\d+),\s*(\d+)\)/i);
        if (rm) conditionRef = (data[rm[1]-1] || '').slice(-parseInt(rm[2]));
      }

      var operator = simpleMatch[2];
      var compareValue = simpleMatch[3];
      var thenResult = simpleMatch[4];
      var elseResult = simpleMatch[5] || '';

      // Replace Column references in results
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
      else if (operator === '>') condition = parseFloat(conditionRef) > parseFloat(compareValue);
      else if (operator === '<') condition = parseFloat(conditionRef) < parseFloat(compareValue);
      else if (operator === '>=') condition = parseFloat(conditionRef) >= parseFloat(compareValue);
      else if (operator === '<=') condition = parseFloat(conditionRef) <= parseFloat(compareValue);

      return condition ? thenResult : elseResult;
    }
  }

  // IsEmpty
  if (/^IsEmpty\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return !(data[col[1]-1] || '').trim() ? 'true' : 'false';
  }

  // IsNumeric
  if (/^IsNumeric\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return /^-?\d*\.?\d+$/.test((data[col[1]-1] || '').trim()) ? 'true' : 'false';
  }

  // ValidateLength
  if (/^ValidateLength\(/i.test(logic)) {
    var match = logic.match(/ValidateLength\(Column(\d+),\s*(\d+),\s*(\d+)\)/i);
    if (match) {
      var val = (data[match[1]-1] || '');
      var min = parseInt(match[2]);
      var max = parseInt(match[3]);
      if (val.length < min || val.length > max) throw new Error('Length validation failed for ' + field + ': ' + val.length + ' not in [' + min + ',' + max + ']');
      return val;
    }
  }

  // ValidateRange
  if (/^ValidateRange\(/i.test(logic)) {
    var match = logic.match(/ValidateRange\(Column(\d+),\s*(\d+),\s*(\d+)\)/i);
    if (match) {
      var val = parseFloat(data[match[1]-1] || '0');
      var min = parseFloat(match[2]);
      var max = parseFloat(match[3]);
      if (val < min || val > max) throw new Error('Range validation failed for ' + field + ': ' + val + ' not in [' + min + ',' + max + ']');
      return val;
    }
  }

  // Static values in quotes
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  // Today()
  if (/^Today\(/i.test(logic)) {
    var today = new Date();
    var match = logic.match(/Today\('([^']*)'\)/i);
    if (match) {
      var format = match[1];
      function pad(n) { return n < 10 ? '0' + n : n; }
      switch(format.toUpperCase()) {
        case 'YYYYMMDD': return today.getFullYear() + '' + pad(today.getMonth() + 1) + '' + pad(today.getDate());
        case 'YYYY-MM-DD': return today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
        case 'MM/DD/YYYY': return pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();
        default: return today.toLocaleDateString('en-US');
      }
    }
    return today.toLocaleDateString('en-US');
  }

  // Now()
  if (/^Now\(/i.test(logic)) {
    return new Date().toLocaleString('en-US');
  }

  // DateReformat
  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var dateStr = (data[match[1]-1] || '').trim();
      var inputFormat = match[2].toUpperCase();
      var outputFormat = match[3].toUpperCase();
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      if (inputFormat === 'YYYYMMDD' && outputFormat === 'MM/DD/YYYY' && dateStr.length === 8) {
        return dateStr.substring(4, 6) + '/' + dateStr.substring(6, 8) + '/' + dateStr.substring(0, 4);
      }
      if (inputFormat === 'MMDDYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 6) {
        var yr = parseInt(dateStr.substring(4, 6));
        var fullYear = yr > 50 ? '19' + dateStr.substring(4, 6) : '20' + dateStr.substring(4, 6);
        return fullYear + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }

  // Unquoted static values (no Column reference, no function)
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|RemoveTrailingSpaces|Trim|Concat|Substring|Sum|Multiply|Divide|Round|Abs|Max|Min|Uppercase|Lowercase|Left|Right|Replace|PadLeft|PadRight|AddLeft|AddRight|If|Today|Now|Increment|DateReformat|IsEmpty|IsNumeric|ValidateLength|ValidateRange|ValidateFormat)/i.test(logic) && !/\+/.test(logic)) {
    return logic;
  }

  // Direct Column reference
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
}

// Helper for evaluating conditions in ElseIf chains
function evaluateCondition(condStr, data) {
  var match = condStr.match(/([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^']*)'?/);
  if (!match) return false;
  var left = match[1].trim();
  if (/Column(\d+)/i.test(left)) {
    var colNum = left.match(/Column(\d+)/i)[1];
    left = data[colNum - 1] || '';
  }
  var op = match[2];
  var right = match[3];
  if (op === '==' || op === '=') return left == right;
  if (op === '!=') return left != right;
  if (op === '>') return parseFloat(left) > parseFloat(right);
  if (op === '<') return parseFloat(left) < parseFloat(right);
  if (op === '>=') return parseFloat(left) >= parseFloat(right);
  if (op === '<=') return parseFloat(left) <= parseFloat(right);
  return false;
}

// Create Dynamic Mapper from parsed mapping data
function createDynamicMapper(mappingData) {
  var mappingRules = [];
  var headers = [];
  incrementCounter = 0;

  mappingData.forEach(function(m) {
    var field = m['targetfieldname'] || m['fieldname'] || '';
    if (!field) return;
    var logic = m['mappinglogic'] || '';
    var colNum = m['inputcolumnnumber'] || '';
    var required = (m['required'] || '').toUpperCase() === 'Y';

    mappingRules.push({
      field: field,
      logic: logic,
      colNum: colNum ? parseInt(colNum) - 1 : null,
      required: required
    });
    headers.push(field);
  });

  return {
    mapRecord: function(data, rowIndex) {
      var record = {};
      function safeGet(d, i, f) {
        if (i >= d.length) throw new Error('Column ' + (i + 1) + ' missing for "' + f + '"');
        return d[i] || '';
      }
      mappingRules.forEach(function(rule) {
        var value;
        if (rule.logic && rule.logic.trim()) {
          value = applyLogic(rule.logic, data, rule.field, rowIndex);
        } else if (rule.colNum !== null) {
          value = safeGet(data, rule.colNum, rule.field);
        } else {
          value = null;
        }
        record[rule.field] = value;
      });
      return record;
    },
    headers: headers
  };
}

// ============================================================
// FIXED-LENGTH PROCESSING
// ============================================================

// Parse fixed-length mapping CSV
function parseFixedLengthMapping(mappingText) {
  var rows = parseCSV(mappingText, ',');
  var headers = rows[0].map(normalizeKey);
  var fields = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (rows[i][j] || '').trim();
    }
    if (obj['fieldname'] || obj['field name']) {
      fields.push({
        fieldName: obj['fieldname'] || obj['field name'] || '',
        start: parseInt(obj['start'] || '1') - 1,
        end: parseInt(obj['end'] || '1'),
        length: parseInt(obj['length'] || '0'),
        required: (obj['required'] || '').toUpperCase() === 'Y',
        padChar: obj['padcharacter'] || obj['pad character'] || ' ',
        justify: (obj['justify'] || 'Left').trim(),
        defaultValue: obj['defaultvalue'] || obj['default value'] || '',
        mappingLogic: obj['mappinglogic'] || obj['mapping logic'] || '',
        description: obj['description'] || ''
      });
    }
  }
  return fields;
}

// Extract fixed-length field from a line
function extractFixedField(line, start, end) {
  return line.substring(start, end);
}

// Process fixed-length single record type
function processFixedLength(inputText, mappingFields) {
  var lines = inputText.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  var headers = mappingFields.map(function(f) { return f.fieldName; });
  var results = [];
  incrementCounter = 0;

  lines.forEach(function(line, rowIndex) {
    var record = {};
    var extractedData = [];
    // Extract all fields first as "columns"
    mappingFields.forEach(function(f) {
      extractedData.push(extractFixedField(line, f.start, f.end).trim());
    });

    mappingFields.forEach(function(f, idx) {
      var value;
      if (f.mappingLogic && f.mappingLogic.trim()) {
        // For fixed-length, Column references point to extracted field positions
        value = applyLogic(f.mappingLogic, extractedData, f.fieldName, rowIndex);
      } else if (f.defaultValue) {
        value = f.defaultValue;
      } else {
        value = extractedData[idx];
      }
      record[f.fieldName] = value != null ? value.toString() : '';
    });
    results.push(record);
  });

  return { headers: headers, results: results };
}

// Process multi-record fixed-length file
function processMultiRecord(inputText, configText, mappingFiles, inputDir) {
  var configRows = parseCSV(configText, ',');
  var configHeaders = configRows[0].map(normalizeKey);
  var recordTypes = [];

  for (var i = 1; i < configRows.length; i++) {
    var obj = {};
    for (var j = 0; j < configHeaders.length; j++) {
      obj[configHeaders[j]] = (configRows[i][j] || '').trim();
    }
    recordTypes.push({
      type: obj['recordtype'] || obj['record type'] || '',
      indicatorPos: parseInt(obj['typeindicatorposition'] || obj['type indicator position'] || '1') - 1,
      indicatorValue: obj['typeindicatorvalue'] || obj['type indicator value'] || '',
      mappingFile: obj['mappingfile'] || obj['mapping file'] || '',
      outputName: obj['outputname'] || obj['output name'] || obj['recordtype'] || obj['record type'] || ''
    });
  }

  var lines = inputText.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  var allResults = {};

  recordTypes.forEach(function(rt) {
    allResults[rt.outputName] = { headers: [], results: [] };
    // Load mapping for this record type
    var mappingText = mappingFiles[rt.mappingFile];
    if (mappingText) {
      var fields = parseFixedLengthMapping(mappingText);
      allResults[rt.outputName].headers = fields.map(function(f) { return f.fieldName; });
      incrementCounter = 0;

      lines.forEach(function(line, rowIndex) {
        var indicator = line.charAt(rt.indicatorPos);
        if (indicator === rt.indicatorValue) {
          var extractedData = [];
          fields.forEach(function(f) {
            extractedData.push(extractFixedField(line, f.start, f.end).trim());
          });
          var record = {};
          fields.forEach(function(f, idx) {
            var value;
            if (f.mappingLogic && f.mappingLogic.trim()) {
              value = applyLogic(f.mappingLogic, extractedData, f.fieldName, rowIndex);
            } else if (f.defaultValue) {
              value = f.defaultValue;
            } else {
              value = extractedData[idx];
            }
            record[f.fieldName] = value != null ? value.toString() : '';
          });
          allResults[rt.outputName].results.push(record);
        }
      });
    }
  });

  return allResults;
}

// ============================================================
// DELIMITED PROCESSING (main transform)
// ============================================================

function transformData(inputText, mappingTable, delimiter, skipRows) {
  try {
    var mappingRows = parseCSV(mappingTable, ',');
    var mappingHeaders = mappingRows[0].map(normalizeKey);
    var parsedMappings = [];

    for (var i = 1; i < mappingRows.length; i++) {
      var obj = {};
      for (var j = 0; j < mappingHeaders.length; j++) {
        obj[mappingHeaders[j]] = (mappingRows[i][j] || '').trim();
      }
      parsedMappings.push(obj);
    }

    var allData = parseCSV(inputText, delimiter);
    var inputData = allData.slice(skipRows || 0);

    var mapper = createDynamicMapper(parsedMappings);
    var headers = mapper.headers;

    var results = inputData.map(function(row, index) {
      return mapper.mapRecord(row, index);
    });

    var csvLines = [headers.join(',')];
    results.forEach(function(r) {
      var row = headers.map(function(h) {
        var v = r[h] != null ? r[h].toString() : '';
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      });
      csvLines.push(row.join(','));
    });

    return {
      success: true,
      transformedData: results,
      csvOutput: csvLines.join('\n'),
      headers: headers,
      rowCount: results.length,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      transformedData: null,
      csvOutput: null,
      headers: null,
      rowCount: 0,
      error: error.message
    };
  }
}

// ============================================================
// JS CODE GENERATOR
// ============================================================

function generateMapperJS(mappingTable, mode, delimiter) {
  var mappingRows = parseCSV(mappingTable, ',');
  var mappingHeaders = mappingRows[0].map(normalizeKey);
  var parsedMappings = [];

  for (var i = 1; i < mappingRows.length; i++) {
    var obj = {};
    for (var j = 0; j < mappingHeaders.length; j++) {
      obj[mappingHeaders[j]] = (mappingRows[i][j] || '').trim();
    }
    parsedMappings.push(obj);
  }

  var jsCode = '';
  if (mode === 'runtime') {
    jsCode = generateRuntimeFlexible(parsedMappings, delimiter);
  } else {
    jsCode = generateSelfContained(parsedMappings, delimiter);
  }
  return jsCode;
}

function generateRuntimeFlexible(mappings, delimiter) {
  var code = '// Runtime Flexible Mapper - Generated by JavaScript Mapper\n';
  code += '// Generated: ' + new Date().toISOString() + '\n';
  code += '// Mode: Runtime Flexible (Dynamic)\n\n';
  code += 'var fs = require("fs");\n\n';
  code += '// CSV Parser\n';
  code += 'function parseCSV(text, delimiter) {\n';
  code += '  var lines = text.split(/\\r?\\n/).filter(function(l) { return l.trim() !== ""; });\n';
  code += '  return lines.map(function(line) {\n';
  code += '    var result = []; var current = ""; var inQuotes = false;\n';
  code += '    for (var i = 0; i < line.length; i++) {\n';
  code += '      var c = line[i];\n';
  code += '      if (c === \'"\') { if (inQuotes && line[i+1] === \'"\') { current += \'"\'; i++; } else { inQuotes = !inQuotes; } }\n';
  code += '      else if (c === delimiter && !inQuotes) { result.push(current); current = ""; }\n';
  code += '      else { current += c; }\n';
  code += '    }\n';
  code += '    result.push(current);\n';
  code += '    return result;\n';
  code += '  });\n';
  code += '}\n\n';
  code += 'var incrementCounter = 0;\n\n';
  code += '// Transformation Logic\n';
  code += 'function applyLogic(logic, data, field, rowIndex) {\n';
  code += '  if (!logic) return null;\n';
  code += '  logic = logic.trim();\n';
  code += '  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return incrementCounter; }\n';
  code += '  if (/^Hardcode\\s+[\'\\"](.*)[\'\\"]/i.test(logic)) { return logic.match(/^Hardcode\\s+[\'\\"](.*)[\'\\"]/i)[1]; }\n';
  code += '  if (/^RemoveLeadingZeroes\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").replace(/^0+/,"") || "0"; }\n';
  code += '  if (/^Trim\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").trim(); }\n';
  code += '  if (/^Concat\\(/i.test(logic)) { var cs = logic.match(/Column(\\d+)/gi); if (cs) return cs.map(function(c){return data[c.match(/\\d+/)[0]-1]||""}).join(""); }\n';
  code += '  if (/^Left\\(/i.test(logic)) { var m = logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i); if (m) return (data[m[1]-1]||"").substring(0,parseInt(m[2])); }\n';
  code += '  if (/^Right\\(/i.test(logic)) { var m = logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i); if (m) return (data[m[1]-1]||"").slice(-parseInt(m[2])); }\n';
  code += '  if (/^DateReformat\\(/i.test(logic)) { var m = logic.match(/DateReformat\\(Column(\\d+),\\s*\'([^\']*)\',\\s*\'([^\']*)\'\\)/i); if (m) { var d=(data[m[1]-1]||"").trim(); if (m[2].toUpperCase()==="MMDDYYYY"&&m[3].toUpperCase()==="YYYYMMDD"&&d.length===8) return d.substring(4,8)+d.substring(0,4); return d; } }\n';
  code += '  if (/^If\\s/i.test(logic)) {\n';
  code += '    var sm = logic.match(/If\\s+([^!=<>]+)\\s*(==?|!=|>|<|>=|<=)\\s*\'?([^\'\\s]*)\'?\\s+Then\\s+\'?([^\'\\s]+)\'?(?:\\s+Else\\s+\'?([^\'\\s]+)\'?)?/i);\n';
  code += '    if (sm) { var cr=sm[1].trim(); if (/Column(\\d+)/i.test(cr)){cr=data[cr.match(/Column(\\d+)/i)[1]-1]||"";} var tr=sm[4],er=sm[5]||""; if(/Column(\\d+)/i.test(tr)){tr=data[tr.match(/Column(\\d+)/i)[1]-1]||"";} if(/Column(\\d+)/i.test(er)){er=data[er.match(/Column(\\d+)/i)[1]-1]||"";} var cond=false; if(sm[2]=="=="||sm[2]=="=")cond=cr==sm[3]; else if(sm[2]=="!=")cond=cr!=sm[3]; else if(sm[2]==">")cond=parseFloat(cr)>parseFloat(sm[3]); else if(sm[2]=="<")cond=parseFloat(cr)<parseFloat(sm[3]); return cond?tr:er; }\n';
  code += '  }\n';
  code += '  if (/^[\'\\"].*[\'\\"]$/.test(logic)) return logic.slice(1,-1);\n';
  code += '  if (/^Today\\(/i.test(logic)) return new Date().toLocaleDateString("en-US");\n';
  code += '  if (/^Now\\(/i.test(logic)) return new Date().toLocaleString("en-US");\n';
  code += '  var cm = logic.match(/^Column(\\d+)$/i); if (cm) return data[cm[1]-1]||"";\n';
  code += '  return logic;\n';
  code += '}\n\n';
  code += '// Mapping Rules\n';
  code += 'var mappingRules = ' + JSON.stringify(mappings.map(function(m) {
    return {
      field: m['targetfieldname'] || m['fieldname'] || '',
      logic: m['mappinglogic'] || '',
      colNum: m['inputcolumnnumber'] ? parseInt(m['inputcolumnnumber']) - 1 : null,
      required: (m['required'] || '').toUpperCase() === 'Y'
    };
  }).filter(function(r) { return r.field; }), null, 2) + ';\n\n';
  code += 'var headers = mappingRules.map(function(r) { return r.field; });\n\n';
  code += '// Process input\n';
  code += 'var inputFile = process.argv[2];\n';
  code += 'var outputFile = process.argv[3] || "output.csv";\n';
  code += 'var skipRows = parseInt(process.argv[4]) || 0;\n';
  code += 'var inputText = fs.readFileSync(inputFile, "utf8");\n';
  code += 'var allData = parseCSV(inputText, "' + (delimiter || ',') + '");\n';
  code += 'var inputData = allData.slice(skipRows);\n\n';
  code += 'var csvLines = [headers.join(",")];\n';
  code += 'inputData.forEach(function(row, idx) {\n';
  code += '  var record = {};\n';
  code += '  mappingRules.forEach(function(rule) {\n';
  code += '    var value;\n';
  code += '    if (rule.logic && rule.logic.trim()) { value = applyLogic(rule.logic, row, rule.field, idx); }\n';
  code += '    else if (rule.colNum !== null) { value = row[rule.colNum] || ""; }\n';
  code += '    else { value = null; }\n';
  code += '    record[rule.field] = value;\n';
  code += '  });\n';
  code += '  var line = headers.map(function(h) { var v = record[h] != null ? record[h].toString() : ""; return /[",\\n]/.test(v) ? \'"\' + v.replace(/"/g, \'""\') + \'"\' : v; });\n';
  code += '  csvLines.push(line.join(","));\n';
  code += '});\n\n';
  code += 'fs.writeFileSync(outputFile, csvLines.join("\\n"), "utf8");\n';
  code += 'console.log("Processed " + inputData.length + " rows -> " + outputFile);\n';

  return code;
}

function generateSelfContained(mappings, delimiter) {
  var code = '// Self-Contained Mapper - Generated by JavaScript Mapper\n';
  code += '// Generated: ' + new Date().toISOString() + '\n';
  code += '// Mode: Self-Contained (Static)\n\n';
  code += 'var fs = require("fs");\n\n';
  code += 'var incrementCounter = 0;\n\n';
  code += 'function pad(n) { return n < 10 ? "0" + n : n; }\n\n';
  code += 'function mapRow(data, rowIndex) {\n';
  code += '  var result = {};\n';

  mappings.forEach(function(m) {
    var field = m['targetfieldname'] || m['fieldname'] || '';
    if (!field) return;
    var logic = (m['mappinglogic'] || '').trim();
    var colNum = m['inputcolumnnumber'] || '';

    code += '  // ' + field + '\n';
    if (logic) {
      if (/^Increment By 1$/i.test(logic)) {
        code += '  incrementCounter++; result["' + field + '"] = incrementCounter;\n';
      } else if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
        var val = logic.match(/^Hardcode\s+['"](.*)['"]$/i)[1];
        code += '  result["' + field + '"] = "' + val + '";\n';
      } else if (/^Column(\d+)$/i.test(logic)) {
        var cn = logic.match(/^Column(\d+)$/i)[1];
        code += '  result["' + field + '"] = data[' + (cn - 1) + '] || "";\n';
      } else if (/^['"].*['"]$/.test(logic)) {
        code += '  result["' + field + '"] = "' + logic.slice(1, -1) + '";\n';
      } else {
        // Complex logic - use applyLogic at runtime
        code += '  result["' + field + '"] = applyLogic(\'' + logic.replace(/'/g, "\\'") + '\', data, "' + field + '", rowIndex);\n';
      }
    } else if (colNum) {
      code += '  result["' + field + '"] = data[' + (parseInt(colNum) - 1) + '] || "";\n';
    } else {
      code += '  result["' + field + '"] = null;\n';
    }
  });

  code += '  return result;\n';
  code += '}\n\n';
  code += '// Include applyLogic for complex transformations\n';
  code += 'function applyLogic(logic, data, field, rowIndex) {\n';
  code += '  if (!logic) return null; logic = logic.trim();\n';
  code += '  if (/^RemoveLeadingZeroes\\(/i.test(logic)){var c=logic.match(/Column(\\d+)/i);if(c)return(data[c[1]-1]||"").replace(/^0+/,"")||"0";}\n';
  code += '  if (/^Trim\\(/i.test(logic)){var c=logic.match(/Column(\\d+)/i);if(c)return(data[c[1]-1]||"").trim();}\n';
  code += '  if (/^Left\\(/i.test(logic)){var m=logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i);if(m)return(data[m[1]-1]||"").substring(0,parseInt(m[2]));}\n';
  code += '  if (/^Right\\(/i.test(logic)){var m=logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i);if(m)return(data[m[1]-1]||"").slice(-parseInt(m[2]));}\n';
  code += '  if (/^Concat\\(/i.test(logic)){var cs=logic.match(/Column(\\d+)/gi);if(cs)return cs.map(function(c){return data[c.match(/\\d+/)[0]-1]||""}).join("");}\n';
  code += '  if (/^DateReformat\\(/i.test(logic)){var m=logic.match(/DateReformat\\(Column(\\d+),\\s*\'([^\']*)\',\\s*\'([^\']*)\'\\)/i);if(m){var d=(data[m[1]-1]||"").trim();if(m[2].toUpperCase()==="MMDDYYYY"&&m[3].toUpperCase()==="YYYYMMDD"&&d.length===8)return d.substring(4,8)+d.substring(0,4);return d;}}\n';
  code += '  if (/^If\\s/i.test(logic)){var sm=logic.match(/If\\s+([^!=<>]+)\\s*(==?|!=|>|<|>=|<=)\\s*\'?([^\'\\s]*)\'?\\s+Then\\s+\'?([^\'\\s]+)\'?(?:\\s+Else\\s+\'?([^\'\\s]+)\'?)?/i);if(sm){var cr=sm[1].trim();if(/Column(\\d+)/i.test(cr)){cr=data[cr.match(/Column(\\d+)/i)[1]-1]||"";}var tr=sm[4],er=sm[5]||"";if(/Column(\\d+)/i.test(tr)){tr=data[tr.match(/Column(\\d+)/i)[1]-1]||"";}if(/Column(\\d+)/i.test(er)){er=data[er.match(/Column(\\d+)/i)[1]-1]||"";}var cond=false;if(sm[2]=="=="||sm[2]=="=")cond=cr==sm[3];else if(sm[2]=="!=")cond=cr!=sm[3];else if(sm[2]==">")cond=parseFloat(cr)>parseFloat(sm[3]);return cond?tr:er;}}\n';
  code += '  if (/^Today\\(/i.test(logic)) return new Date().toLocaleDateString("en-US");\n';
  code += '  if (/^Now\\(/i.test(logic)) return new Date().toLocaleString("en-US");\n';
  code += '  var cm=logic.match(/^Column(\\d+)$/i);if(cm)return data[cm[1]-1]||"";\n';
  code += '  return logic;\n';
  code += '}\n\n';

  // CSV parser
  code += 'function parseCSV(text, delimiter) {\n';
  code += '  var lines = text.split(/\\r?\\n/).filter(function(l){return l.trim()!==""});\n';
  code += '  return lines.map(function(line){var result=[],current="",inQuotes=false;for(var i=0;i<line.length;i++){var c=line[i];if(c===\'"\'){if(inQuotes&&line[i+1]===\'"\'){current+=\'"\';i++}else{inQuotes=!inQuotes}}else if(c===delimiter&&!inQuotes){result.push(current);current=""}else{current+=c}}result.push(current);return result});\n';
  code += '}\n\n';

  var fields = mappings.filter(function(m) { return m['targetfieldname'] || m['fieldname']; }).map(function(m) { return m['targetfieldname'] || m['fieldname']; });
  code += 'var headers = ' + JSON.stringify(fields) + ';\n\n';
  code += 'var inputFile = process.argv[2];\n';
  code += 'var outputFile = process.argv[3] || "output.csv";\n';
  code += 'var skipRows = parseInt(process.argv[4]) || 0;\n';
  code += 'var inputText = fs.readFileSync(inputFile, "utf8");\n';
  code += 'var allData = parseCSV(inputText, "' + (delimiter || ',') + '");\n';
  code += 'var inputData = allData.slice(skipRows);\n\n';
  code += 'var csvLines = [headers.join(",")];\n';
  code += 'inputData.forEach(function(row, idx) {\n';
  code += '  var record = mapRow(row, idx);\n';
  code += '  var line = headers.map(function(h){var v=record[h]!=null?record[h].toString():"";return /[",\\n]/.test(v)?\'"\'+v.replace(/"/g,\'""\')+ \'"\':v;});\n';
  code += '  csvLines.push(line.join(","));\n';
  code += '});\n\n';
  code += 'fs.writeFileSync(outputFile, csvLines.join("\\n"), "utf8");\n';
  code += 'console.log("Processed " + inputData.length + " rows -> " + outputFile);\n';

  return code;
}

// ============================================================
// MULTI-RECORD FIXED-LENGTH JS GENERATOR
// ============================================================

function generateMultiRecordMapperJS(neededMappings, mappingFileContents, mode, inputFileName, configText) {
  var code = '// Multi-Record Fixed-Length Mapper - Generated by JavaScript Mapper CLI\n';
  code += '// Generated: ' + new Date().toISOString() + '\n';
  code += '// Mode: ' + (mode === 'runtime' ? 'Runtime Flexible' : 'Self-Contained') + '\n';
  code += '// Source: ' + inputFileName + '\n\n';
  code += 'var fs = require("fs");\n\n';

  // Include applyLogic for transformation support
  code += 'var incrementCounter = 0;\n\n';
  code += 'function applyLogic(logic, data, field, rowIndex) {\n';
  code += '  if (!logic) return null; logic = logic.trim();\n';
  code += '  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return incrementCounter; }\n';
  code += '  if (/^Hardcode\\s+[\'\\"](.*)[\'\\"]/i.test(logic)) { return logic.match(/^Hardcode\\s+[\'\\"](.*)[\'\\"]/i)[1]; }\n';
  code += '  if (/^RemoveLeadingZeroes\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").replace(/^0+/,"") || "0"; }\n';
  code += '  if (/^RemoveTrailingSpaces\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").replace(/\\s+$/,""); }\n';
  code += '  if (/^Trim\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").trim(); }\n';
  code += '  if (/^Concat\\(/i.test(logic)) { var cs = logic.match(/Column(\\d+)/gi); if (cs) return cs.map(function(c){return data[c.match(/\\d+/)[0]-1]||""}).join(""); }\n';
  code += '  if (/^Substring\\(/i.test(logic)) { var m = logic.match(/Substring\\(Column(\\d+),\\s*(\\d+),\\s*(\\d+)\\)/i); if (m) return (data[m[1]-1]||"").substring(parseInt(m[2])-1, parseInt(m[2])-1+parseInt(m[3])); }\n';
  code += '  if (/^Uppercase\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").toUpperCase(); }\n';
  code += '  if (/^Lowercase\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return (data[c[1]-1]||"").toLowerCase(); }\n';
  code += '  if (/^Left\\(/i.test(logic)) { var m = logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i); if (m) return (data[m[1]-1]||"").substring(0,parseInt(m[2])); }\n';
  code += '  if (/^Right\\(/i.test(logic)) { var m = logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i); if (m) return (data[m[1]-1]||"").slice(-parseInt(m[2])); }\n';
  code += '  if (/^Replace\\(/i.test(logic)) { var m = logic.match(/Replace\\(Column(\\d+),\\s*\'([^\']*)\',\\s*\'([^\']*)\'\\)/i); if (m) return (data[m[1]-1]||"").split(m[2]).join(m[3]); }\n';
  code += '  if (/^PadLeft\\(/i.test(logic)) { var m = logic.match(/PadLeft\\(Column(\\d+),\\s*(\\d+),\\s*\'([^\']*)\'\\)/i); if (m) { var v=(data[m[1]-1]||"").toString(),l=parseInt(m[2]),c=m[3]; while(v.length<l)v=c+v; return v; } }\n';
  code += '  if (/^PadRight\\(/i.test(logic)) { var m = logic.match(/PadRight\\(Column(\\d+),\\s*(\\d+),\\s*\'([^\']*)\'\\)/i); if (m) { var v=(data[m[1]-1]||"").toString(),l=parseInt(m[2]),c=m[3]; while(v.length<l)v=v+c; return v; } }\n';
  code += '  if (/^Sum\\(/i.test(logic)) { var cs = logic.match(/Column(\\d+)/gi); if (cs) { var s=0; cs.forEach(function(c){s+=parseFloat(data[c.match(/\\d+/)[0]-1]||"0")}); return s; } }\n';
  code += '  if (/^Abs\\(/i.test(logic)) { var c = logic.match(/Column(\\d+)/i); if (c) return Math.abs(parseFloat(data[c[1]-1]||"0")); }\n';
  code += '  if (/^DateReformat\\(/i.test(logic)) { var m = logic.match(/DateReformat\\(Column(\\d+),\\s*\'([^\']*)\',\\s*\'([^\']*)\'\\)/i); if (m) { var d=(data[m[1]-1]||"").trim(); if(m[2].toUpperCase()==="MMDDYYYY"&&m[3].toUpperCase()==="YYYYMMDD"&&d.length===8) return d.substring(4,8)+d.substring(0,4); if(m[2].toUpperCase()==="MMDDYY"&&m[3].toUpperCase()==="YYYYMMDD"&&d.length===6){var yr=parseInt(d.substring(4,6));return (yr>50?"19":"20")+d.substring(4,6)+d.substring(0,4);} return d; } }\n';
  code += '  if (/^If\\s/i.test(logic)) { var sm=logic.match(/If\\s+([^!=<>]+)\\s*(==?|!=|>|<|>=|<=)\\s*\'?([^\'\\s]*)\'?\\s+Then\\s+\'?([^\'\\s]+)\'?(?:\\s+Else\\s+\'?([^\'\\s]+)\'?)?/i); if(sm){var cr=sm[1].trim();if(/Column(\\d+)/i.test(cr)){cr=data[cr.match(/Column(\\d+)/i)[1]-1]||"";}var tr=sm[4],er=sm[5]||"";if(/Column(\\d+)/i.test(tr)){tr=data[tr.match(/Column(\\d+)/i)[1]-1]||"";}if(/Column(\\d+)/i.test(er)){er=data[er.match(/Column(\\d+)/i)[1]-1]||"";}var cond=false;if(sm[2]=="=="||sm[2]=="=")cond=cr==sm[3];else if(sm[2]=="!=")cond=cr!=sm[3];else if(sm[2]==">")cond=parseFloat(cr)>parseFloat(sm[3]);else if(sm[2]=="<")cond=parseFloat(cr)<parseFloat(sm[3]);else if(sm[2]==">=")cond=parseFloat(cr)>=parseFloat(sm[3]);else if(sm[2]=="<=")cond=parseFloat(cr)<=parseFloat(sm[3]);return cond?tr:er;} }\n';
  code += '  if (/^[\'\\"].*[\'\\"]$/.test(logic)) return logic.slice(1,-1);\n';
  code += '  if (/^Today\\(/i.test(logic)) return new Date().toLocaleDateString("en-US");\n';
  code += '  if (/^Now\\(/i.test(logic)) return new Date().toLocaleString("en-US");\n';
  code += '  var cm = logic.match(/^Column(\\d+)$/i); if (cm) return data[cm[1]-1]||"";\n';
  code += '  return logic;\n';
  code += '}\n\n';

  // Build record type configurations with embedded field definitions
  // Parse config to get indicator positions and values
  var cfgRows = parseCSV(configText, ',');
  var cfgHeaders = cfgRows[0].map(normalizeKey);
  var rtConfigs = [];
  for (var ci = 1; ci < cfgRows.length; ci++) {
    var cobj = {};
    for (var cj = 0; cj < cfgHeaders.length; cj++) {
      cobj[cfgHeaders[cj]] = (cfgRows[ci][cj] || '').trim();
    }
    rtConfigs.push({
      type: cobj['recordtype'] || cobj['record type'] || '',
      indicatorPos: parseInt(cobj['typeindicatorposition'] || cobj['type indicator position'] || '1') - 1,
      indicatorValue: cobj['typeindicatorvalue'] || cobj['type indicator value'] || '',
      mappingFile: cobj['mappingfile'] || cobj['mapping file'] || '',
      outputName: cobj['outputname'] || cobj['output name'] || cobj['recordtype'] || cobj['record type'] || ''
    });
  }

  code += '// Record Type Configurations\n';
  code += 'var recordTypes = ' + JSON.stringify(rtConfigs.map(function(rt) {
    var mappingText = mappingFileContents[rt.mappingFile] || '';
    var fields = parseFixedLengthMapping(mappingText);
    return {
      type: rt.type,
      indicatorPos: rt.indicatorPos,
      indicatorValue: rt.indicatorValue,
      outputName: rt.outputName,
      fields: fields
    };
  }), null, 2) + ';\n\n';

  code += '// Main processing\n';
  code += 'var inputFile = process.argv[2];\n';
  code += 'if (!inputFile) { console.log("Usage: node mapper.js <input_file>"); process.exit(1); }\n';
  code += 'var inputText = fs.readFileSync(inputFile, "utf8");\n';
  code += 'var lines = inputText.split(/\\r?\\n/).filter(function(l) { return l.trim() !== ""; });\n\n';

  code += 'recordTypes.forEach(function(rt) {\n';
  code += '  incrementCounter = 0;\n';
  code += '  var headers = rt.fields.map(function(f) { return f.fieldName; });\n';
  code += '  var csvLines = [headers.join(",")];\n';
  code += '  var count = 0;\n\n';
  code += '  lines.forEach(function(line, rowIndex) {\n';
  code += '    var indicator = line.charAt(rt.indicatorPos);\n';
  code += '    if (indicator !== rt.indicatorValue) return;\n\n';
  code += '    var extracted = rt.fields.map(function(f) { return line.substring(f.start, f.end).trim(); });\n';
  code += '    var row = headers.map(function(h, idx) {\n';
  code += '      var f = rt.fields[idx];\n';
  code += '      var value;\n';
  code += '      if (f.mappingLogic && f.mappingLogic.trim()) {\n';
  code += '        value = applyLogic(f.mappingLogic, extracted, f.fieldName, rowIndex);\n';
  code += '      } else if (f.defaultValue) {\n';
  code += '        value = f.defaultValue;\n';
  code += '      } else {\n';
  code += '        value = extracted[idx];\n';
  code += '      }\n';
  code += '      var v = value != null ? value.toString() : "";\n';
  code += '      return /[",\\n]/.test(v) ? \'"\' + v.replace(/"/g, \'""\') + \'"\' : v;\n';
  code += '    });\n';
  code += '    csvLines.push(row.join(","));\n';
  code += '    count++;\n';
  code += '  });\n\n';
  code += '  var outputName = inputFile.replace(/\\.[^.]+$/, "") + "_" + rt.outputName + "_output.csv";\n';
  code += '  fs.writeFileSync(outputName, csvLines.join("\\n"), "utf8");\n';
  code += '  console.log("Record Type " + rt.type + " (" + rt.outputName + "): " + count + " rows -> " + outputName);\n';
  code += '});\n';

  return code;
}

// ============================================================
// HTML OUTPUT GENERATOR (Function_Reference.html theme)
// ============================================================

function generateOutputHTML(title, headers, results, outputPath) {
  var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
  html += '  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += '  <title>' + title + ' - Mapped Output</title>\n';
  html += '  <style>\n';
  html += '    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");\n';
  html += '    *, *::before, *::after { box-sizing: border-box; }\n';
  html += '    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(rgba(248,250,252,0.9), rgba(248,250,252,0.9)), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px), radial-gradient(circle at 20px 20px, rgba(59,130,246,0.15) 2px, transparent 2px), #f8fafc; background-size: 40px 40px; color: #1f2937; margin: 0; padding: 20px; min-height: 100vh; }\n';
  html += '    .container { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1); padding: 32px; max-width: 98%; margin: auto; border: 1px solid #e5e7eb; overflow-x: auto; }\n';
  html += '    h1 { font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 4px 0; }\n';
  html += '    .title-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }\n';
  html += '    .subtitle { text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px; }\n';
  html += '    .gradient-divider { height: 4px; background: linear-gradient(90deg, #1e3a8a 0%, #3730a3 25%, #5b21b6 50%, #7c2d12 75%, #1e40af 100%); border-radius: 2px; margin-bottom: 24px; }\n';
  html += '    .stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }\n';
  html += '    .stat-card { background: linear-gradient(135deg, #eff6ff, #f5f3ff); border: 1px solid #c7d2fe; border-radius: 8px; padding: 12px 20px; flex: 1; min-width: 150px; text-align: center; }\n';
  html += '    .stat-card .num { font-size: 24px; font-weight: 700; color: #4338ca; }\n';
  html += '    .stat-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }\n';
  html += '    .search-box { margin-bottom: 16px; position: relative; }\n';
  html += '    .search-box input { width: 100%; padding: 10px 12px 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }\n';
  html += '    .search-box input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }\n';
  html += '    table { width: 100%; border-collapse: collapse; font-size: 13px; }\n';
  html += '    thead th { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; position: sticky; top: 0; white-space: nowrap; }\n';
  html += '    tbody tr { transition: background 0.15s; }\n';
  html += '    tbody tr:nth-child(even) { background: #f9fafb; }\n';
  html += '    tbody tr:hover { background: #eff6ff; }\n';
  html += '    tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }\n';
  html += '    .row-num { color: #9ca3af; font-size: 11px; font-weight: 600; }\n';
  html += '    .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }\n';
  html += '  </style>\n</head>\n<body>\n';
  html += '  <div class="container">\n';
  html += '    <h1><span class="title-text">Mapped Output</span></h1>\n';
  html += '    <p class="subtitle">' + title + ' - Generated ' + new Date().toLocaleString() + '</p>\n';
  html += '    <div class="gradient-divider"></div>\n';
  html += '    <div class="stats">\n';
  html += '      <div class="stat-card"><div class="num">' + results.length + '</div><div class="label">Total Rows</div></div>\n';
  html += '      <div class="stat-card"><div class="num">' + headers.length + '</div><div class="label">Columns</div></div>\n';
  html += '    </div>\n';
  html += '    <div class="search-box"><input type="text" id="searchInput" placeholder="Search data..." aria-label="Search data" oninput="filterTable(this.value)"></div>\n';
  html += '    <table>\n      <thead><tr><th>#</th>';
  headers.forEach(function(h) { html += '<th>' + escapeHTML(h) + '</th>'; });
  html += '</tr></thead>\n      <tbody id="tableBody">\n';

  results.forEach(function(r, idx) {
    html += '      <tr><td class="row-num">' + (idx + 1) + '</td>';
    headers.forEach(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      html += '<td title="' + escapeHTML(v) + '">' + escapeHTML(v) + '</td>';
    });
    html += '</tr>\n';
  });

  html += '      </tbody>\n    </table>\n';
  html += '    <div class="footer">JavaScript Mapper CLI</div>\n';
  html += '  </div>\n';
  html += '  <script>\n';
  html += '  function filterTable(q) {\n';
  html += '    q = q.toLowerCase();\n';
  html += '    var rows = document.getElementById("tableBody").getElementsByTagName("tr");\n';
  html += '    for (var i = 0; i < rows.length; i++) {\n';
  html += '      rows[i].style.display = rows[i].textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";\n';
  html += '    }\n';
  html += '  }\n';
  html += '  </script>\n</body>\n</html>';

  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}

function escapeHTML(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// INTERACTIVE CLI
// ============================================================

var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(function(resolve) {
    rl.question(question, function(answer) {
      resolve(answer.trim());
    });
  });
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir).filter(function(f) {
      return !fs.statSync(path.join(dir, f)).isDirectory();
    });
  } catch (e) {
    return [];
  }
}

function printBanner() {
  console.log('');
  console.log('  =============================================');
  console.log('  |     JavaScript Mapper CLI v1.0            |');
  console.log('  |     Data Transformation Engine            |');
  console.log('  =============================================');
  console.log('');
}

function printFiles(files, label) {
  console.log('\n  Available ' + label + ':');
  files.forEach(function(f, i) {
    console.log('    [' + (i + 1) + '] ' + f);
  });
  console.log('');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  printBanner();

  // Determine working directory
  var baseDir = process.cwd();
  var inputDir = path.join(baseDir, 'input');
  var outputDir = path.join(baseDir, 'output');
  var archiveDir = path.join(baseDir, 'archive');

  // Check if input directory exists, if not use current directory
  if (!fs.existsSync(inputDir)) {
    inputDir = baseDir;
  }
  ensureDir(outputDir);
  ensureDir(archiveDir);

  var inputFiles = listFiles(inputDir);
  if (inputFiles.length === 0) {
    console.log('  No files found in: ' + inputDir);
    console.log('  Place your input and mapping files in the "input" directory.');
    rl.close();
    return;
  }

  // Step 1: Ask file type
  console.log('  [1] Delimited (CSV, pipe, tab, etc.)');
  console.log('  [2] Fixed-Length');
  var fileType = await ask('  Select input file type (1 or 2): ');

  if (fileType === '1') {
    await handleDelimited(inputDir, outputDir, archiveDir, inputFiles);
  } else if (fileType === '2') {
    await handleFixedLength(inputDir, outputDir, archiveDir, inputFiles);
  } else {
    console.log('  Invalid selection. Exiting.');
    rl.close();
    return;
  }
}

async function handleDelimited(inputDir, outputDir, archiveDir, inputFiles) {
  // A. Ask for input data file
  printFiles(inputFiles, 'files in input directory');
  var inputIdx = await ask('  Select the INPUT DATA file (number): ');
  var inputFile = inputFiles[parseInt(inputIdx) - 1];
  if (!inputFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // B. Ask for mapping file
  var mappingFiles = inputFiles.filter(function(f) { return f.toLowerCase().endsWith('.csv'); });
  printFiles(mappingFiles, 'CSV mapping files');
  var mapIdx = await ask('  Select the MAPPING CSV file (number): ');
  var mappingFile = mappingFiles[parseInt(mapIdx) - 1];
  if (!mappingFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // C. Ask delimiter
  console.log('\n  Common delimiters: comma(,) pipe(|) tab(\\t)');
  var delimiter = await ask('  Enter the delimiter used in the input file [default: ,]: ');
  if (!delimiter) delimiter = ',';
  if (delimiter === '\\t' || delimiter.toLowerCase() === 'tab') delimiter = '\t';

  // D. Ask skip rows
  var skipStr = await ask('  How many rows to skip from top? [default: 0]: ');
  var skipRows = parseInt(skipStr) || 0;

  // Step 2: Generation type
  console.log('\n  Generation Type:');
  console.log('  [1] Runtime Flexible - Dynamic approach, flexible JS code');
  console.log('  [2] Self-Contained - Static approach, hardcoded rules');
  var genType = await ask('  Select generation type (1 or 2): ');
  var mode = genType === '2' ? 'selfcontained' : 'runtime';

  // Read files
  var inputText = fs.readFileSync(path.join(inputDir, inputFile), 'utf8');
  var mappingText = fs.readFileSync(path.join(inputDir, mappingFile), 'utf8');

  console.log('\n  Processing...');

  // Generate .js mapper
  var jsCode = generateMapperJS(mappingText, mode, delimiter);
  var jsOutputName = path.basename(inputFile, path.extname(inputFile)) + '_mapper.js';
  fs.writeFileSync(path.join(outputDir, jsOutputName), jsCode, 'utf8');
  console.log('  Generated: output/' + jsOutputName);

  // Generate mapped CSV output
  var result = transformData(inputText, mappingText, delimiter, skipRows);
  if (result.success) {
    var csvOutputName = path.basename(inputFile, path.extname(inputFile)) + '_mapped_output.csv';
    fs.writeFileSync(path.join(outputDir, csvOutputName), result.csvOutput, 'utf8');
    console.log('  Generated: output/' + csvOutputName);
    console.log('  Rows processed: ' + result.rowCount);

    // Move files to archive
    moveToArchive(inputDir, archiveDir, inputFile);
    moveToArchive(inputDir, archiveDir, mappingFile);
    console.log('  Moved processed files to archive/');

    // Ask about HTML output
    var wantHTML = await ask('\n  Generate HTML viewer for the output? (y/n) [default: y]: ');
    if (!wantHTML || wantHTML.toLowerCase() === 'y') {
      var htmlName = path.basename(inputFile, path.extname(inputFile)) + '_output.html';
      var htmlPath = path.join(outputDir, htmlName);
      generateOutputHTML(csvOutputName, result.headers, result.transformedData, htmlPath);
      console.log('  Generated: output/' + htmlName);

      // Open HTML in browser
      try {
        require('child_process').execSync('explorer.exe "' + htmlPath + '"');
      } catch (e) {
        console.log('  (Could not auto-open HTML file. Open manually: output/' + htmlName + ')');
      }
    }
  } else {
    console.log('  ERROR: ' + result.error);
  }

  console.log('\n  Done.');
  rl.close();
}

async function handleFixedLength(inputDir, outputDir, archiveDir, inputFiles) {
  // Ask if multi-record
  var isMulti = await ask('  Is this a multi-record type file? (y/n) [default: n]: ');

  if (isMulti && isMulti.toLowerCase() === 'y') {
    await handleMultiRecord(inputDir, outputDir, archiveDir, inputFiles);
  } else {
    await handleSingleFixedLength(inputDir, outputDir, archiveDir, inputFiles);
  }
}

async function handleSingleFixedLength(inputDir, outputDir, archiveDir, inputFiles) {
  // Ask for input data file
  var dataFiles = inputFiles.filter(function(f) { return f.toLowerCase().endsWith('.txt') || f.toLowerCase().endsWith('.dat'); });
  if (dataFiles.length === 0) dataFiles = inputFiles;
  printFiles(dataFiles, 'data files');
  var inputIdx = await ask('  Select the INPUT DATA file (number): ');
  var inputFile = dataFiles[parseInt(inputIdx) - 1];
  if (!inputFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // Ask for mapping file
  var mappingFiles = inputFiles.filter(function(f) { return f.toLowerCase().endsWith('.csv'); });
  printFiles(mappingFiles, 'CSV mapping files');
  var mapIdx = await ask('  Select the MAPPING CSV file (number): ');
  var mappingFile = mappingFiles[parseInt(mapIdx) - 1];
  if (!mappingFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // Generation type
  console.log('\n  Generation Type:');
  console.log('  [1] Runtime Flexible');
  console.log('  [2] Self-Contained');
  var genType = await ask('  Select generation type (1 or 2): ');
  var mode = genType === '2' ? 'selfcontained' : 'runtime';

  // Read files
  var inputText = fs.readFileSync(path.join(inputDir, inputFile), 'utf8');
  var mappingText = fs.readFileSync(path.join(inputDir, mappingFile), 'utf8');

  console.log('\n  Processing fixed-length file...');

  var fields = parseFixedLengthMapping(mappingText);
  var processed = processFixedLength(inputText, fields);

  // Generate CSV output
  var csvLines = [processed.headers.join(',')];
  processed.results.forEach(function(r) {
    var row = processed.headers.map(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    });
    csvLines.push(row.join(','));
  });
  var csvOutput = csvLines.join('\n');

  var csvOutputName = path.basename(inputFile, path.extname(inputFile)) + '_mapped_output.csv';
  fs.writeFileSync(path.join(outputDir, csvOutputName), csvOutput, 'utf8');
  console.log('  Generated: output/' + csvOutputName);
  console.log('  Rows processed: ' + processed.results.length);

  // Generate JS mapper
  var jsCode = '// Fixed-Length Mapper - Generated by JavaScript Mapper CLI\n';
  jsCode += '// Generated: ' + new Date().toISOString() + '\n';
  jsCode += '// Mode: ' + (mode === 'runtime' ? 'Runtime Flexible' : 'Self-Contained') + '\n\n';
  jsCode += 'var fs = require("fs");\n\n';
  jsCode += 'var fields = ' + JSON.stringify(fields, null, 2) + ';\n\n';
  jsCode += 'var inputFile = process.argv[2];\n';
  jsCode += 'var outputFile = process.argv[3] || "output.csv";\n';
  jsCode += 'var inputText = fs.readFileSync(inputFile, "utf8");\n';
  jsCode += 'var lines = inputText.split(/\\r?\\n/).filter(function(l){return l.trim()!==""});\n';
  jsCode += 'var headers = fields.map(function(f){return f.fieldName});\n';
  jsCode += 'var csvLines = [headers.join(",")];\n';
  jsCode += 'lines.forEach(function(line, idx) {\n';
  jsCode += '  var extracted = fields.map(function(f){return line.substring(f.start, f.end).trim()});\n';
  jsCode += '  var row = headers.map(function(h,i){var v=extracted[i]||"";return /[",\\n]/.test(v)?\'"\'+v.replace(/"/g,\'""\')+ \'"\':v;});\n';
  jsCode += '  csvLines.push(row.join(","));\n';
  jsCode += '});\n';
  jsCode += 'fs.writeFileSync(outputFile, csvLines.join("\\n"), "utf8");\n';
  jsCode += 'console.log("Processed " + lines.length + " rows -> " + outputFile);\n';

  var jsOutputName = path.basename(inputFile, path.extname(inputFile)) + '_mapper.js';
  fs.writeFileSync(path.join(outputDir, jsOutputName), jsCode, 'utf8');
  console.log('  Generated: output/' + jsOutputName);

  // Move to archive
  moveToArchive(inputDir, archiveDir, inputFile);
  moveToArchive(inputDir, archiveDir, mappingFile);
  console.log('  Moved processed files to archive/');

  // HTML output
  var wantHTML = await ask('\n  Generate HTML viewer for the output? (y/n) [default: y]: ');
  if (!wantHTML || wantHTML.toLowerCase() === 'y') {
    var htmlName = path.basename(inputFile, path.extname(inputFile)) + '_output.html';
    var htmlPath = path.join(outputDir, htmlName);
    generateOutputHTML(csvOutputName, processed.headers, processed.results, htmlPath);
    console.log('  Generated: output/' + htmlName);
    try { require('child_process').execSync('explorer.exe "' + htmlPath + '"'); } catch (e) {}
  }

  console.log('\n  Done.');
  rl.close();
}

async function handleMultiRecord(inputDir, outputDir, archiveDir, inputFiles) {
  // B.1. Ask user which file is the input data file
  printFiles(inputFiles, 'files in input directory');
  var inputIdx = await ask('  Select the INPUT DATA file (number): ');
  var inputFile = inputFiles[parseInt(inputIdx) - 1];
  if (!inputFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // B.2. Ask user which file is the record type config file
  var csvFiles = inputFiles.filter(function(f) { return f.toLowerCase().endsWith('.csv'); });
  printFiles(csvFiles, 'CSV files (select record type config)');
  var configIdx = await ask('  Select the RECORD TYPE CONFIG file (number): ');
  var configFile = csvFiles[parseInt(configIdx) - 1];
  if (!configFile) { console.log('  Invalid selection.'); rl.close(); return; }

  // Parse config to discover all mapping files indicated
  var configText = fs.readFileSync(path.join(inputDir, configFile), 'utf8');
  var configRows = parseCSV(configText, ',');
  var configHeaders = configRows[0].map(normalizeKey);
  var neededMappings = [];

  for (var i = 1; i < configRows.length; i++) {
    var obj = {};
    for (var j = 0; j < configHeaders.length; j++) {
      obj[configHeaders[j]] = (configRows[i][j] || '').trim();
    }
    var mf = obj['mappingfile'] || obj['mapping file'] || '';
    var rt = obj['recordtype'] || obj['record type'] || '';
    if (mf) neededMappings.push({ type: rt, file: mf });
  }

  // B.3. Based on the files indicated in the record type config file,
  //      ask user which file is which. Do it for ALL indicated files.
  var mappingFileContents = {};
  var userSelectedMappingFiles = [];
  console.log('\n  The record type config references ' + neededMappings.length + ' mapping file(s).');
  console.log('  Please identify each one:\n');

  for (var k = 0; k < neededMappings.length; k++) {
    var nm = neededMappings[k];
    console.log('  Mapping file for Record Type "' + nm.type + '": ' + nm.file);
    printFiles(csvFiles, 'CSV files');
    var mIdx = await ask('    Which file is the mapping for "' + nm.type + '" (' + nm.file + ')? (number): ');
    var selectedFile = csvFiles[parseInt(mIdx) - 1];
    if (!selectedFile) { console.log('  Invalid selection.'); rl.close(); return; }
    mappingFileContents[nm.file] = fs.readFileSync(path.join(inputDir, selectedFile), 'utf8');
    userSelectedMappingFiles.push(selectedFile);
    console.log('    -> Using: ' + selectedFile + '\n');
  }

  // Step 2: Ask generation type
  console.log('  Generation Type:');
  console.log('  [1] Runtime Flexible - Dynamic approach, flexible JS code');
  console.log('  [2] Self-Contained - Static approach, hardcoded rules');
  var genType = await ask('  Select generation type (1 or 2): ');
  var mode = genType === '2' ? 'selfcontained' : 'runtime';

  // Step 3: Process and generate outputs
  var inputText = fs.readFileSync(path.join(inputDir, inputFile), 'utf8');

  console.log('\n  Processing multi-record fixed-length file...');

  var allResults = processMultiRecord(inputText, configText, mappingFileContents, inputDir);

  // Generate mapped CSV output for each record type
  var totalRows = 0;

  Object.keys(allResults).forEach(function(outputName) {
    var data = allResults[outputName];
    if (data.results.length === 0) return;

    var csvLines = [data.headers.join(',')];
    data.results.forEach(function(r) {
      var row = data.headers.map(function(h) {
        var v = r[h] != null ? r[h].toString() : '';
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      });
      csvLines.push(row.join(','));
    });

    var csvName = path.basename(inputFile, path.extname(inputFile)) + '_' + outputName + '_output.csv';
    fs.writeFileSync(path.join(outputDir, csvName), csvLines.join('\n'), 'utf8');
    console.log('  Generated: output/' + csvName + ' (' + data.results.length + ' rows)');
    totalRows += data.results.length;
  });

  // Generate .js mapper file
  var jsCode = generateMultiRecordMapperJS(neededMappings, mappingFileContents, mode, inputFile, configText);
  var jsOutputName = path.basename(inputFile, path.extname(inputFile)) + '_mapper.js';
  fs.writeFileSync(path.join(outputDir, jsOutputName), jsCode, 'utf8');
  console.log('  Generated: output/' + jsOutputName);
  console.log('  Total rows processed: ' + totalRows);

  // Step 4: Move processed files to archive (input file, mapping files, record type config)
  moveToArchive(inputDir, archiveDir, inputFile);
  moveToArchive(inputDir, archiveDir, configFile);
  // Move all user-selected mapping files (deduplicate)
  var movedFiles = {};
  userSelectedMappingFiles.forEach(function(mf) {
    if (!movedFiles[mf] && fs.existsSync(path.join(inputDir, mf))) {
      moveToArchive(inputDir, archiveDir, mf);
      movedFiles[mf] = true;
    }
  });
  console.log('  Moved processed files to archive/');

  // Step 5: Ask user if they want an HTML viewer
  var wantHTML = await ask('\n  Generate HTML viewer for the output? (y/n) [default: y]: ');
  if (!wantHTML || wantHTML.toLowerCase() === 'y') {
    var htmlPaths = [];
    Object.keys(allResults).forEach(function(outputName) {
      var data = allResults[outputName];
      if (data.results.length === 0) return;
      var htmlName = path.basename(inputFile, path.extname(inputFile)) + '_' + outputName + '_output.html';
      var htmlPath = path.join(outputDir, htmlName);
      generateOutputHTML(outputName, data.headers, data.results, htmlPath);
      console.log('  Generated: output/' + htmlName);
      htmlPaths.push(htmlPath);
    });

    // Open using explorer.exe, trigger only once
    if (htmlPaths.length > 0) {
      try { require('child_process').execSync('explorer.exe "' + htmlPaths[0] + '"'); } catch (e) {}
    }
  }

  console.log('\n  Done.');
  rl.close();
}

function moveToArchive(fromDir, archiveDir, fileName) {
  var src = path.join(fromDir, fileName);
  var dest = path.join(archiveDir, fileName);
  try {
    if (fs.existsSync(src)) {
      // If file already exists in archive, add timestamp
      if (fs.existsSync(dest)) {
        var ext = path.extname(fileName);
        var base = path.basename(fileName, ext);
        var ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        dest = path.join(archiveDir, base + '_' + ts + ext);
      }
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
    }
  } catch (e) {
    console.log('  Warning: Could not move ' + fileName + ' to archive: ' + e.message);
  }
}

// ============================================================
// ENTRY POINT
// ============================================================

main().catch(function(err) {
  console.error('  Error: ' + err.message);
  rl.close();
  process.exit(1);
});
