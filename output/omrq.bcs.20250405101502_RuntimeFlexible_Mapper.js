// Auto-generated Runtime Flexible Multi-Record Fixed-Length Mapper
// Generated: 2026-03-21 22:49:26
// Type: Fixed-Length Multi-Record
// Input: omrq.bcs.20250405101502.txt
// Config: OMRQ_RecordType_Config.csv

var fs = require('fs');

function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = []; var current = ''; var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delimiter && !inQuotes) { result.push(current); current = ''; }
      else { current += ch; }
    }
    result.push(current); return result;
  });
}

function normalizeKey(k) { return k.replace(/\s+/g, '').trim().toLowerCase(); }
var incrementCounter = 0;

function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }
  if (/^Hardcode\s+['"](.*)['"]/i.test(logic)) { return logic.match(/^Hardcode\s+['"](.*)['"]/i)[1]; }
  if (/^['"].*['"]$/.test(logic)) { return logic.slice(1, -1); }
  if (/^RemoveLeadingZeroes\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }
  if (/^RemoveTrailingSpaces\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\s+$/,''); }
  if (/^Trim\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }
  if (/^Uppercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }
  if (/^Lowercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }
  if (/^Left\(/i.test(logic)) { var m=logic.match(/Left\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }
  if (/^Right\(/i.test(logic)) { var m=logic.match(/Right\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }
  if (/^Substring\(/i.test(logic)) { var m=logic.match(/Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').substring(parseInt(m[2])-1,parseInt(m[2])-1+parseInt(m[3])); }
  if (/^Concat\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\d+/)[0];return data[n-1]||'';}).join(''); }
  if (/^Replace\(/i.test(logic)) { var m=logic.match(/Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m) return (data[m[1]-1]||'').split(m[2]).join(m[3]); }
  if (/^PadLeft\(/i.test(logic)) { var m=logic.match(/PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=m[3]+v;return v;} }
  if (/^PadRight\(/i.test(logic)) { var m=logic.match(/PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=v+m[3];return v;} }
  if (/^Sum\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs){var t=0;cs.forEach(function(c){var n=c.match(/\d+/)[0];t+=parseFloat(data[n-1]||'0')||0;});return String(t);} }
  if (/^Multiply\(/i.test(logic)) { var m=logic.match(/Multiply\(Column(\d+),\s*Column(\d+)\)/i); if(m) return String((parseFloat(data[m[1]-1])||0)*(parseFloat(data[m[2]-1])||0)); }
  if (/^Divide\(/i.test(logic)) { var m=logic.match(/Divide\(Column(\d+),\s*Column(\d+)\)/i); if(m){var b=parseFloat(data[m[2]-1])||0;return b!==0?String((parseFloat(data[m[1]-1])||0)/b):'0';} }
  if (/^Round\(/i.test(logic)) { var m=logic.match(/Round\(Column(\d+),\s*(\d+)\)/i); if(m) return String(parseFloat((parseFloat(data[m[1]-1])||0).toFixed(parseInt(m[2])))); }
  if (/^Abs\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return String(Math.abs(parseFloat(data[c[1]-1])||0)); }
  if (/^DateReformat\(/i.test(logic)) { var m=logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m){var d=(data[m[1]-1]||'').trim();var inf=m[2].toUpperCase();var outf=m[3].toUpperCase();if(inf==='MMDDYYYY'&&outf==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MMDDYYYY'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MM/DD/YYYY'&&d.length===8)return d.substring(4,6)+'/'+d.substring(6,8)+'/'+d.substring(0,4);return d;} }
  if (/^Today\(/i.test(logic)) { var d=new Date();function pad(n){return n<10?'0'+n:n;}var fm=logic.match(/Today\('([^']*)'\)/i);if(fm){var fmt=fm[1].toUpperCase();if(fmt==='YYYYMMDD')return d.getFullYear()+''+pad(d.getMonth()+1)+pad(d.getDate());if(fmt==='YYYY-MM-DD')return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());if(fmt==='MM/DD/YYYY')return pad(d.getMonth()+1)+'/'+pad(d.getDate())+'/'+d.getFullYear();}return d.toLocaleDateString('en-US'); }
  if (/^Now\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }
  if (/^If\s/i.test(logic)) { var sm=logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);if(sm){var cr=sm[1].trim();var colR=cr.match(/Column(\d+)/i);if(colR)cr=data[colR[1]-1]||'';var op=sm[2];var cv=sm[3];var tv=sm[4];var ev=sm[5]||'';var tr2=tv.match(/Column(\d+)/i);if(tr2)tv=data[tr2[1]-1]||'';var er2=ev.match(/Column(\d+)/i);if(er2)ev=data[er2[1]-1]||'';var cond=false;if(op==='=='||op==='=')cond=cr==cv;else if(op==='!=')cond=cr!=cv;else if(op==='>')cond=parseFloat(cr)>parseFloat(cv);else if(op==='<')cond=parseFloat(cr)<parseFloat(cv);else if(op==='>=')cond=parseFloat(cr)>=parseFloat(cv);else if(op==='<=')cond=parseFloat(cr)<=parseFloat(cv);return cond?tv:ev;} }
  if (/\+/.test(logic)) { return logic.replace(/Right\(Column(\d+),\s*(\d+)\)/gi,function(m,c,l){return(data[c-1]||'').slice(-parseInt(l));}).replace(/Left\(Column(\d+),\s*(\d+)\)/gi,function(m,c,l){return(data[c-1]||'').substring(0,parseInt(l));}).replace(/Column(\d+)/gi,function(m,c){return data[c-1]||'';}).replace(/\s*\+\s*/g,''); }
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) return data[colMatch[1]-1] || '';
  if (!/Column\d+/i.test(logic)) return logic;
  return null;
}

function extractFixedFields(line, rules) {
  var data = [];
  for (var i = 0; i < rules.length; i++) {
    var s = rules[i].start; var e = rules[i].end;
    if (s > 0 && e > 0 && e <= line.length) data.push(line.substring(s-1, e));
    else if (s > 0 && s <= line.length) data.push(line.substring(s-1));
    else data.push('');
  }
  return data;
}

function parseMappingFile(mappingText) {
  var rows = parseCSV(mappingText, ',');
  var hdrs = rows[0].map(normalizeKey);
  var rules = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < hdrs.length; j++) { obj[hdrs[j]] = (rows[i][j] || '').trim(); }
    var field = obj['fieldname'] || obj['targetfieldname'] || '';
    var start = parseInt(obj['start'] || '0') || 0;
    var end = parseInt(obj['end'] || '0') || 0;
    var logic = obj['mappinglogic'] || obj['defaultvalue'] || '';
    var required = (obj['required'] || '').toUpperCase() === 'Y';
    rules.push({ field: field, start: start, end: end, logic: logic, required: required });
  }
  return rules;
}

function parseRecordTypeConfig(configText) {
  var rows = parseCSV(configText, ',');
  var hdrs = rows[0].map(normalizeKey);
  var types = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < hdrs.length; j++) { obj[hdrs[j]] = (rows[i][j] || '').trim(); }
    types.push({ recordType: obj['recordtype']||'', indicatorPos: parseInt(obj['typeindicatorposition']||'1'), indicatorValue: obj['typeindicatorvalue']||'', mappingFile: obj['mappingfile']||'', parentRecordType: obj['parentrecordtype']||'', outputName: obj['outputname']||'' });
  }
  return types;
}

function transformMultiRecord(inputText, configText, mappingFiles) {
  try {
    var recordTypes = parseRecordTypeConfig(configText);
    var mappingRulesMap = {}; var headersMap = {};
    for (var rt = 0; rt < recordTypes.length; rt++) {
      var mappingText = mappingFiles[recordTypes[rt].mappingFile];
      if (!mappingText) continue;
      var rules = parseMappingFile(mappingText);
      mappingRulesMap[recordTypes[rt].indicatorValue] = rules;
      headersMap[recordTypes[rt].indicatorValue] = rules.map(function(r){return r.field;}).filter(function(f){return f;});
    }
    var lines = inputText.split(/\r?\n/).filter(function(l){return l.trim()!=='';});
    if (lines.length === 1 && lines[0].length > 0) {
      var raw = lines[0]; var detectedLen = 0;
      var validIndicators = {};
      for (var rt2=0;rt2<recordTypes.length;rt2++) validIndicators[recordTypes[rt2].indicatorValue]=true;
      for (var rl=100;rl<=10000;rl++) {
        if (raw.length%rl!==0) continue;
        var allValid=true;
        for (var p=0;p<raw.length;p+=rl) { if(!validIndicators[raw.charAt(p)]){allValid=false;break;} }
        if (allValid&&raw.length/rl>1) { detectedLen=rl; break; }
      }
      if (detectedLen>0) {
        lines=[];
        for (var p=0;p<raw.length;p+=detectedLen) lines.push(raw.substring(p,p+detectedLen));
      }
    }
    var resultsByType={}; var errors=[]; incrementCounter=0;
    for (var li=0;li<lines.length;li++) {
      var line=lines[li]; var typeIndicator='';
      for (var rt=0;rt<recordTypes.length;rt++) {
        var pos=recordTypes[rt].indicatorPos; var expected=recordTypes[rt].indicatorValue;
        if (line.length>=pos&&line.substring(pos-1,pos)===expected) { typeIndicator=expected; break; }
      }
      if (!typeIndicator||!mappingRulesMap[typeIndicator]) continue;
      var rules=mappingRulesMap[typeIndicator]; var headers=headersMap[typeIndicator];
      var data=extractFixedFields(line,rules);
      var record={};
      for (var ri=0;ri<rules.length;ri++) {
        var rule=rules[ri]; if(!rule.field) continue;
        try { var value; if(rule.logic&&rule.logic.trim()) value=applyLogic(rule.logic,data,rule.field,li); else value=(data[ri]||'').trim(); record[rule.field]=value!=null?value.toString():''; }
        catch(e) { record[rule.field]=''; errors.push('Line '+(li+1)+', Field "'+rule.field+'": '+e.message); }
      }
      if (!resultsByType[typeIndicator]) resultsByType[typeIndicator]=[];
      resultsByType[typeIndicator].push(record);
    }
    var csvOutputs={}; var totalRecords=0;
    for (var ti in headersMap) {
      if (!headersMap.hasOwnProperty(ti)) continue;
      var h=headersMap[ti]; var recs=resultsByType[ti]||[]; totalRecords+=recs.length;
      var csvLines=[h.join(',')];
      for (var r=0;r<recs.length;r++) {
        var vals=[];
        for (var hi=0;hi<h.length;hi++) { var v=recs[r][h[hi]]!=null?recs[r][h[hi]].toString():''; if(/[",\n]/.test(v))v='"'+v.replace(/"/g,'""')+'"'; vals.push(v); }
        csvLines.push(vals.join(','));
      }
      csvOutputs[ti]=csvLines.join('\n');
    }
    return { success:true, resultsByType:resultsByType, csvOutputs:csvOutputs, headersMap:headersMap, recordTypes:recordTypes, totalRecords:totalRecords, errors:errors };
  } catch(e) { return { success:false, error:e.message }; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseCSV:parseCSV, normalizeKey:normalizeKey, applyLogic:applyLogic, extractFixedFields:extractFixedFields, parseMappingFile:parseMappingFile, parseRecordTypeConfig:parseRecordTypeConfig, transformMultiRecord:transformMultiRecord };
}