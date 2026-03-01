# Mapping Configuration Guide

## Interface Overview

The JavaScript Mapper features a professional tabbed interface:
- **JS Generator Tab**: Main mapping functionality with file type selection
- **Mapping Table Converter Tab**: Future feature (Work in Progress)
- **Reference Tab**: Interactive function reference with comprehensive examples

### File Type Selection
- **Delimited Files**: Choose from 8 delimiter options, set skip rows
- **Fixed-Length Files**: Coming soon (Work in Progress)

### User Interface Features
- AI-powered design with automation icons
- Interactive Reference tab with searchable function categories
- Conditional display: Delimiter and skip options only show for delimited files
- Professional gradient accents and modern styling
- Table format reference with Function, Description, Syntax, and Example columns

## Mapping Table Structure

The mapping CSV file defines transformation rules with these columns:

| Column | Description | Required |
|--------|-------------|----------|
| TargetTableName | Output table identifier | Yes |
| TargetFieldName | Output field name | Yes |
| Required | Y/N flag for required fields | Yes |
| InputColumnNumber | Source column index (1-based) | No |
| MappingLogic | Transformation function | No |
| SampleValue | Example output value | No |

## Transformation Functions

### String Functions
- `RemoveLeadingZeroes(ColumnN)` - Removes leading zeros, returns '0' if empty
- `RemoveTrailingSpaces(ColumnN)` - Removes trailing spaces
- `Trim(ColumnN)` - Removes leading/trailing whitespace
- `Concat(Column1, Column2, ...)` - Concatenates multiple columns
- `Substring(ColumnN, start, length)` - Extracts substring
- `Uppercase(ColumnN)` - Converts to uppercase
- `Lowercase(ColumnN)` - Converts to lowercase
- `Left(ColumnN, length)` - Extract leftmost characters
- `Right(ColumnN, length)` - Extract rightmost characters
- `Replace(ColumnN, 'old', 'new')` - Replace text patterns
- `PadLeft(ColumnN, length, 'char')` - Left pad with character
- `PadRight(ColumnN, length, 'char')` - Right pad with character
- `AddLeft(ColumnN, 'char', count)` - Add character N times to start
- `AddRight(ColumnN, 'char', count)` - Add character N times to end

### Math Functions
- `Sum(Column1, Column2, ...)` - Adds multiple numeric fields with validation
- `Multiply(Column1, Column2, ...)` - Multiply multiple values
- `Divide(Column1, Column2)` - Divide values (handles division by zero)
- `Round(ColumnN, decimals)` - Round to decimal places
- `Abs(ColumnN)` - Absolute value
- `Max(Column1, Column2, ...)` - Maximum value
- `Min(Column1, Column2, ...)` - Minimum value

### Date Functions
- `ParseDate(ColumnN, 'inputFormat', 'outputFormat')` - Parse and reformat dates with validation
- `FormatDate(ColumnN, 'format')` - Format date string
- `Today()` - Current date
- `Now()` - Current timestamp

**ParseDate Examples:**
- `ParseDate(Column7,'MMDDYYYY','YYYY-MM-DD')` - "05022024" → "2024-05-02"
- `ParseDate(Column7,'MMDDYYYY','MM/DD/YYYY')` - "05022024" → "05/02/2024"
- `ParseDate(Column8,'YYYYMMDD','DD/MM/YYYY')` - "20240502" → "02/05/2024"
- `ParseDate(Column1,'MMDDYYYY','YYYYMMDD')` - "10252025" → "20251025"

**FormatDate Examples:**
- `FormatDate(Column1,'YYYYMMDD')` - Converts various date formats to YYYYMMDD
- `FormatDate(Column2,'MM/DD/YYYY')` - Converts to MM/DD/YYYY format

**Supported Formats:**
- Input: MMDDYYYY, DDMMYYYY, YYYYMMDD
- Output: YYYYMMDD, YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, MMDDYYYY, DDMMYYYY

### Validation Functions
- `IsEmpty(ColumnN)` - Check if empty (returns 'true' or 'false')
- `IsNumeric(ColumnN)` - Check if numeric (returns 'true' or 'false')
- `ValidateLength(ColumnN, min, max)` - Validate string length
- `ValidateRange(ColumnN, min, max)` - Validate numeric range
- `ValidateFormat(ColumnN, 'type')` - Validate format (email, phone, date)

### Static Values
- `'Static Value'` - Use single quotes for literal values
- `Hardcode 'value'` - Explicit static value assignment
- `Increment By 1` - Auto-increment counter (1, 2, 3, 4...)

### Direct Column Mapping
Use `ColumnN` syntax for direct column access: `Column1`, `Column2`, etc.

### Special Functions
- `Increment By 1` - Generates sequential numbers starting from 1
- `Hardcode 'value'` - Returns the specified static value
- `Today()` - Current date
- `Now()` - Current timestamp

### Numeric Validation
Sum function validates that all input values are purely numeric (integers or decimals). Values like "2s00" or "abc" will throw errors.

### Required Field Validation
Fields marked with 'Y' in the Required column are validated for non-empty values. Numeric results (including 0) pass validation.

### Mapping Table Validation
**InputColumnNumber and MappingLogic Exclusivity**: These two columns cannot both have values in the same row. Use either:
- **InputColumnNumber only** - for direct column mapping (e.g., `1`, `2`, `3`)
- **MappingLogic only** - for transformations (e.g., `Trim(Column1)`, `Hardcode '1'`)
- **Neither** - field will be null

This prevents ambiguity about which mapping rule to apply.

### If-Then-ElseIf-Else Logic
Use simple conditional statements for business rules:
- `If Column1 == 'value' Then 'result'` - Simple condition
- `If Column1 > 5 Then 'High' Else 'Low'` - Numeric comparison with else
- `If Column1 == '10' Then 'General' ElseIf Column1 == '35' Then 'Radiology' Else 'Other'` - Multiple conditions
- `If Substring(Column1, 1, 1) != 'G' Then Column1` - Function in condition

### Raw JavaScript
Any valid JavaScript expression is supported for advanced cases:
- `parseFloat(data[1]) * 1.1` - Mathematical operations
- `data[2] + ' - ' + data[3]` - String concatenation
- `parseFloat(data[11]) || 0` - Safe numeric conversion with default

## CSV Formatting Best Practices

### Mapping Table Rules
- **One mapping method per row**: Use either InputColumnNumber OR MappingLogic, never both
- **Direct mapping**: Use InputColumnNumber for simple column copying
- **Transformation mapping**: Use MappingLogic for functions, conditions, or static values

### Quoting Rules
- Quote fields containing commas, quotes, or newlines
- Use double quotes (`"`) to wrap fields
- Escape quotes within quoted fields using double quotes (`""`)
- Example: `"If Column1 == """ Then ""GL"" Else Column1"`

### MappingLogic Column
Always quote complex logic to prevent column shifting:
- ✅ Good: `"RemoveLeadingZeroes(Column3)"`
- ✅ Good: `"If Column15 == """" Then ""GL"" Else Column15"`
- ❌ Bad: `If Column15 == '' Then 'GL' Else Column15`

## Example Mapping

```csv
TargetTableName,TargetFieldName,Required,InputColumnNumber,MappingLogic,SampleValue
GLT,GroupNum,Y,1,,GLGrp001
GLT,SequenceID,Y,,"Increment By 1",1
GLT,Company,Y,2,"RemoveLeadingZeroes(Column2)",100
GLT,Division,Y,3,"Trim(Column3)",Division1
GLT,Amount,Y,4,,100
GLT,Status,N,,"Hardcode '0'",0
GLT,Description,N,,"'Test'",Test
GLT,Total,Y,,"Sum(Column4, Column5)",300
GLT,DirectMapping,Y,,Column1,Value1
GLT,NetAmount,N,,"parseFloat(data[11]) > 0 ? parseFloat(data[11]) : -parseFloat(data[12])",221.35
GLT,DepartmentName,N,,"data[2] == '10' ? 'General' : 'Other'",General
```