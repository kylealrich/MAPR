# API Reference - JavaScript Mapper

## Interface Overview

The JavaScript Mapper features a tabbed interface with three main sections:
- **JS Generator Tab**: Main functionality for creating mapping code
- **Mapping Table Converter Tab**: Future feature for mapping table conversion (Work in Progress)
- **Reference Tab**: Interactive function reference with comprehensive examples and syntax

## File Type Support
- **Delimited Files**: Full support with 8 delimiter options
- **Fixed-Length Files**: Coming soon (Work in Progress)

## Reference System
- **Interactive Table Format**: Functions organized by category with syntax and examples
- **Function Categories**: Basic Commands, String Functions, Math Functions, Conditional Logic, Validation Functions, Error Handling
- **Real Examples**: Actual syntax used in CSV mapping files with sample transformations

## Core Functions

### `normalizeKey(key)`
Normalizes CSV header keys by removing spaces and converting to lowercase.

**Parameters:**
- `key` (string) - Header key to normalize

**Returns:** Normalized string

### `parseCSV(text, delimiter)`
Parses CSV text into array of arrays with proper handling of quoted fields.

**Parameters:**
- `text` (string) - CSV content
- `delimiter` (string) - Field separator

**Returns:** Array of string arrays

**Features:**
- Handles quoted fields containing delimiters
- Processes escaped quotes (`""` becomes `"`)
- Supports mixed quoted/unquoted fields

### `applyLogic(logic, data, field, rowIndex)`
Converts high-level mapping commands to actual values during transformation.

**Parameters:**
- `logic` (string) - Mapping logic command
- `data` (array) - Input row data
- `field` (string) - Target field name for error reporting
- `rowIndex` (number) - Row index for error reporting

**Returns:** Transformed value or null

**String Functions:**
- `RemoveLeadingZeroes(ColumnN)` → Removes leading zeros, returns '0' if empty
- `RemoveTrailingSpaces(ColumnN)` → Removes trailing whitespace
- `Trim(ColumnN)` → Removes leading/trailing whitespace
- `Concat(Column1, Column2, ...)` → Concatenates multiple columns
- `Substring(ColumnN, start, length)` → Extracts substring
- `Uppercase(ColumnN)` → Converts to uppercase
- `Lowercase(ColumnN)` → Converts to lowercase
- `Left(ColumnN, length)` → Extract leftmost characters
- `Right(ColumnN, length)` → Extract rightmost characters
- `Replace(ColumnN, 'old', 'new')` → Replace text patterns
- `PadLeft(ColumnN, length, 'char')` → Left pad with character
- `PadRight(ColumnN, length, 'char')` → Right pad with character
- `AddLeft(ColumnN, 'char', count)` → Add character N times to start
- `AddRight(ColumnN, 'char', count)` → Add character N times to end

**Math Functions:**
- `Sum(Column1, Column2, ...)` → Validates numeric format then sums values
- `Multiply(Column1, Column2, ...)` → Multiply multiple values
- `Divide(Column1, Column2)` → Divide values (handles division by zero)
- `Round(ColumnN, decimals)` → Round to decimal places
- `Abs(ColumnN)` → Absolute value
- `Max(Column1, Column2, ...)` → Maximum value
- `Min(Column1, Column2, ...)` → Minimum value

**Date Functions:**
- `DateReformat(ColumnN, 'inputFormat', 'outputFormat')` → Reformat date strings (e.g., MMDDYYYY to YYYYMMDD)
- `Today()` → Current date
- `Now()` → Current timestamp

**DateReformat Formats:**
- Currently supports: MMDDYYYY to YYYYMMDD conversion
- Example: DateReformat(Column18,'MMDDYYYY','YYYYMMDD') converts "10252025" to "20251025"
- Returns original string if format not supported

**Conditional Logic:**
- `If Column1 == 'value' Then 'result'` → Simple conditional
- `If Column1 != 'value' Then Column2 Else 'default'` → If-Then-Else
- `If Column1 > 5 Then 'High' ElseIf Column1 < 2 Then 'Low' Else 'Medium'` → Multiple conditions

**Validation Functions:**
- `IsEmpty(ColumnN)` → Returns 'true' or 'false'
- `IsNumeric(ColumnN)` → Returns 'true' or 'false'

**Static Values:**
- `'Static Text'` → Quoted strings return literal values
- `Column1` → Direct column mapping
- Unquoted text → Treated as static string

### `transformData(inputText, MappingTable, delimiter, skipRows)`
Main transformation function for IPA integration.

**Parameters:**
- `inputText` (string) - Raw CSV input data
- `MappingTable` (string) - CSV mapping table content
- `delimiter` (string) - Field delimiter
- `skipRows` (number) - Number of rows to skip from top

**Returns:** Object with success, transformedData, csvOutput, generatedCode, headers, error

### `mapRecord(data, rowIndex)`
Generated function that transforms input row to output record.

**Parameters:**
- `data` (array) - Input row as array of strings
- `rowIndex` (number) - Zero-based row index for error reporting

**Returns:** Object with mapped fields

## Generated Code Structure

```javascript
function mapRecord(data, rowIndex) {
  var record = {};
  function safeGet(d, i, f, r) {
    if (i >= d.length) {
      console.warn('Row ' + (r + 1) + ': Column ' + (i + 1) + ' missing for "' + f + '"');
      return '';
    }
    return d[i] || '';
  }
  // TargetTable.FieldName
  record.FieldName = data[0]; // Direct mapping
  record.ProcessedField = data[1].trim(); // With transformation
  record.Total = parseFloat(data[3] || 0) + parseFloat(data[4] || 0); // Sum function
  if (record.FieldName == null || record.FieldName.toString().trim() === '') {
    throw new Error('Required field "FieldName" is blank');
  }
  return record;
}

// Input data from file:
var inputData = [
  ["value1", "value2", "value3"],
  ["data1", "data2", "data3"]
];

var mappedResults = inputData.map(function(row) { return mapRecord(row); });
var csvOutput = ["Field1,Field2,Field3"];
mappedResults.forEach(function(r) {
  var row = [r.Field1, r.Field2, r.Field3].map(v => {
    var val = v != null ? v.toString() : '';
    return /[",\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val;
  });
  csvOutput.push(row.join(','));
});
console.log(csvOutput.join('\n'));
```

## File Processing Flow

1. Load mapping CSV → Parse headers and rules
2. Load input CSV → Parse data rows
3. Generate JavaScript mapper function
4. Apply mapper to each input row
5. Generate output CSV with headers
6. Provide download links