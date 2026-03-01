# PDF to Mapping Table Conversion Guide

## Overview
This guide explains how to convert PDF mapping specifications into usable CSV mapping tables for the JavaScript Mapper tool (JavaScript_Mapper.html).

## Interface Features

### Tabbed Navigation
- **JS Generator Tab**: Main functionality for creating mapping code
- **Mapping Table Converter Tab**: Future automated PDF conversion feature (Work in Progress)
- **Reference Tab**: Interactive function reference with comprehensive syntax examples

### File Type Support
- **Delimited Files**: Full support with delimiter selection and skip rows
- **Fixed-Length Files**: Coming soon (Work in Progress)

### Reference System
- **Interactive Reference**: Table format with Function, Description, Syntax, and Example columns
- **Function Categories**: Basic Commands, String Functions, Math Functions, Conditional Logic, Validation Functions, Error Handling
- **Real Examples**: Actual CSV syntax with sample transformations

## Template Structure
Use this CSV template for creating mapping tables:

```csv
TargetTableName,TargetFieldName,Required,InputColumnNumber,MappingLogic,SampleValue
```

## Column Definitions

| Column | Purpose | Values | Notes |
|--------|---------|--------|-------|
| TargetTableName | Output table identifier | GLT, TRANS, etc. | Usually consistent across mappings |
| TargetFieldName | Output field name | BatchID, Amount, etc. | Must be valid identifiers |
| Required | Mandatory field flag | Y/N | Y = validates non-empty |
| InputColumnNumber | Source column (1-based) | 1,2,3... | Leave empty if using MappingLogic |
| MappingLogic | Transformation rule | Column1, Trim(Column2), etc. | Leave empty for direct mapping |
| SampleValue | Example output | 12345, Test, etc. | For documentation only |

## Conversion Process

### Step 1: Identify Data Structure
From PDF, extract:
- Input file column positions
- Output field requirements
- Transformation rules
- Validation requirements

### Step 2: Create Direct Mappings
For simple field copies:
```csv
GLT,BatchID,Y,,Column1,04082025BLU2
GLT,SequenceID,Y,,"Increment By 1",1
GLT,Amount,Y,,Column12,221.35
GLT,Status,N,,"Hardcode '0'",0
```

### Step 3: Add Transformations
For data manipulation:
```csv
GLT,CleanAccount,Y,,RemoveLeadingZeroes(Column4),1020027
GLT,FullName,N,,Concat(Column2,Column3),John Doe
GLT,TransactionDate,Y,,"ParseDate(Column7,'MMDDYYYY','YYYY-MM-DD')",2024-05-02
GLT,DateFormatted,Y,,"ParseDate(Column1,'MMDDYYYY','YYYYMMDD')",20251025
GLT,NetAmount,N,,"parseFloat(data[11]) || 0",221.35
GLT,RecordID,Y,,"Increment By 1",1
GLT,DefaultValue,N,,"Hardcode 'DEFAULT'",DEFAULT
```

### Step 4: Add Conditional Logic
For business rules:
```csv
GLT,IsDebit,N,,"(parseFloat(data[11]) || 0) > 0 ? 'Y' : 'N'",Y
GLT,DeptName,N,,"data[2] == '10' ? 'General' : 'Other'",General
```

## Common Patterns

### Healthcare/GL Mappings
```csv
GLT,TransactionID,Y,,Column1,TXN001
GLT,SequenceNumber,Y,,"Increment By 1",1
GLT,AccountCode,Y,,RemoveLeadingZeroes(Column4),123456
GLT,Amount,Y,,Column12,1000.00
GLT,Status,N,,"Hardcode '0'",0
GLT,TransactionType,N,,"data[8] == 'Cash' ? 'C' : 'O'",C
GLT,Description,N,,"'Batch: ' + data[0] + ' - Dept: ' + data[2]",Batch: TXN001 - Dept: 10
```

### Validation Rules
```csv
GLT,Email,Y,,ValidateFormat(Column5,'email'),user@domain.com
GLT,Phone,N,,ValidateLength(Column6,10,15),555-1234
GLT,Amount,Y,,ValidateRange(Column7,0,999999),1000
```

## Best Practices

1. **One mapping method per row** - Use either InputColumnNumber OR MappingLogic, never both
2. **Direct mapping** - Use InputColumnNumber for simple column copying
3. **Transformation mapping** - Use MappingLogic for functions, conditions, static values
4. **Add null checks** - Use `|| 0` or `|| ''` for safe parsing
5. **Test incrementally** - Start with direct mappings, add complexity gradually
6. **Document samples** - Include realistic SampleValue entries
7. **Validate required fields** - Mark critical fields as Required=Y

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Column N missing | InputColumnNumber used with MappingLogic | Remove InputColumnNumber |
| Function not defined | Unsupported function used | Use JavaScript or built-in functions |
| Parsing error | Invalid JavaScript syntax | Check quotes and operators |
| Required field blank | Missing validation | Add null checks in logic |
| Column warnings in console | Missing columns in data | Check console for row-specific warnings |

## Example: Cerner GL Conversion

PDF shows: "Map transaction batch ID from position 1, auto-generate sequence numbers"

Becomes:
```csv
GLT,BatchID,Y,,Column1,04082025BLU2
GLT,SequenceNumber,Y,,"Increment By 1",1
GLT,Status,N,,"Hardcode '0'",0
GLT,CleanBatch,Y,,Trim(Column1),04082025BLU2
GLT,IsValidSeq,N,,"parseFloat(data[1]) > 0 ? 'Y' : 'N'",Y
```