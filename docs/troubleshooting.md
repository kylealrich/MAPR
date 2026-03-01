# Troubleshooting Guide - JavaScript Mapper

## Interface Overview

The JavaScript Mapper (JavaScript_Mapper.html) features a modern tabbed interface:
- **JS Generator Tab**: Main functionality with file type selection
- **Mapping Table Converter Tab**: Future feature (Work in Progress)
- **Reference Tab**: Interactive function reference with comprehensive examples

### File Type Issues
- **Delimited Files**: Use delimiter dropdown and skip rows settings
- **Fixed-Length Files**: Currently shows "Work in Progress" message
- **Interface Behavior**: Delimiter options only appear when "Delimited" is selected

## Common Issues

### IPA Runtime Errors
- **Issue:** "console not defined" error in IPA
- **Solution:** The mapper functions have been updated to remove console.warn calls for IPA compatibility
- **Note:** Use the latest version of mapper-core.js or generated code from mapping_generator.html

### File Loading Problems
- **Issue:** "Please select both files" error
- **Solution:** Ensure both mapping CSV and input data files are selected

### Mapping Logic Errors
- **Issue:** "Mapping logic error" alert
- **Solution:** Check mapping logic syntax in CSV file
  - Verify column references (Column1, Column2, etc.)
  - Ensure proper function syntax
  - Test with simpler logic first
  - For Sum function: `Sum(Column1, Column2)` not `Sum(Column1 + Column2)`
  - Use MappingTable variable name in IPA integration

### Mapping Table Validation Errors
- **Issue:** "InputColumnNumber and MappingLogic cannot both have values" error
- **Solution:** Use only one mapping method per row
  - **Direct mapping**: Use InputColumnNumber only (e.g., `1`, `2`, `3`)
  - **Transformation mapping**: Use MappingLogic only (e.g., `Trim(Column1)`, `Hardcode '1'`)
  - **Leave both empty**: Field will be null
  - **Never use both**: This creates ambiguity about which rule to apply

### Required Field Validation Errors
- **Issue:** "Required field is blank" for numeric calculations
- **Solution:** Numeric values including 0 are valid; check if calculation returns null/undefined

### Numeric Validation Errors
- **Issue:** "Non-numeric value in Sum calculation" error
- **Solution:** Ensure all Sum input fields contain only numbers
  - Valid: "100", "-50", "3.14"
  - Invalid: "2s00", "abc", "100x", "N/A"

### Date Format Conversion Issues
- **Issue:** Need to convert MMDDYYYY to YYYYMMDD format
- **Solution:** Use `ParseDate(ColumnN,'MMDDYYYY','YYYYMMDD')`
  - Example: "10252025" → "20251025"
  - For bulk conversion, apply to all date columns in mapping table

### ParseDate Invalid Date Errors
- **Issue:** "Invalid Date" when using ParseDate function
- **Solution:** Ensure date format matches input data
  - For "05022024": Use `ParseDate(Column7,'MMDDYYYY','YYYY-MM-DD')`
  - For "10252025": Use `ParseDate(Column1,'MMDDYYYY','YYYYMMDD')`
  - Validates month (1-12), day (1-31), year (>=1900)
  - Returns original string if parsing fails
- **Supported Formats:**
  - Input: MMDDYYYY, DDMMYYYY, YYYYMMDD
  - Output: YYYYMMDD, YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, MMDDYYYY, DDMMYYYY

### Empty Output
- **Issue:** Generated CSV has headers but no data
- **Solution:** 
  - Verify input data format matches expected delimiter
  - Check that input file has data rows beyond headers
  - Ensure mapping table references correct column numbers

### Download Issues
- **Issue:** Download buttons not appearing
- **Solution:** Complete the full generation process before downloading

## Data Format Requirements

### Mapping CSV Format
```csv
TargetTableName,TargetFieldName,Required,InputColumnNumber,MappingLogic,SampleValue
```

### Input Data Requirements
- Must match selected delimiter
- Column numbers in mapping table are 1-based
- Empty cells are treated as empty strings
- Fields containing delimiters must be quoted
- Use double quotes (`""`) to escape quotes within quoted fields
- Numeric operations handle empty cells as 0

### CSV Parsing Issues
- **Issue:** Fields with commas not parsing correctly
- **Solution:** Ensure fields containing delimiters are properly quoted
- **Example:** `"Smith, John",25,"New York, NY"`

### Column Shifting in Excel
- **Issue:** MappingLogic column values shift to adjacent columns
- **Solution:** Quote all MappingLogic values containing commas or special characters
- **Example:** `"If Column1 == """" Then ""GL"" Else Column1"`
- **Fix:** Use `CernerGL_MappingTable_Fixed.csv` as reference for proper quoting

## Interface Features
- **Tabbed Navigation:** Switch between JS Generator, Mapping Table Converter, and Reference
- **AI-Powered Design:** Professional interface with automation icons and gradient accents
- **Interactive Reference:** Comprehensive function reference with table format and examples
- **File Type Selection:** Choose between Delimited and Fixed-Length files
- **Conditional UI:** Delimiter and skip rows only show for delimited files
- **Function Categories:** Basic Commands, String Functions, Math Functions, Conditional Logic, Validation Functions, Error Handling
- **Input Preview:** Review uploaded file content before processing
- **Reset Button:** Clear all selections and outputs with animated feedback
- **Responsive Layout:** Optimized for desktop and mobile viewing
- **Generated Code:** Includes both parsing functions and demo data

## Browser Compatibility
- Modern browsers with FileReader API support
- JavaScript must be enabled
- Local file access permissions required