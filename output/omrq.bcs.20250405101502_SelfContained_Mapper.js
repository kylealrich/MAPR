// Auto-generated Self Contained Mapper
// Generated: 2026-03-21 22:49:26
// Type: Fixed-Length Multi-Record
// Records: 0

function mapRecord(data, rowIndex) {
  var record = {};
  record['Record Type'] = (data[0] || '').trim();
  record['Company'] = applyLogic('RemoveLeadingZeroes(Column2)', data, 'Company', rowIndex);
  record['Req Number'] = applyLogic('RemoveLeadingZeroes(Column3)', data, 'Req Number', rowIndex);
  record['Line Number'] = (data[3] || '').trim();
  record['Requester'] = (data[4] || '').trim();
  record['Req Location'] = (data[5] || '').trim();
  record['Req Del Date'] = (data[6] || '').trim();
  record['Creation Date'] = (data[7] || '').trim();
  record['From Company'] = applyLogic('RemoveLeadingZeroes(Column9)', data, 'From Company', rowIndex);
  record['From Location'] = (data[9] || '').trim();
  record['Deliver To'] = (data[10] || '').trim();
  record['Buyer Code'] = (data[11] || '').trim();
  record['Vendor'] = (data[12] || '').trim();
  record['Purchase From Loc'] = (data[13] || '').trim();
  record['Vendor Name'] = (data[14] || '').trim();
  record['Print Req Fl'] = applyLogic('N', data, 'Print Req Fl', rowIndex);
  record['Agreement Ref'] = (data[16] || '').trim();
  record['PO User Fld 1'] = (data[17] || '').trim();
  record['PO User Fld 3'] = (data[18] || '').trim();
  record['PO User Fld 5'] = (data[19] || '').trim();
  record['User Date 1'] = (data[20] || '').trim();
  record['User Date 2'] = (data[21] || '').trim();
  record['Allocate Priority'] = applyLogic('50', data, 'Allocate Priority', rowIndex);
  record['Quote Fl'] = applyLogic('N', data, 'Quote Fl', rowIndex);
  record['Activity'] = (data[24] || '').trim();
  record['Account Category'] = (data[25] || '').trim();
  record['Billing Category'] = (data[26] || '').trim();
  record['Account Unit'] = (data[27] || '').trim();
  record['Account'] = (data[28] || '').trim();
  record['Sub Account'] = (data[29] || '').trim();
  record['Purchase Tax Code'] = (data[30] || '').trim();
  record['Purchase Tax Fl'] = applyLogic('N', data, 'Purchase Tax Fl', rowIndex);
  record['Operator Id'] = (data[32] || '').trim();
  record['Dropship Fl'] = applyLogic('N', data, 'Dropship Fl', rowIndex);
  record['Dropsh Req Loc'] = (data[34] || '').trim();
  record['Dropsh Req'] = (data[35] || '').trim();
  record['Sh Name'] = (data[36] || '').trim();
  record['Sh Addr 1'] = (data[37] || '').trim();
  record['Sh Addr 2'] = (data[38] || '').trim();
  record['Sh Addr 3'] = (data[39] || '').trim();
  record['Sh Addr 4'] = (data[40] || '').trim();
  record['Sh City-Addr5'] = (data[41] || '').trim();
  record['Sh State-Prov'] = (data[42] || '').trim();
  record['Sh Post Code'] = (data[43] || '').trim();
  record['Sh Country'] = (data[44] || '').trim();
  record['Sh County'] = (data[45] || '').trim();
  record['Sh Phone Pref'] = (data[46] || '').trim();
  record['Sh Phone'] = (data[47] || '').trim();
  record['Sh Phone Ext'] = (data[48] || '').trim();
  record['Sh Contact'] = (data[49] || '').trim();
  record['Tran Curr Code'] = (data[50] || '').trim();
  record['One Src One PO'] = applyLogic('1', data, 'One Src One PO', rowIndex);
  record['Location Rule'] = (data[52] || '').trim();
  record['Segment Block'] = (data[53] || '').trim();
  record['Record Type'] = (data[0] || '').trim();
  record['Requisition Number'] = (data[55] || '').trim();
  record['Line Number'] = (data[56] || '').trim();
  record['Item Number'] = (data[57] || '').trim();
  record['Item Description'] = (data[58] || '').trim();
  record['Quantity'] = applyLogic('0', data, 'Quantity', rowIndex);
  record['Unit of Measure'] = (data[60] || '').trim();
  record['Unit Price'] = applyLogic('0', data, 'Unit Price', rowIndex);
  record['Extended Amount'] = applyLogic('0', data, 'Extended Amount', rowIndex);
  record['Taxable Flag'] = (data[63] || '').trim();
  record['Record Type'] = (data[0] || '').trim();
  record['Requisition Number'] = (data[55] || '').trim();
  record['Line Number'] = (data[56] || '').trim();
  record['Detail Sequence'] = (data[67] || '').trim();
  record['Detail Type'] = (data[68] || '').trim();
  record['Detail Value'] = (data[69] || '').trim();
  record['Record Type'] = (data[0] || '').trim();
  record['Requisition Number'] = (data[55] || '').trim();
  record['Comment Sequence'] = (data[72] || '').trim();
  record['Comment Type'] = (data[73] || '').trim();
  record['Comment Text'] = (data[74] || '').trim();
  return record;
}

var incrementCounter = 0;

function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }
  if (/^Hardcode\s+['"](.*)['"]/i.test(logic)) { return logic.match(/^Hardcode\s+['"](.*)['"]/i)[1]; }
  if (/^['"].*['"]$/.test(logic)) { return logic.slice(1, -1); }
  var col = logic.match(/^Column(\d+)$/i);
  if (col) return (data[col[1]-1] || '');
  if (/^RemoveLeadingZeroes\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }
  if (/^RemoveTrailingSpaces\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\s+$/,''); }
  if (/^Trim\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }
  if (/^Uppercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }
  if (/^Lowercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }
  if (/^Left\(/i.test(logic)) { var m=logic.match(/Left\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }
  if (/^Right\(/i.test(logic)) { var m=logic.match(/Right\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }
  if (/^Concat\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\d+/)[0];return data[n-1]||'';}).join(''); }
  if (/^DateReformat\(/i.test(logic)) { var m=logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m){var d=data[m[1]-1]||'';if(m[2].toUpperCase()==='MMDDYYYY'&&m[3].toUpperCase()==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);return d;} }
  if (/^Today\(/i.test(logic)) { var d=new Date(); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); }
  if (/^Now\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }
  if (!/Column\d+/i.test(logic)) return logic;
  return null;
}

var MAPPING_RULES = [{'field': 'Record Type', 'logic': '', 'colNum': null, 'start': 1, 'end': 1}, {'field': 'Company', 'logic': 'RemoveLeadingZeroes(Column2)', 'colNum': null, 'start': 2, 'end': 5}, {'field': 'Req Number', 'logic': 'RemoveLeadingZeroes(Column3)', 'colNum': null, 'start': 6, 'end': 12}, {'field': 'Line Number', 'logic': '', 'colNum': null, 'start': 13, 'end': 18}, {'field': 'Requester', 'logic': '', 'colNum': null, 'start': 19, 'end': 28}, {'field': 'Req Location', 'logic': '', 'colNum': null, 'start': 29, 'end': 33}, {'field': 'Req Del Date', 'logic': '', 'colNum': null, 'start': 34, 'end': 41}, {'field': 'Creation Date', 'logic': '', 'colNum': null, 'start': 42, 'end': 49}, {'field': 'From Company', 'logic': 'RemoveLeadingZeroes(Column9)', 'colNum': null, 'start': 50, 'end': 53}, {'field': 'From Location', 'logic': '', 'colNum': null, 'start': 54, 'end': 58}, {'field': 'Deliver To', 'logic': '', 'colNum': null, 'start': 59, 'end': 88}, {'field': 'Buyer Code', 'logic': '', 'colNum': null, 'start': 89, 'end': 91}, {'field': 'Vendor', 'logic': '', 'colNum': null, 'start': 92, 'end': 100}, {'field': 'Purchase From Loc', 'logic': '', 'colNum': null, 'start': 101, 'end': 104}, {'field': 'Vendor Name', 'logic': '', 'colNum': null, 'start': 105, 'end': 134}, {'field': 'Print Req Fl', 'logic': 'N', 'colNum': null, 'start': 135, 'end': 135}, {'field': 'Agreement Ref', 'logic': '', 'colNum': null, 'start': 136, 'end': 165}, {'field': 'PO User Fld 1', 'logic': '', 'colNum': null, 'start': 166, 'end': 166}, {'field': 'PO User Fld 3', 'logic': '', 'colNum': null, 'start': 167, 'end': 176}, {'field': 'PO User Fld 5', 'logic': '', 'colNum': null, 'start': 177, 'end': 206}, {'field': 'User Date 1', 'logic': '', 'colNum': null, 'start': 207, 'end': 214}, {'field': 'User Date 2', 'logic': '', 'colNum': null, 'start': 215, 'end': 222}, {'field': 'Allocate Priority', 'logic': '50', 'colNum': null, 'start': 223, 'end': 224}, {'field': 'Quote Fl', 'logic': 'N', 'colNum': null, 'start': 225, 'end': 225}, {'field': 'Activity', 'logic': '', 'colNum': null, 'start': 226, 'end': 240}, {'field': 'Account Category', 'logic': '', 'colNum': null, 'start': 241, 'end': 245}, {'field': 'Billing Category', 'logic': '', 'colNum': null, 'start': 246, 'end': 277}, {'field': 'Account Unit', 'logic': '', 'colNum': null, 'start': 278, 'end': 292}, {'field': 'Account', 'logic': '', 'colNum': null, 'start': 293, 'end': 298}, {'field': 'Sub Account', 'logic': '', 'colNum': null, 'start': 299, 'end': 302}, {'field': 'Purchase Tax Code', 'logic': '', 'colNum': null, 'start': 303, 'end': 312}, {'field': 'Purchase Tax Fl', 'logic': 'N', 'colNum': null, 'start': 313, 'end': 313}, {'field': 'Operator Id', 'logic': '', 'colNum': null, 'start': 314, 'end': 323}, {'field': 'Dropship Fl', 'logic': 'N', 'colNum': null, 'start': 324, 'end': 324}, {'field': 'Dropsh Req Loc', 'logic': '', 'colNum': null, 'start': 325, 'end': 325}, {'field': 'Dropsh Req', 'logic': '', 'colNum': null, 'start': 326, 'end': 326}, {'field': 'Sh Name', 'logic': '', 'colNum': null, 'start': 327, 'end': 356}, {'field': 'Sh Addr 1', 'logic': '', 'colNum': null, 'start': 357, 'end': 386}, {'field': 'Sh Addr 2', 'logic': '', 'colNum': null, 'start': 387, 'end': 416}, {'field': 'Sh Addr 3', 'logic': '', 'colNum': null, 'start': 417, 'end': 446}, {'field': 'Sh Addr 4', 'logic': '', 'colNum': null, 'start': 447, 'end': 476}, {'field': 'Sh City-Addr5', 'logic': '', 'colNum': null, 'start': 477, 'end': 494}, {'field': 'Sh State-Prov', 'logic': '', 'colNum': null, 'start': 495, 'end': 496}, {'field': 'Sh Post Code', 'logic': '', 'colNum': null, 'start': 497, 'end': 506}, {'field': 'Sh Country', 'logic': '', 'colNum': null, 'start': 507, 'end': 536}, {'field': 'Sh County', 'logic': '', 'colNum': null, 'start': 537, 'end': 561}, {'field': 'Sh Phone Pref', 'logic': '', 'colNum': null, 'start': 562, 'end': 567}, {'field': 'Sh Phone', 'logic': '', 'colNum': null, 'start': 568, 'end': 582}, {'field': 'Sh Phone Ext', 'logic': '', 'colNum': null, 'start': 583, 'end': 587}, {'field': 'Sh Contact', 'logic': '', 'colNum': null, 'start': 588, 'end': 617}, {'field': 'Tran Curr Code', 'logic': '', 'colNum': null, 'start': 618, 'end': 622}, {'field': 'One Src One PO', 'logic': '1', 'colNum': null, 'start': 623, 'end': 623}, {'field': 'Location Rule', 'logic': '', 'colNum': null, 'start': 624, 'end': 635}, {'field': 'Segment Block', 'logic': '', 'colNum': null, 'start': 636, 'end': 738}, {'field': 'Record Type', 'logic': '', 'colNum': null, 'start': 1, 'end': 1}, {'field': 'Requisition Number', 'logic': '', 'colNum': null, 'start': 2, 'end': 14}, {'field': 'Line Number', 'logic': '', 'colNum': null, 'start': 15, 'end': 29}, {'field': 'Item Number', 'logic': '', 'colNum': null, 'start': 30, 'end': 59}, {'field': 'Item Description', 'logic': '', 'colNum': null, 'start': 60, 'end': 99}, {'field': 'Quantity', 'logic': '0', 'colNum': null, 'start': 100, 'end': 114}, {'field': 'Unit of Measure', 'logic': '', 'colNum': null, 'start': 115, 'end': 116}, {'field': 'Unit Price', 'logic': '0', 'colNum': null, 'start': 117, 'end': 131}, {'field': 'Extended Amount', 'logic': '0', 'colNum': null, 'start': 132, 'end': 146}, {'field': 'Taxable Flag', 'logic': '', 'colNum': null, 'start': 147, 'end': 147}, {'field': 'Record Type', 'logic': '', 'colNum': null, 'start': 1, 'end': 1}, {'field': 'Requisition Number', 'logic': '', 'colNum': null, 'start': 2, 'end': 14}, {'field': 'Line Number', 'logic': '', 'colNum': null, 'start': 15, 'end': 29}, {'field': 'Detail Sequence', 'logic': '', 'colNum': null, 'start': 30, 'end': 34}, {'field': 'Detail Type', 'logic': '', 'colNum': null, 'start': 35, 'end': 94}, {'field': 'Detail Value', 'logic': '', 'colNum': null, 'start': 95, 'end': 154}, {'field': 'Record Type', 'logic': '', 'colNum': null, 'start': 1, 'end': 1}, {'field': 'Requisition Number', 'logic': '', 'colNum': null, 'start': 2, 'end': 14}, {'field': 'Comment Sequence', 'logic': '', 'colNum': null, 'start': 15, 'end': 29}, {'field': 'Comment Type', 'logic': '', 'colNum': null, 'start': 30, 'end': 89}, {'field': 'Comment Text', 'logic': '', 'colNum': null, 'start': 90, 'end': 1089}];

var HEADERS = ['Record Type', 'Company', 'Req Number', 'Line Number', 'Requester', 'Req Location', 'Req Del Date', 'Creation Date', 'From Company', 'From Location', 'Deliver To', 'Buyer Code', 'Vendor', 'Purchase From Loc', 'Vendor Name', 'Print Req Fl', 'Agreement Ref', 'PO User Fld 1', 'PO User Fld 3', 'PO User Fld 5', 'User Date 1', 'User Date 2', 'Allocate Priority', 'Quote Fl', 'Activity', 'Account Category', 'Billing Category', 'Account Unit', 'Account', 'Sub Account', 'Purchase Tax Code', 'Purchase Tax Fl', 'Operator Id', 'Dropship Fl', 'Dropsh Req Loc', 'Dropsh Req', 'Sh Name', 'Sh Addr 1', 'Sh Addr 2', 'Sh Addr 3', 'Sh Addr 4', 'Sh City-Addr5', 'Sh State-Prov', 'Sh Post Code', 'Sh Country', 'Sh County', 'Sh Phone Pref', 'Sh Phone', 'Sh Phone Ext', 'Sh Contact', 'Tran Curr Code', 'One Src One PO', 'Location Rule', 'Segment Block', 'Record Type', 'Requisition Number', 'Line Number', 'Item Number', 'Item Description', 'Quantity', 'Unit of Measure', 'Unit Price', 'Extended Amount', 'Taxable Flag', 'Record Type', 'Requisition Number', 'Line Number', 'Detail Sequence', 'Detail Type', 'Detail Value', 'Record Type', 'Requisition Number', 'Comment Sequence', 'Comment Type', 'Comment Text'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapRecord:mapRecord, applyLogic:applyLogic, MAPPING_RULES:MAPPING_RULES, HEADERS:HEADERS };
}