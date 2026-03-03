// OMRQ Fixed-Length File Mapper
// Generated for: omrq.bcs.20250405101502.txt
// Mapping Configuration: Fixed Length Mapping.csv

// Fixed-Length Field Parser
function parseFixedLength(line, fieldDefinitions) {
  var record = {};
  
  fieldDefinitions.forEach(function(field) {
    if (!field.start || !field.end) return;
    
    var start = field.start - 1; // Convert to 0-based index
    var end = field.end;
    var value = line.substring(start, end);
    
    // Apply field type transformations
    if (field.type && field.type.indexOf('Num') === 0) {
      // Numeric field - trim leading zeros
      value = value.trim();
      if (field.transform === 'trimLeadingZeros') {
        value = value.replace(/^0+/, '') || '0';
      }
      if (field.transform === 'zeroToBlank' && /^0+$/.test(value)) {
        value = '';
      }
    } else if (field.type && (field.type.indexOf('Alpha') === 0 || field.type.indexOf('AlphaLower') === 0 || field.type.indexOf('AlphaRight') === 0)) {
      // Alpha field - trim whitespace
      value = value.trim();
    }
    
    // Apply boolean transformations
    if (field.transform === 'toBoolean') {
      value = (value.toUpperCase() === 'Y' || value === '1') ? 'true' : 'false';
    }
    
    // Apply date format transformations
    if (field.transform === 'dateFormat' && value && value.length === 8) {
      // Assuming YYYYMMDD format, convert to YYYY-MM-DD
      value = value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8);
    }
    
    record[field.name] = value;
  });
  
  return record;
}

// Field Definitions from Fixed Length Mapping.csv
var fieldDefinitions = [
  { name: 'RecordType', start: 1, end: 1, type: 'Alpha 1', field: '', transform: '' },
  { name: 'Company', start: 5, end: 8, type: 'Num 4', field: 'Company', transform: 'trimLeadingZeros' },
  { name: 'ReqNumber', start: 12, end: 18, type: 'Num 7', field: 'Requisition', transform: 'zeroToBlank' },
  { name: 'LineNumber', start: 13, end: 18, type: 'Num 6', field: '', transform: 'zeroToBlank' },
  { name: 'Requester', start: 19, end: 28, type: 'AlphaLower 10', field: 'Requester', transform: 'crosswalk' },
  { name: 'ReqLocation', start: 29, end: 33, type: 'Alpha 5', field: 'RequestingLocation', transform: '' },
  { name: 'ReqDelDate', start: 34, end: 41, type: 'Num 8', field: 'RequestedDeliveryDate', transform: 'dateFormat' },
  { name: 'CreationDate', start: 42, end: 49, type: 'Date 8', field: 'CreationDate', transform: 'dateFormat' },
  { name: 'FromCompany', start: 50, end: 53, type: 'Num 4', field: 'FromCompanyLocation.FromCompany', transform: 'trimLeadingZeros' },
  { name: 'FromLocation', start: 54, end: 58, type: 'Alpha 5', field: 'FromCompanyLocation.FromLocation', transform: '' },
  { name: 'DeliverTo', start: 59, end: 88, type: 'AlphaLower 30', field: 'DeliverTo', transform: '' },
  { name: 'BuyerCode', start: 89, end: 91, type: 'Alpha 3', field: 'Buyer', transform: '' },
  { name: 'Vendor', start: 92, end: 100, type: 'AlphaRight 9', field: 'Vendor', transform: '' },
  { name: 'PurchaseFromLoc', start: 101, end: 104, type: 'Alpha 4', field: 'PurchaseFromLocation', transform: '' },
  { name: 'VendorName', start: 105, end: 134, type: 'Alpha 30', field: '', transform: '' },
  { name: 'PrintReqFl', start: 135, end: 135, type: 'Alpha 1', field: 'PrintRequisition', transform: 'toBoolean' },
  { name: 'AgreementRef', start: 136, end: 165, type: 'Alpha 30', field: '', transform: '' },
  { name: 'POUserFld1', start: 166, end: 166, type: 'Alpha 1', field: 'PurchaseOrderUserField1', transform: '' },
  { name: 'POUserFld3', start: 167, end: 176, type: 'AlphaLower 10', field: 'PurchaseOrderUserField3', transform: '' },
  { name: 'POUserFld5', start: 177, end: 206, type: 'AlphaLower 30', field: 'PurchaseOrderUserField5', transform: '' },
  { name: 'UserDate1', start: 207, end: 214, type: 'Num 8', field: 'UserDate1', transform: 'zeroToBlank' },
  { name: 'UserDate2', start: 215, end: 222, type: 'Num 8', field: 'UserDate2', transform: 'zeroToBlank' },
  { name: 'AllocatePriority', start: 223, end: 224, type: 'Num 2', field: 'AllocationPriority', transform: '' },
  { name: 'QuoteFl', start: 225, end: 225, type: 'Alpha 1', field: 'QuoteRequired', transform: 'toBoolean' },
  { name: 'Activity', start: 226, end: 240, type: 'Alpha 15', field: 'DefaultDistributionAccount.Project', transform: '' },
  { name: 'AccountCategory', start: 241, end: 245, type: 'Alpha 5', field: 'DefaultDistributionAccount.FinanceDimension3', transform: '' },
  { name: 'BillingCategory', start: 246, end: 277, type: 'Alpha 32', field: '', transform: '' },
  { name: 'AccountUnit', start: 278, end: 292, type: 'Alpha 15', field: 'DefaultDistributionAccount.FinanceDimension1', transform: '' },
  { name: 'Account', start: 293, end: 298, type: 'Num 6', field: 'DefaultDistributionAccount.GeneralLedgerChartAccount', transform: '' },
  { name: 'SubAccount', start: 299, end: 302, type: 'Num 4', field: '', transform: '' },
  { name: 'PurchaseTaxCode', start: 303, end: 312, type: 'Alpha 10', field: 'PurchaseTaxCode', transform: '' },
  { name: 'PurchaseTaxFl', start: 313, end: 313, type: 'Alpha 1', field: 'PurchaseTaxable', transform: 'toBoolean' },
  { name: 'OperatorId', start: 314, end: 323, type: 'Alpha 10', field: 'OperatorID', transform: '' },
  { name: 'DropshipFl', start: 324, end: 324, type: 'Alpha 1', field: 'Dropship', transform: 'toBoolean' },
  { name: 'DropshReqLoc', start: 325, end: 325, type: 'Alpha 1', field: '', transform: '' },
  { name: 'DropshReq', start: 326, end: 326, type: 'Alpha 1', field: '', transform: '' },
  { name: 'ShName', start: 327, end: 356, type: 'AlphaLower 30', field: 'DropshipName', transform: '' },
  { name: 'ShAddr1', start: 357, end: 386, type: 'AlphaLower 30', field: 'DropshipAddress.DeliveryAddress.AddressLine1', transform: '' },
  { name: 'ShAddr2', start: 387, end: 416, type: 'AlphaLower 30', field: 'DropshipAddress.DeliveryAddress.AddressLine1', transform: '' },
  { name: 'ShAddr3', start: 417, end: 446, type: 'AlphaLower 30', field: 'DropshipAddress.DeliveryAddress.AddressLine1', transform: '' },
  { name: 'ShAddr4', start: 447, end: 476, type: 'AlphaLower 30', field: 'DropshipAddress.DeliveryAddress.AddressLine1', transform: '' },
  { name: 'ShCityAddr5', start: 477, end: 494, type: 'AlphaLower 18', field: 'DropshipAddress.Municipality', transform: '' },
  { name: 'ShStateProv', start: 495, end: 496, type: 'Alpha 2', field: 'DropshipAddress.StateProvince', transform: '' },
  { name: 'ShPostCode', start: 497, end: 506, type: 'AlphaLower 10', field: 'DropshipAddress.PostalCode', transform: '' },
  { name: 'ShCountry', start: 507, end: 536, type: 'AlphaLower 30', field: 'DropshipAddress.Country', transform: '' },
  { name: 'ShCounty', start: 537, end: 561, type: 'AlphaLower 25', field: 'DropshipAddress.County', transform: '' },
  { name: 'ShPhonePref', start: 562, end: 567, type: 'Alpha 6', field: 'DropshipPhoneNumber.InternationalPrefix', transform: '' },
  { name: 'ShPhone', start: 568, end: 582, type: 'Alpha 15', field: 'DropshipPhoneNumber.SubscriberNumber', transform: '' },
  { name: 'ShPhoneExt', start: 583, end: 587, type: 'Alpha 5', field: 'DropshipPhoneNumber.Extension', transform: '' },
  { name: 'ShContact', start: 588, end: 617, type: 'AlphaLower 30', field: 'DropshipContact', transform: '' },
  { name: 'TranCurrCode', start: 618, end: 622, type: 'Alpha 5', field: 'TransactionCurrencyCode', transform: '' },
  { name: 'OneSrcOnePO', start: 623, end: 623, type: 'Num 1', field: 'OneSourceDocumentToOnePO', transform: '' },
  { name: 'LocationRule', start: 624, end: 635, type: 'Alpha 12', field: 'LocationRule', transform: '' },
  { name: 'SegmentBlock', start: 636, end: 738, type: 'Alpha 103', field: '', transform: '' }
];

// Main Processing Function
function processOMRQFile(fileContent) {
  var lines = fileContent.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  var results = [];
  
  lines.forEach(function(line, index) {
    if (line.length === 0) return;
    
    var record = parseFixedLength(line, fieldDefinitions);
    results.push(record);
  });
  
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
      // Escape values containing commas, quotes, or newlines
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
    processOMRQFile: processOMRQFile,
    generateCSV: generateCSV,
    parseFixedLength: parseFixedLength
  };
}

// Example usage:
// var fs = require('fs');
// var fileContent = fs.readFileSync('input/omrq.bcs.20250405101502.txt', 'utf8');
// var records = processOMRQFile(fileContent);
// var csvOutput = generateCSV(records);
// fs.writeFileSync('output/omrq_output.csv', csvOutput);
