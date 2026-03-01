# JavaScript Mapper - Data Transformation Tool

A comprehensive web-based tool for mapping and transforming CSV data using configurable transformation rules with an extensive built-in command reference and validation system.

## Overview

This tool generates JavaScript mapping functions from CSV mapping tables and applies them to input data files. It features a modern interface with comprehensive error handling, validation functions, and an interactive sidebar reference system.

## Files

- `JavaScript_Mapper.html` - Main application interface with tabbed navigation, AI-powered features, and command sidebar
- `mapper-core.js` - Core transformation functions for IPA integration
- `mapping_table.csv` - Transformation rules configuration
- `input.csv` - Sample input data
- `CernerGL_MappingTable_With_Hardcode.csv` - Cerner General Ledger mapping table with proper CSV quoting

## Quick Start

1. Open `JavaScript_Mapper.html` in a web browser
2. Use the **JS Generator** tab (default active tab)
3. Select **File Type**: Delimited or Fixed-Length (Fixed-Length is work in progress)
4. Select mapping CSV file and input data file
5. For Delimited files: Choose delimiter and set skip rows
6. Click "Preview Files" to validate and preview data
7. Click "Generate Mapper JS + Output CSV" to create output
8. Download generated JavaScript and CSV files

## Key Features

### Interface Features
- **Tabbed Navigation**: JS Generator, Mapping Table Converter, and Reference tabs
- **AI-Powered Design**: Professional interface with automation icons and AI branding
- **File Type Selection**: Support for Delimited and Fixed-Length files (Fixed-Length coming soon)
- **Interactive Reference**: Comprehensive function reference with table format and examples
- **Responsive Layout**: Clean, modern design with gradient accents

### File Processing
- **Multiple delimiter support**: Comma, pipe, semicolon, tab, colon, space, tilde, caret
- **Advanced CSV parsing**: Handles quoted fields, escaped quotes, and special characters
- **Flexible row skipping**: Skip any number of rows from top (headers, metadata, etc.)
- **File validation**: Delimiter detection and validation before processing
- **Conditional UI**: Delimiter and skip options only show for delimited files

### Transformation Functions (25+ Built-in Commands)

**String Functions:**
- `RemoveLeadingZeroes(ColumnN)` - Removes leading zeros, returns '0' if empty
- `RemoveTrailingSpaces(ColumnN)` - Removes trailing whitespace
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

**Math Functions:**
- `Sum(Column1, Column2, ...)` - Adds multiple numeric fields with validation
- `Multiply(Column1, Column2, ...)` - Multiply multiple values
- `Divide(Column1, Column2)` - Divide values (handles division by zero)
- `Round(ColumnN, decimals)` - Round to decimal places
- `Abs(ColumnN)` - Absolute value
- `Max(Column1, Column2, ...)` - Maximum value
- `Min(Column1, Column2, ...)` - Minimum value

**Date Functions:**
- `DateReformat(ColumnN, 'inputFormat', 'outputFormat')` - Reformat date strings (e.g., MMDDYYYY to YYYYMMDD)
- `Today()` - Current date
- `Now()` - Current timestamp

**Supported Date Formats:**
- Currently supports: MMDDYYYY to YYYYMMDD conversion
- Example: DateReformat(Column18,'MMDDYYYY','YYYYMMDD') converts "10252025" to "20251025"

**Conditional Logic:**
- `If Column1 == 'value' Then 'result'` - Simple conditional
- `If Column1 != 'value' Then Column2 Else 'default'` - If-Then-Else
- `If Column1 > 5 Then 'High' ElseIf Column1 < 2 Then 'Low' Else 'Medium'` - Multiple conditions

**Validation Functions:**
- `IsEmpty(ColumnN)` - Check if empty (returns 'true' or 'false')
- `IsNumeric(ColumnN)` - Check if numeric (returns 'true' or 'false')
- `ValidateLength(ColumnN, min, max)` - Validate string length
- `ValidateRange(ColumnN, min, max)` - Validate numeric range
- `ValidateFormat(ColumnN, 'type')` - Validate format (email, phone, date)

**Static Values & Direct Mapping:**
- `'Static Text'` - Quoted literal values
- `Hardcode 'value'` - Explicit static value assignment
- `Increment By 1` - Auto-increment counter (1, 2, 3, 4...)
- `ColumnN` - Direct column mapping
- Raw JavaScript expressions for advanced cases

### Error Handling & Validation
- **Required field validation**: Automatic checking for mandatory fields
- **Mapping table validation**: InputColumnNumber and MappingLogic cannot both have values
- **Numeric validation**: Strict validation for mathematical operations
- **Length validation**: Min/max character length checking
- **Range validation**: Numeric min/max value validation
- **Format validation**: Email, phone, and date format checking
- **Column reference validation**: Safe column access with warning messages and null checks
- **Safe parsing**: `parseFloat(data[n]) || 0` patterns prevent undefined errors
- **Row-level warnings**: Missing columns show console warnings with row numbers
- **Comprehensive error messages**: Detailed feedback for debugging

### User Interface
- **Tabbed Interface**: Switch between JS Generator, Mapping Table Converter, and Reference
- **Interactive Reference**: Comprehensive function reference with searchable table format
- **Live preview**: Real-time display of mapping table and input data
- **Reset functionality**: Animated reset with stickman feedback
- **Download system**: Direct download of generated JavaScript and CSV files
- **Professional design**: AI-themed interface with gradient accents and automation icons
- **Responsive layout**: Optimized for desktop and mobile viewing

### Code Generation
- **Two Generation Modes**: Static (self-contained) and Dynamic (runtime flexible)
- **Static Mode**: Embedded mapping rules with usage instructions
- **Dynamic Mode**: Universal mapper requiring mapping CSV at runtime
- **Complete JavaScript functions**: Self-contained mapping code with all dependencies
- **Embedded CSV parser**: No external dependencies required
- **Validation helpers**: Built-in validation functions in generated code
- **Error handling**: Comprehensive try-catch logic for robust execution
- **Proper CSV output**: Handles quoting and escaping for special characters

## Supported File Types
- Input: CSV, TXT files
- Mapping: CSV files
- Output: JavaScript (.js) and CSV files

## Cerner GL Integration
- Processes Cerner General Ledger transaction files
- Handles ambulatory care financial data
- Maps department codes to readable names
- Calculates net amounts and transaction flags
- Validates account codes and entity information
- Immediate problem detection with row-level error reporting
- Reduces project risk through early data quality validation

## IPA Integration
- **Dynamic Processing**: Reads mapping table CSV at runtime
- **Two-File Input**: Data CSV + Mapping CSV → Transformed output
- **Runtime Generation**: Creates transformation logic on-demand
- **No Pre-compilation**: Mapping rules applied dynamically
- **Single Function Call**: transformData(inputText, MappingTable, delimiter, skipRows)
- **Built-in Validation**: Error handling and data quality checks

## Documentation Maintenance
**Important**: Whenever you learn something new about the JavaScript Mapper or discover new functionality, update the relevant markdown files in the `docs/` folder to keep the documentation current and accurate. This includes:
- New mapping functions or syntax
- Interface changes or new features
- Bug fixes or behavior changes
- Integration patterns or best practices
- Error handling improvements