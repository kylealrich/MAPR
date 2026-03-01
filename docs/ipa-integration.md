# IPA Integration Guide

## Overview
The JavaScript Mapper (JavaScript_Mapper.html) generates self-contained functions that can be directly used in Infor Process Automation (IPA) workflows for data transformation. The tool features a modern tabbed interface with AI-powered design and support for multiple file types.

## Interface Features

### Tabbed Navigation
- **JS Generator Tab**: Main functionality for creating mapping code (active by default)
- **Mapping Table Converter Tab**: Future feature for mapping table conversion (Work in Progress)
- **Reference Tab**: Interactive function reference with comprehensive examples and syntax

### File Type Support
- **Delimited Files**: Full support with 8 delimiter options and skip rows functionality
- **Fixed-Length Files**: Coming soon (Work in Progress)

### Reference System
- **Function Categories**: Basic Commands, String Functions, Math Functions, Conditional Logic, Validation Functions, Error Handling
- **Table Format**: Organized display with Function, Description, Syntax, and Example columns
- **Real Examples**: Actual syntax used in CSV files with sample input/output transformations

## Generation Modes

### Static Mode (Self-Contained)
- **Embedded Rules**: Mapping logic built into the JavaScript code
- **No External Files**: Doesn't require mapping CSV at runtime
- **Usage Instructions**: Generated code includes complete usage examples
- **Core Function**: `mapRecord(data, rowIndex)` with embedded transformation logic

### Dynamic Mode (Runtime Flexible)
- **External Mapping**: Requires mapping CSV file at runtime
- **Universal Code**: Same JavaScript works with any mapping table
- **IPA Compatible**: Designed for Infor Process Automation workflows
- **Core Function**: `createMapper(MappingTable)` returns mapper object

## Generated Functions

### Core Functions
- **`mapRecord(data, rowIndex)`** - Transforms a single data row (Static mode)
- **`createMapper(MappingTable)`** - Creates mapper from CSV (Dynamic mode)
- **`parseCSV(text, delimiter)`** - Parses CSV content into arrays
- **`safeGet(d, i, f, r)`** - Safe column access with error handling

### Validation Functions (if used)
- **`validateLength(v, min, max, f)`** - String length validation
- **`validateRange(v, min, max, f)`** - Numeric range validation  
- **`validateFormat(v, t, f)`** - Format validation (email, phone, date)

## IPA Implementation

### IPA Usage (Using transformData function)
```javascript
// Include mapper-core.js functions in your IPA flow

// Single function call for complete transformation
var result = transformData(inputText, MappingTable, ',', 1);

if (result.success) {
  TransformedData = result.csvOutput;
  TransformedObjects = result.transformedData;
  Headers = result.headers;
} else {
  ErrorMessage = result.error;
}
```

### Manual Usage (Step by step)
```javascript
// Step 1: Create mapper from mapping table
var mapper = createDynamicMapper(parsedMappings);

// Step 2: Parse and process input data
var inputData = parseCSV(InputData, ',');
var dataRows = inputData.slice(1); // Skip 1 row

// Step 3: Transform data with error handling
try {
  var results = dataRows.map(function(row, index) {
    return mapper.mapRecord(row, index);
  });
} catch (error) {
  ErrorMessage = error.message;
  results = [];
}

// Step 4: Convert to CSV format
var csvLines = [mapper.headers.join(',')];
results.forEach(function(r) {
  var row = mapper.headers.map(function(h) {
    var v = r[h] != null ? r[h].toString() : '';
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  });
  csvLines.push(row.join(','));
});
TransformedData = csvLines.join('\n');
```

### Static Usage (Self-Contained Code)
```javascript
// Static mapper with embedded rules - no mapping file needed
try {
  // 1. Parse your input data
  var inputData = parseCSV(yourInputFileContent, ',');
  var dataRows = inputData.slice(1); // Skip 1 row
  
  // 2. Transform each row using embedded logic
  var results = dataRows.map(function(row, index) {
    return mapRecord(row, index);
  });
  
  // 3. Convert to CSV format
  var headers = ['Field1', 'Field2', 'Field3']; // Your field names
  var csvLines = [headers.join(',')];
  results.forEach(function(r) {
    var row = headers.map(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    });
    csvLines.push(row.join(','));
  });
  var outputCSV = csvLines.join('\n');
  
  TransformedData = outputCSV;
  ProcessStatus = "Success";
} catch (error) {
  ErrorMessage = error.message;
  ProcessStatus = "Failed";
}
```

## Key Benefits

### No Dependencies
- Self-contained JavaScript functions
- No external libraries required
- Works in any JavaScript environment

### Dynamic Generation
- Each mapping table creates custom transformation code
- Field names and logic are specific to your mapping rules
- No generic code - everything is optimized for your use case

### Built-in Validation
- Required field checking with row-level warnings
- Data type validation for numeric operations
- Safe column access prevents undefined errors

### Error Handling
- Console warnings for missing required fields
- Detailed error messages with row numbers
- Graceful handling of missing columns

## Troubleshooting

### Common Issues
- **Syntax Error**: Check If-Then-Else logic for quote problems
- **Missing Functions**: Ensure all generated functions are included
- **Column Errors**: Verify input data matches expected column count
- **ParseDate Invalid Date**: Use correct format - `ParseDate(Column7,'MMDDYYYY','YYYY-MM-DD')` for "05022024"

### Debug Steps
1. Test with basic mapping (no conditional logic)
2. Check generated JavaScript for syntax errors
3. Add try-catch blocks around transformation code
4. Verify input data format matches mapping expectations
5. For date issues: Validate date format matches ParseDate input format

## Best Practices

### Mapping Design
- Start with direct column mappings
- Add transformations incrementally
- Test each mapping rule individually
- Use descriptive field names

### IPA Integration
- Include all generated functions in your IPA flow
- Add error handling for production use
- Log transformation results for debugging
- Validate input data format before processing