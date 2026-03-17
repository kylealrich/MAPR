#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
// JavaScript Mapper CLI - "Generate Mapper JS (Khaz)" as standalone .exe
// Build: npx pkg BIN/mapper-cli.js --targets node18-win-x64 --output BIN/MapperCLI.exe
// ═══════════════════════════════════════════════════════════════════════
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var child_process = require('child_process');

// ─── Resolve base directory (works as script AND as pkg .exe) ───
// When running as .exe, use the folder the .exe lives in.
// When running as script from BIN/, go one level up to project root.
var BASE_DIR = process.pkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..');
// Allow override via environment variable
if (process.env.MAPPER_BASE_DIR) { BASE_DIR = path.resolve(process.env.MAPPER_BASE_DIR); }
var INPUT_DIR = path.join(BASE_DIR, 'input');
var OUTPUT_DIR = path.join(BASE_DIR, 'output');
var ARCHIVE_DIR = path.join(BASE_DIR, 'archive');

// ─── Ensure directories exist ───
[INPUT_DIR, OUTPUT_DIR, ARCHIVE_DIR].forEach(function(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Console colors ───
var C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m',
  red: '\x1b[31m', magenta: '\x1b[35m', white: '\x1b[37m',
  bgBlue: '\x1b[44m', bgGreen: '\x1b[42m'
};

function banner() {
  console.log('');
  console.log(C.cyan + C.bold + '  ╔══════════════════════════════════════════════╗' + C.reset);
  console.log(C.cyan + C.bold + '  ║     JavaScript Mapper CLI  v1.0              ║' + C.reset);
  console.log(C.cyan + C.bold + '  ║     Generate Mapper JS (Khaz)                ║' + C.reset);
  console.log(C.cyan + C.bold + '  ╚══════════════════════════════════════════════╝' + C.reset);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════
// EMBEDDED MAPPER CORE (from mapper-core.js) - ES5 compatible
// ═══════════════════════════════════════════════════════════════════════
var incrementCounter = 0;

function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current); current = '';
      } else { current += ch; }
    }
    result.push(current);
    return result;
  });
}

function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();

  // Increment By 1
  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return incrementCounter; }

  // Hardcode
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    return logic.match(/^Hardcode\s+['"](.*)['"]$/i)[1];
  }

  // String functions
  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').replace(/^0+/, '') || '0';
  }
  if (/^RemoveTrailingSpaces\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').replace(/\s+$/, '');
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
  if (/^Multiply\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols && cols.length >= 2) {
      var n1 = cols[0].match(/\d+/)[0];
      var n2 = cols[1].match(/\d+/)[0];
      return parseFloat(data[n1 - 1] || '0') * parseFloat(data[n2 - 1] || '0');
    }
  }
  if (/^Divide\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols && cols.length >= 2) {
      var n1 = cols[0].match(/\d+/)[0];
      var n2 = cols[1].match(/\d+/)[0];
      var divisor = parseFloat(data[n2 - 1] || '0');
      if (divisor === 0) throw new Error('Division by zero');
      return parseFloat(data[n1 - 1] || '0') / divisor;
    }
  }
  if (/^Round\(/i.test(logic)) {
    var m = logic.match(/Round\(Column(\d+),\s*(\d+)\)/i);
    if (m) return parseFloat(parseFloat(data[m[1] - 1] || '0').toFixed(parseInt(m[2])));
  }
  if (/^Abs\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return Math.abs(parseFloat(data[col[1] - 1] || '0'));
  }
  if (/^Max\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return Math.max.apply(null, cols.map(function(c) { return parseFloat(data[c.match(/\d+/)[0] - 1] || '0'); }));
  }
  if (/^Min\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return Math.min.apply(null, cols.map(function(c) { return parseFloat(data[c.match(/\d+/)[0] - 1] || '0'); }));
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
    var m = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (m) return (data[m[1] - 1] || '').substring(0, parseInt(m[2]));
  }
  if (/^Right\(/i.test(logic)) {
    var m = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (m) return (data[m[1] - 1] || '').slice(-parseInt(m[2]));
  }
  if (/^Replace\(/i.test(logic)) {
    var m = logic.match(/Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (m) return (data[m[1] - 1] || '').split(m[2]).join(m[3]);
  }
  if (/^PadLeft\(/i.test(logic)) {
    var m = logic.match(/PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (m) { var v = data[m[1] - 1] || ''; var len = parseInt(m[2]); var ch = m[3]; while (v.length < len) v = ch + v; return v; }
  }
  if (/^PadRight\(/i.test(logic)) {
    var m = logic.match(/PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (m) { var v = data[m[1] - 1] || ''; var len = parseInt(m[2]); var ch = m[3]; while (v.length < len) v = v + ch; return v; }
  }
  if (/^AddLeft\(/i.test(logic)) {
    var m = logic.match(/AddLeft\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (m) { var v = data[m[1] - 1] || ''; for (var i = 0; i < parseInt(m[3]); i++) v = m[2] + v; return v; }
  }
  if (/^AddRight\(/i.test(logic)) {
    var m = logic.match(/AddRight\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (m) { var v = data[m[1] - 1] || ''; for (var i = 0; i < parseInt(m[3]); i++) v = v + m[2]; return v; }
  }
  if (/^Substring\(/i.test(logic)) {
    var m = logic.match(/Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)/i);
    if (m) return (data[m[1] - 1] || '').substring(parseInt(m[2]) - 1, parseInt(m[2]) - 1 + parseInt(m[3]));
  }
  if (/^DateReformat\(/i.test(logic)) {
    var m = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (m) {
      var dateStr = data[m[1] - 1] || '';
      var inFmt = m[2].toUpperCase();
      var outFmt = m[3].toUpperCase();
      if (inFmt === 'MMDDYYYY' && outFmt === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      if (inFmt === 'YYYYMMDD' && outFmt === 'MMDDYYYY' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }

  // String concatenation with + operator
  if (/\+/.test(logic) && /Column\d+/i.test(logic)) {
    return logic.replace(/Right\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col - 1] || '').slice(-parseInt(len));
    }).replace(/Left\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col - 1] || '').substring(0, parseInt(len));
    }).replace(/Column(\d+)/gi, function(match, col) {
      return data[col - 1] || '';
    }).replace(/\s*\+\s*/g, '');
  }

  // Conditional Logic
  if (/^If\s/i.test(logic)) {
    var sm = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (sm) {
      var condRef = sm[1].trim();
      if (/Column(\d+)/i.test(condRef)) {
        var cn = condRef.match(/Column(\d+)/i)[1];
        condRef = data[cn - 1] || '';
      }
      var op = sm[2];
      var cmpVal = sm[3];
      var thenRes = sm[4];
      var elseRes = sm[5] || '';
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
  if (/^['"].*['"]$/.test(logic)) { return logic.slice(1, -1); }

  // Today / Now
  if (/^Today\(/i.test(logic)) {
    var today = new Date();
    var fm = logic.match(/Today\('([^']*)'\)/i);
    function pad(n) { return n < 10 ? '0' + n : n; }
    if (fm) {
      switch (fm[1].toUpperCase()) {
        case 'YYYYMMDD': return today.getFullYear() + '' + pad(today.getMonth() + 1) + pad(today.getDate());
        case 'YYYY-MM-DD': return today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
        case 'MM/DD/YYYY': return pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();
        default: return today.toLocaleDateString('en-US');
      }
    }
    return today.toLocaleDateString('en-US');
  }
  if (/^Now\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }

  // Unquoted static values (no column refs, no known functions)
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|RemoveTrailingSpaces|Trim|Concat|Sum|Multiply|Divide|Round|Abs|Max|Min|Uppercase|Lowercase|Left|Right|Replace|PadLeft|PadRight|AddLeft|AddRight|Substring|DateReformat|If|Today|Now|Increment|IsEmpty|IsNumeric|ValidateLength|ValidateRange|ValidateFormat)/i.test(logic) && !/\+/.test(logic)) {
    return logic;
  }

  // Direct column reference
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) { return data[colMatch[1] - 1] || ''; }

  return null;
}

// ─── Dynamic Mapper Factory ───
function createDynamicMapper(mappingData) {
  var mappingRules = [];
  var headers = [];
  incrementCounter = 0;

  mappingData.forEach(function(m) {
    var field = m['targetfieldname'] || '';
    if (!field) return;
    var logic = m['mappinglogic'] || '';
    var colNum = m['inputcolumnnumber'] || '';
    var required = (m['required'] || '').toUpperCase() === 'Y';
    mappingRules.push({ field: field, logic: logic, colNum: colNum ? parseInt(colNum) - 1 : null, required: required });
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

// ─── Main Transform ───
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
    var results = inputData.map(function(row, index) { return mapper.mapRecord(row, index); });
    var csvLines = [mapper.headers.join(',')];
    results.forEach(function(r) {
      var row = mapper.headers.map(function(h) {
        var v = r[h] != null ? r[h].toString() : '';
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      });
      csvLines.push(row.join(','));
    });
    return { success: true, transformedData: results, csvOutput: csvLines.join('\n'), headers: mapper.headers, error: null, mappings: parsedMappings };
  } catch (error) {
    return { success: false, transformedData: null, csvOutput: null, headers: null, error: error.message, mappings: null };
  }
}

// ─── Fixed-Length Parser ───
function parseFixedLength(text, mappingData) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.length > 0; });
  var results = [];
  lines.forEach(function(line) {
    var record = {};
    mappingData.forEach(function(m) {
      var start = parseInt(m['startposition'] || m['start'] || '0') - 1;
      var len = parseInt(m['length'] || m['fieldlength'] || '0');
      var fieldName = m['targetfieldname'] || m['fieldname'] || '';
      if (fieldName && len > 0) {
        record[fieldName] = line.substring(start, start + len);
      }
    });
    results.push(record);
  });
  return results;
}

// ═══════════════════════════════════════════════════════════════════════
// JS CODE GENERATORS (Runtime Flexible & Self Contained)
// ═══════════════════════════════════════════════════════════════════════

function generateRuntimeFlexibleJS(mappings, delimiter, skipRows) {
  var lines = [];
  lines.push('// Runtime Flexible Mapper - Generated ' + new Date().toLocaleString());
  lines.push('// This mapper dynamically applies transformation rules at runtime.');
  lines.push('var fs = require(\'fs\');');
  lines.push('');
  lines.push('// ─── Embedded Core Engine ───');
  lines.push('var incrementCounter = 0;');
  lines.push('');
  lines.push(parseCSV.toString());
  lines.push('');
  lines.push(normalizeKey.toString());
  lines.push('');
  lines.push(applyLogic.toString());
  lines.push('');
  lines.push(createDynamicMapper.toString());
  lines.push('');
  lines.push(transformData.toString());
  lines.push('');
  lines.push('// ─── Mapping Configuration ───');
  lines.push('var MAPPING_TABLE = ' + JSON.stringify(mappings, null, 2) + ';');
  lines.push('');
  lines.push('// ─── Process Function ───');
  lines.push('function processFile(inputPath, outputPath, delimiter, skipRows) {');
  lines.push('  var inputText = fs.readFileSync(inputPath, \'utf8\');');
  lines.push('  var mapper = createDynamicMapper(MAPPING_TABLE);');
  lines.push('  var allData = parseCSV(inputText, delimiter);');
  lines.push('  var inputData = allData.slice(skipRows || 0);');
  lines.push('  var results = inputData.map(function(row, idx) { return mapper.mapRecord(row, idx); });');
  lines.push('  var csvLines = [mapper.headers.join(\',\')];');
  lines.push('  results.forEach(function(r) {');
  lines.push('    var row = mapper.headers.map(function(h) {');
  lines.push('      var v = r[h] != null ? r[h].toString() : \'\';');
  lines.push('      return /[",\\n]/.test(v) ? \'"\' + v.replace(/"/g, \'""\')+\'"\' : v;');
  lines.push('    });');
  lines.push('    csvLines.push(row.join(\',\'));');
  lines.push('  });');
  lines.push('  fs.writeFileSync(outputPath, csvLines.join(\'\\n\'));');
  lines.push('  console.log(\'Processed \' + results.length + \' records -> \' + outputPath);');
  lines.push('  return { success: true, count: results.length };');
  lines.push('}');
  lines.push('');
  lines.push('// ─── CLI Entry Point ───');
  lines.push('if (require.main === module) {');
  lines.push('  var args = process.argv.slice(2);');
  lines.push('  if (args.length < 2) { console.log(\'Usage: node mapper.js <input> <output> [delimiter] [skipRows]\'); process.exit(1); }');
  lines.push('  processFile(args[0], args[1], args[2] || \'' + delimiter + '\', parseInt(args[3]) || ' + skipRows + ');');
  lines.push('}');
  lines.push('');
  lines.push('if (typeof module !== \'undefined\' && module.exports) {');
  lines.push('  module.exports = { processFile: processFile, transformData: transformData, applyLogic: applyLogic };');
  lines.push('}');
  return lines.join('\n');
}

function generateSelfContainedJS(mappings, inputData, delimiter, skipRows) {
  var result = transformData(inputData, '', delimiter, skipRows);
  // Parse mappings for hardcoded rules
  var mappingRows = parseCSV(inputData, delimiter);

  var lines = [];
  lines.push('// Self-Contained Mapper - Generated ' + new Date().toLocaleString());
  lines.push('// Transformation rules are hardcoded into this file.');
  lines.push('var fs = require(\'fs\');');
  lines.push('');
  lines.push(parseCSV.toString());
  lines.push('');
  lines.push('var incrementCounter = 0;');
  lines.push('');
  lines.push('// ─── Hardcoded Transformation Rules ───');
  lines.push('var RULES = ' + JSON.stringify(mappings, null, 2) + ';');
  lines.push('');
  lines.push('function mapRow(data, rowIndex) {');
  lines.push('  var result = {};');
  mappings.forEach(function(m) {
    var field = m['targetfieldname'] || '';
    var logic = m['mappinglogic'] || '';
    var colNum = m['inputcolumnnumber'] || '';
    if (!field) return;
    lines.push('  // ' + field);
    if (logic && logic.trim()) {
      if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
        var val = logic.match(/^Hardcode\s+['"](.*)['"]$/i)[1];
        lines.push('  result[\'' + field + '\'] = \'' + val.replace(/'/g, "\\'") + '\';');
      } else if (/^Increment By 1$/i.test(logic)) {
        lines.push('  incrementCounter++;');
        lines.push('  result[\'' + field + '\'] = incrementCounter;');
      } else if (/^['"].*['"]$/.test(logic)) {
        lines.push('  result[\'' + field + '\'] = \'' + logic.slice(1, -1).replace(/'/g, "\\'") + '\';');
      } else if (/^Column(\d+)$/i.test(logic)) {
        var cn = logic.match(/^Column(\d+)$/i)[1];
        lines.push('  result[\'' + field + '\'] = data[' + (parseInt(cn) - 1) + '] || \'\';');
      } else {
        // Complex logic - embed applyLogic call
        lines.push('  result[\'' + field + '\'] = applyLogic(\'' + logic.replace(/'/g, "\\'") + '\', data, \'' + field + '\', rowIndex);');
      }
    } else if (colNum) {
      lines.push('  result[\'' + field + '\'] = data[' + (parseInt(colNum) - 1) + '] || \'\';');
    } else {
      lines.push('  result[\'' + field + '\'] = null;');
    }
  });
  lines.push('  return result;');
  lines.push('}');
  lines.push('');
  lines.push(applyLogic.toString());
  lines.push('');
  lines.push('// ─── Process Function ───');
  lines.push('function processFile(inputPath, outputPath, delimiter, skipRows) {');
  lines.push('  var inputText = fs.readFileSync(inputPath, \'utf8\');');
  lines.push('  var allData = parseCSV(inputText, delimiter);');
  lines.push('  var inputData = allData.slice(skipRows || 0);');
  lines.push('  incrementCounter = 0;');
  var headerNames = mappings.map(function(m) { return m['targetfieldname'] || ''; }).filter(function(f) { return f; });
  lines.push('  var headers = ' + JSON.stringify(headerNames) + ';');
  lines.push('  var results = inputData.map(function(row, idx) { return mapRow(row, idx); });');
  lines.push('  var csvLines = [headers.join(\',\')];');
  lines.push('  results.forEach(function(r) {');
  lines.push('    var row = headers.map(function(h) {');
  lines.push('      var v = r[h] != null ? r[h].toString() : \'\';');
  lines.push('      return /[",\\n]/.test(v) ? \'"\' + v.replace(/"/g, \'""\')+\'"\' : v;');
  lines.push('    });');
  lines.push('    csvLines.push(row.join(\',\'));');
  lines.push('  });');
  lines.push('  fs.writeFileSync(outputPath, csvLines.join(\'\\n\'));');
  lines.push('  console.log(\'Processed \' + results.length + \' records -> \' + outputPath);');
  lines.push('  return { success: true, count: results.length };');
  lines.push('}');
  lines.push('');
  lines.push('if (require.main === module) {');
  lines.push('  var args = process.argv.slice(2);');
  lines.push('  if (args.length < 2) { console.log(\'Usage: node mapper.js <input> <output> [delimiter] [skipRows]\'); process.exit(1); }');
  lines.push('  processFile(args[0], args[1], args[2] || \'' + delimiter + '\', parseInt(args[3]) || ' + skipRows + ');');
  lines.push('}');
  lines.push('');
  lines.push('if (typeof module !== \'undefined\' && module.exports) {');
  lines.push('  module.exports = { processFile: processFile, mapRow: mapRow };');
  lines.push('}');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// HTML OUTPUT VIEWER GENERATOR (Function_Reference.html theme)
// ═══════════════════════════════════════════════════════════════════════

function generateOutputHTML(csvOutput, outputName) {
  var rows = parseCSV(csvOutput, ',');
  var headers = rows[0] || [];
  var dataRows = rows.slice(1);

  var html = [];
  html.push('<!DOCTYPE html>');
  html.push('<html lang="en"><head><meta charset="UTF-8">');
  html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  html.push('<title>Mapped Output - ' + outputName + '</title>');
  html.push('<style>');
  html.push("@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');");
  html.push('*, *::before, *::after { box-sizing: border-box; }');
  html.push('body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');
  html.push('  background: linear-gradient(rgba(248,250,252,0.9), rgba(248,250,252,0.9)),');
  html.push('    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px),');
  html.push('    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px),');
  html.push('    radial-gradient(circle at 20px 20px, rgba(59,130,246,0.15) 2px, transparent 2px), #f8fafc;');
  html.push('  background-size: 40px 40px; color: #1f2937; margin: 0; padding: 20px; min-height: 100vh; }');
  html.push('.container { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1);');
  html.push('  padding: 32px; max-width: 98%; margin: auto; border: 1px solid #e5e7eb; }');
  html.push('h1 { font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 4px 0; }');
  html.push('.title-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);');
  html.push('  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }');
  html.push('.subtitle { text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px; }');
  html.push('.gradient-divider { height: 4px; background: linear-gradient(90deg, #1e3a8a 0%, #3730a3 25%, #5b21b6 50%, #7c2d12 75%, #1e40af 100%);');
  html.push('  border-radius: 2px; margin-bottom: 24px; }');
  html.push('.stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }');
  html.push('.stat-card { background: linear-gradient(135deg, #eff6ff, #f5f3ff); border: 1px solid #c7d2fe;');
  html.push('  border-radius: 8px; padding: 12px 20px; font-size: 14px; color: #3730a3; font-weight: 600; }');
  html.push('.stat-card span { font-size: 20px; font-weight: 700; color: #4f46e5; }');
  html.push('.search-box { margin-bottom: 16px; position: relative; }');
  html.push('.search-box input { width: 100%; padding: 10px 12px 10px 38px; border: 1px solid #d1d5db;');
  html.push('  border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }');
  html.push('.search-box input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }');
  html.push('table { width: 100%; border-collapse: collapse; font-size: 13px; }');
  html.push('thead th { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 10px 12px;');
  html.push('  text-align: left; font-weight: 600; position: sticky; top: 0; white-space: nowrap; }');
  html.push('tbody tr:nth-child(even) { background: #f9fafb; }');
  html.push('tbody tr:hover { background: #eff6ff; }');
  html.push('tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }');
  html.push('.table-wrap { overflow-x: auto; max-height: 70vh; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; }');
  html.push('</style></head><body>');
  html.push('<div class="container">');
  html.push('<h1><span class="title-text">Mapped Output Viewer</span></h1>');
  html.push('<p class="subtitle">' + outputName + ' &mdash; Generated ' + new Date().toLocaleString() + '</p>');
  html.push('<div class="gradient-divider"></div>');
  html.push('<div class="stats">');
  html.push('<div class="stat-card">Rows: <span>' + dataRows.length + '</span></div>');
  html.push('<div class="stat-card">Columns: <span>' + headers.length + '</span></div>');
  html.push('</div>');
  html.push('<div class="search-box"><input type="text" id="search" placeholder="Search rows..." oninput="filterRows()"></div>');
  html.push('<div class="table-wrap"><table><thead><tr>');
  html.push('<th>#</th>');
  headers.forEach(function(h) { html.push('<th>' + escapeHTML(h) + '</th>'); });
  html.push('</tr></thead><tbody id="tbody">');
  dataRows.forEach(function(row, idx) {
    html.push('<tr>');
    html.push('<td>' + (idx + 1) + '</td>');
    row.forEach(function(cell) { html.push('<td title="' + escapeHTML(cell) + '">' + escapeHTML(cell) + '</td>'); });
    html.push('</tr>');
  });
  html.push('</tbody></table></div></div>');
  html.push('<script>function filterRows(){var s=document.getElementById("search").value.toLowerCase();');
  html.push('var rows=document.getElementById("tbody").getElementsByTagName("tr");');
  html.push('for(var i=0;i<rows.length;i++){rows[i].style.display=rows[i].textContent.toLowerCase().indexOf(s)>-1?"":"none";}');
  html.push('}<\/script></body></html>');
  return html.join('\n');
}

function escapeHTML(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════════════════════
// INTERACTIVE CLI WIZARD (mirrors the Khaz hook flow)
// ═══════════════════════════════════════════════════════════════════════

var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(function(resolve) {
    rl.question(C.yellow + '  ? ' + C.reset + question + ' ', function(answer) {
      resolve(answer.trim());
    });
  });
}

function askChoice(question, options) {
  return new Promise(function(resolve) {
    console.log(C.yellow + '  ? ' + C.reset + question);
    options.forEach(function(opt, idx) {
      console.log(C.cyan + '    [' + (idx + 1) + '] ' + C.reset + opt);
    });
    rl.question(C.yellow + '    > ' + C.reset, function(answer) {
      var num = parseInt(answer.trim());
      if (num >= 1 && num <= options.length) {
        resolve(num);
      } else {
        resolve(1);
      }
    });
  });
}

function listInputFiles(ext) {
  if (!fs.existsSync(INPUT_DIR)) return [];
  return fs.readdirSync(INPUT_DIR).filter(function(f) {
    if (!ext) return true;
    var exts = ext.split('|');
    var fLower = f.toLowerCase();
    return exts.some(function(e) { return fLower.endsWith(e); });
  });
}

function askFileChoice(question, ext) {
  return new Promise(function(resolve) {
    var files = listInputFiles(ext);
    if (files.length === 0) {
      console.log(C.red + '  No matching files found in ' + INPUT_DIR + C.reset);
      resolve(null);
      return;
    }
    console.log(C.yellow + '  ? ' + C.reset + question);
    files.forEach(function(f, idx) {
      console.log(C.cyan + '    [' + (idx + 1) + '] ' + C.reset + f);
    });
    rl.question(C.yellow + '    > ' + C.reset, function(answer) {
      var num = parseInt(answer.trim());
      if (num >= 1 && num <= files.length) {
        resolve(files[num - 1]);
      } else {
        resolve(files[0]);
      }
    });
  });
}

function moveToArchive(filePath) {
  var fileName = path.basename(filePath);
  var dest = path.join(ARCHIVE_DIR, fileName);
  // Avoid overwrite by appending timestamp
  if (fs.existsSync(dest)) {
    var ext = path.extname(fileName);
    var base = path.basename(fileName, ext);
    var ts = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);
    dest = path.join(ARCHIVE_DIR, base + '_' + ts + ext);
  }
  fs.copyFileSync(filePath, dest);
  fs.unlinkSync(filePath);
  console.log(C.dim + '    Archived: ' + fileName + ' -> archive/' + path.basename(dest) + C.reset);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN WIZARD FLOW
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  banner();

  console.log(C.dim + '  Working directory: ' + BASE_DIR + C.reset);
  console.log(C.dim + '  Input folder:      ' + INPUT_DIR + C.reset);
  console.log('');

  // Step 1: File type
  var fileType = await askChoice('Is the input file Delimited or Fixed-Length?', ['Delimited', 'Fixed-Length']);

  var inputFile, mappingFile, delimiter, skipRows, configFile, recordMappings;
  var filesToArchive = [];

  if (fileType === 1) {
    // ─── DELIMITED FLOW ───
    console.log(C.green + '\n  ── Delimited File Setup ──' + C.reset);

    inputFile = await askFileChoice('Which file is the input data file?', '.csv|.txt|.tsv|.dat');
    if (!inputFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
    filesToArchive.push(path.join(INPUT_DIR, inputFile));

    mappingFile = await askFileChoice('Which file is the mapping .csv file?', '.csv');
    if (!mappingFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
    filesToArchive.push(path.join(INPUT_DIR, mappingFile));

    var delimChoice = await askChoice('What delimiter is used in the input data file?', ['Comma (,)', 'Pipe (|)', 'Tab', 'Semicolon (;)', 'Other']);
    var delimMap = { 1: ',', 2: '|', 3: '\t', 4: ';' };
    if (delimChoice === 5) {
      delimiter = await ask('Enter the delimiter character:');
    } else {
      delimiter = delimMap[delimChoice] || ',';
    }

    var skipAnswer = await ask('How many rows to skip from top of input file? (0 for none):');
    skipRows = parseInt(skipAnswer) || 0;

  } else {
    // ─── FIXED-LENGTH FLOW ───
    console.log(C.green + '\n  ── Fixed-Length File Setup ──' + C.reset);

    var isMulti = await askChoice('Is the input data file a multi-record file?', ['No (single record type)', 'Yes (multi-record)']);

    if (isMulti === 1) {
      inputFile = await askFileChoice('Which file is the input data file?', '.txt|.dat|.csv');
      if (!inputFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
      filesToArchive.push(path.join(INPUT_DIR, inputFile));

      mappingFile = await askFileChoice('Which file is the mapping .csv file?', '.csv');
      if (!mappingFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
      filesToArchive.push(path.join(INPUT_DIR, mappingFile));
    } else {
      inputFile = await askFileChoice('Which file is the input data file?', '.txt|.dat');
      if (!inputFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
      filesToArchive.push(path.join(INPUT_DIR, inputFile));

      configFile = await askFileChoice('Which file is the record type config file?', '.csv');
      if (!configFile) { console.log(C.red + '  Aborting.' + C.reset); rl.close(); return; }
      filesToArchive.push(path.join(INPUT_DIR, configFile));

      // Parse config to find referenced mapping files
      var configText = fs.readFileSync(path.join(INPUT_DIR, configFile), 'utf8');
      var configRows = parseCSV(configText, ',');
      var configHeaders = configRows[0].map(normalizeKey);
      recordMappings = {};

      console.log(C.green + '\n  ── Record Type Mapping Files ──' + C.reset);
      for (var ci = 1; ci < configRows.length; ci++) {
        var configObj = {};
        for (var cj = 0; cj < configHeaders.length; cj++) {
          configObj[configHeaders[cj]] = (configRows[ci][cj] || '').trim();
        }
        var recType = configObj['recordtype'] || configObj['type'] || configObj['recordtypeid'] || ('Type' + ci);
        var mapFile = configObj['mappingfile'] || configObj['mappingfilename'] || '';
        if (mapFile) {
          console.log(C.dim + '    Config references: ' + mapFile + ' for record type "' + recType + '"' + C.reset);
          var actualFile = await askFileChoice('Which file is the mapping for record type "' + recType + '" (' + mapFile + ')?', '.csv');
          if (actualFile) {
            recordMappings[recType] = actualFile;
            filesToArchive.push(path.join(INPUT_DIR, actualFile));
          }
        }
      }
    }
    delimiter = null;
    skipRows = 0;
  }

  // Step 2: Generation Type
  console.log('');
  var genType = await askChoice('Preferred Generation Type?', [
    'Runtime Flexible - Dynamic approach, JS code is flexible and reusable',
    'Self Contained - Static approach, transformation rules hardcoded into JS'
  ]);

  // Step 3: Process and generate
  console.log(C.green + '\n  ── Processing ──' + C.reset);

  var inputText = fs.readFileSync(path.join(INPUT_DIR, inputFile), 'utf8');
  var baseName = path.basename(inputFile, path.extname(inputFile));
  var timestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);

  var csvOutput, jsCode, outputCsvName, outputJsName;

  if (fileType === 1) {
    // Delimited processing
    var mappingText = fs.readFileSync(path.join(INPUT_DIR, mappingFile), 'utf8');
    var result = transformData(inputText, mappingText, delimiter, skipRows);

    if (!result.success) {
      console.log(C.red + '  Error: ' + result.error + C.reset);
      rl.close();
      return;
    }

    csvOutput = result.csvOutput;
    console.log(C.green + '  Transformed ' + result.transformedData.length + ' records with ' + result.headers.length + ' columns.' + C.reset);

    // Generate JS mapper
    if (genType === 1) {
      jsCode = generateRuntimeFlexibleJS(result.mappings, delimiter, skipRows);
      outputJsName = baseName + '_RuntimeFlexible_Mapper.js';
    } else {
      jsCode = generateSelfContainedJS(result.mappings, inputText, delimiter, skipRows);
      outputJsName = baseName + '_SelfContained_Mapper.js';
    }
    outputCsvName = baseName + '_Mapped.csv';

  } else {
    // Fixed-length processing (single record type for now)
    if (mappingFile) {
      var mappingText = fs.readFileSync(path.join(INPUT_DIR, mappingFile), 'utf8');
      var mappingRows = parseCSV(mappingText, ',');
      var mappingHeaders = mappingRows[0].map(normalizeKey);
      var parsedMappings = [];
      for (var mi = 1; mi < mappingRows.length; mi++) {
        var obj = {};
        for (var mj = 0; mj < mappingHeaders.length; mj++) {
          obj[mappingHeaders[mj]] = (mappingRows[mi][mj] || '').trim();
        }
        parsedMappings.push(obj);
      }

      var records = parseFixedLength(inputText, parsedMappings);
      var headers = parsedMappings.map(function(m) { return m['targetfieldname'] || m['fieldname'] || ''; }).filter(function(f) { return f; });

      var csvLines = [headers.join(',')];
      records.forEach(function(r) {
        var row = headers.map(function(h) {
          var v = r[h] != null ? r[h].toString().trim() : '';
          return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        });
        csvLines.push(row.join(','));
      });
      csvOutput = csvLines.join('\n');
      console.log(C.green + '  Parsed ' + records.length + ' fixed-length records with ' + headers.length + ' fields.' + C.reset);

      jsCode = '// Fixed-Length Mapper - Generated ' + new Date().toLocaleString() + '\n';
      jsCode += '// Record type: single\n';
      jsCode += 'var fs = require(\'fs\');\n\n';
      jsCode += 'var FIELD_DEFS = ' + JSON.stringify(parsedMappings, null, 2) + ';\n\n';
      jsCode += parseFixedLength.toString() + '\n\n';
      jsCode += 'function processFile(inputPath, outputPath) {\n';
      jsCode += '  var text = fs.readFileSync(inputPath, \'utf8\');\n';
      jsCode += '  var records = parseFixedLength(text, FIELD_DEFS);\n';
      jsCode += '  var headers = ' + JSON.stringify(headers) + ';\n';
      jsCode += '  var csvLines = [headers.join(\',\')];\n';
      jsCode += '  records.forEach(function(r) {\n';
      jsCode += '    var row = headers.map(function(h) { var v = r[h] != null ? r[h].toString().trim() : \'\'; return /[",\\n]/.test(v) ? \'"\'+v.replace(/"/g,\'""\')+ \'"\' : v; });\n';
      jsCode += '    csvLines.push(row.join(\',\'));\n';
      jsCode += '  });\n';
      jsCode += '  fs.writeFileSync(outputPath, csvLines.join(\'\\n\'));\n';
      jsCode += '  console.log(\'Processed \' + records.length + \' records -> \' + outputPath);\n';
      jsCode += '}\n\n';
      jsCode += 'if (require.main === module) {\n';
      jsCode += '  var args = process.argv.slice(2);\n';
      jsCode += '  if (args.length < 2) { console.log(\'Usage: node mapper.js <input> <output>\'); process.exit(1); }\n';
      jsCode += '  processFile(args[0], args[1]);\n';
      jsCode += '}\n';
      jsCode += 'if (typeof module !== \'undefined\' && module.exports) { module.exports = { processFile: processFile }; }\n';

      outputJsName = baseName + '_FixedLength_Mapper.js';
    } else {
      // Multi-record: process each record type
      console.log(C.yellow + '  Multi-record processing...' + C.reset);
      var allCsvOutputs = [];
      var allJsCode = '// Multi-Record Fixed-Length Mapper - Generated ' + new Date().toLocaleString() + '\n';

      for (var recType in recordMappings) {
        var mapFileName = recordMappings[recType];
        var mapText = fs.readFileSync(path.join(INPUT_DIR, mapFileName), 'utf8');
        var mapRows = parseCSV(mapText, ',');
        var mapHeaders = mapRows[0].map(normalizeKey);
        var parsed = [];
        for (var ri = 1; ri < mapRows.length; ri++) {
          var o = {};
          for (var rj = 0; rj < mapHeaders.length; rj++) { o[mapHeaders[rj]] = (mapRows[ri][rj] || '').trim(); }
          parsed.push(o);
        }
        var recs = parseFixedLength(inputText, parsed);
        var hdrs = parsed.map(function(m) { return m['targetfieldname'] || m['fieldname'] || ''; }).filter(function(f) { return f; });
        var lines = [hdrs.join(',')];
        recs.forEach(function(r) {
          var row = hdrs.map(function(h) { var v = r[h] != null ? r[h].toString().trim() : ''; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; });
          lines.push(row.join(','));
        });
        allCsvOutputs.push('// Record Type: ' + recType + '\n' + lines.join('\n'));
        console.log(C.green + '  Record type "' + recType + '": ' + recs.length + ' records, ' + hdrs.length + ' fields.' + C.reset);
      }
      csvOutput = allCsvOutputs.join('\n\n');
      jsCode = allJsCode;
      outputJsName = baseName + '_MultiRecord_Mapper.js';
    }
    outputCsvName = baseName + '_Mapped.csv';
  }

  // Write output files
  var csvPath = path.join(OUTPUT_DIR, outputCsvName);
  var jsPath = path.join(OUTPUT_DIR, outputJsName);
  fs.writeFileSync(csvPath, csvOutput);
  fs.writeFileSync(jsPath, jsCode);
  console.log(C.green + '\n  Output files:' + C.reset);
  console.log(C.cyan + '    CSV: ' + C.reset + 'output/' + outputCsvName);
  console.log(C.cyan + '    JS:  ' + C.reset + 'output/' + outputJsName);

  // Step 4: Archive processed files
  console.log(C.green + '\n  ── Archiving Input Files ──' + C.reset);
  filesToArchive.forEach(function(fp) {
    if (fs.existsSync(fp)) moveToArchive(fp);
  });

  // Step 5: HTML viewer
  console.log('');
  var wantHTML = await askChoice('Create an HTML viewer for the mapped output?', ['Yes', 'No']);
  if (wantHTML === 1) {
    var htmlContent = generateOutputHTML(csvOutput, outputCsvName);
    var htmlName = baseName + '_Mapped_Viewer.html';
    var htmlPath = path.join(OUTPUT_DIR, htmlName);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(C.cyan + '    HTML: ' + C.reset + 'output/' + htmlName);

    // Open in browser
    try {
      child_process.exec('explorer.exe "' + htmlPath + '"');
      console.log(C.dim + '    Opened in browser.' + C.reset);
    } catch (e) {
      console.log(C.dim + '    Could not auto-open. Open manually: ' + htmlPath + C.reset);
    }
  }

  console.log(C.green + C.bold + '\n  Done!' + C.reset);
  console.log('');
  rl.close();
}

// ─── Entry Point ───
main().catch(function(err) {
  console.error(C.red + '  Fatal error: ' + err.message + C.reset);
  rl.close();
  process.exit(1);
});
