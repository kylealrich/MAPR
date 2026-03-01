# JavaScript Mapper - Development Guidelines

## Code Quality Standards

### JavaScript Coding Conventions
- **ES5 Compatibility**: Use `var` declarations and `function` expressions for maximum browser compatibility
- **Function Declarations**: Use standard function declaration syntax: `function functionName() {}`
- **Variable Naming**: Use camelCase for variables and functions: `incrementCounter`, `parseCSV`, `normalizeKey`
- **Constants**: Use UPPERCASE for string constants: `'YYYYMMDD'`, `'MMDDYYYY'`
- **Consistent Indentation**: Use 2-space indentation throughout the codebase
- **Semicolon Usage**: Always terminate statements with semicolons

### Code Structure Patterns
- **Single Responsibility**: Each function has one clear purpose (parseCSV, normalizeKey, applyLogic)
- **Pure Functions**: Functions return consistent outputs for given inputs without side effects
- **Defensive Programming**: Always check for null/undefined values: `data[col[1]-1] || ''`
- **Early Returns**: Use early returns for validation: `if (!logic) return null;`
- **Guard Clauses**: Validate inputs at function start before processing

### Error Handling Standards
- **Comprehensive Validation**: Check array bounds before access: `if (i >= d.length) throw new Error(...)`
- **Meaningful Error Messages**: Include context in error messages: `'Column ' + (i + 1) + ' missing for "' + f + '"'`
- **Graceful Degradation**: Return safe defaults when possible: `data[n-1] || '0'`
- **Try-Catch Blocks**: Wrap main processing in try-catch with structured error responses
- **Null Coalescing**: Use `|| ''` pattern for safe string operations

## Architectural Patterns

### Function Design Patterns
- **Factory Pattern**: `createDynamicMapper()` returns configured mapper objects
- **Strategy Pattern**: Different transformation functions selected based on logic type
- **Chain of Responsibility**: Sequential regex matching for function identification
- **Module Pattern**: Export functions for external use with conditional module.exports

### Data Processing Patterns
- **Pipeline Processing**: Data flows through parse → transform → output stages
- **Immutable Operations**: Original data arrays are not modified during processing
- **Functional Programming**: Heavy use of `map()`, `forEach()`, `filter()` for data transformation
- **State Management**: Global counters reset at appropriate boundaries (`incrementCounter = 0`)

### Regular Expression Patterns
- **Case-Insensitive Matching**: Use `/i` flag for user input: `/^Increment By 1$/i`
- **Capture Groups**: Extract parameters: `/Column(\\d+)/i` to capture column numbers
- **Global Matching**: Use `/gi` for multiple matches: `/Column(\\d+)/gi`
- **Boundary Matching**: Use `^` and `$` for exact matches: `/^['\"].*['\"]$/`
- **Escape Special Characters**: Properly escape regex metacharacters in patterns

## Internal API Usage Patterns

### CSV Processing API
```javascript
// Standard CSV parsing with delimiter
var rows = parseCSV(text, delimiter);

// Key normalization for mapping tables
var normalizedKey = normalizeKey(key);

// Safe array access with bounds checking
function safeGet(d, i, f, r) {
  if (i >= d.length) throw new Error('Column ' + (i + 1) + ' missing for "' + f + '"');
  return d[i] || '';
}
```

### Transformation Logic API
```javascript
// Apply transformation with context
var result = applyLogic(logic, data, field, rowIndex);

// Column reference pattern
var col = logic.match(/Column(\\d+)/i);
if (col) return (data[col[1]-1] || '').trim();

// Multi-column operations
var cols = logic.match(/Column(\\d+)/gi);
if (cols) return cols.map(function(c) { 
  var n = c.match(/\\d+/)[0]; 
  return data[n-1] || ''; 
}).join('');
```

### Dynamic Mapper Creation
```javascript
// Create mapper from configuration
var mapper = createDynamicMapper(mappingData);

// Process records with error handling
var results = inputData.map(function(row, index) {
  return mapper.mapRecord(row, index);
});
```

## Frequently Used Code Idioms

### Safe Data Access
```javascript
// Safe column access with default
var value = data[columnIndex - 1] || '';

// Safe numeric parsing
var numValue = parseFloat(val) || 0;

// Safe string operations
var result = (data[col[1]-1] || '').trim();
```

### String Processing Idioms
```javascript
// Remove leading zeros with fallback
return (value || '').replace(/^0+/, '') || '0';

// Case-insensitive string comparison
if (value.toUpperCase() === 'Y') { /* required field */ }

// String concatenation with null safety
return cols.map(function(c) { return data[n-1] || ''; }).join('');
```

### Validation Patterns
```javascript
// Numeric validation regex
if (!/^-?\\d*\\.?\\d+$/.test(val.toString().trim())) {
  throw new Error('Non-numeric value: ' + val);
}

// Empty value checking
if (!value || !value.toString().trim()) {
  // Handle empty required field
}
```

### Date Processing Patterns
```javascript
// Date formatting with padding
function pad(n) { return n < 10 ? '0' + n : n; }

// Date format conversion
if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD') {
  return dateStr.substring(4, 8) + dateStr.substring(0, 4);
}
```

## Development Standards

### Function Naming Conventions
- **Verbs for Actions**: `parseCSV`, `normalizeKey`, `applyLogic`, `createDynamicMapper`
- **Descriptive Names**: Function names clearly indicate purpose and return type
- **Consistent Prefixes**: `parse*`, `create*`, `apply*` for similar operation types
- **Boolean Functions**: Use `is*` prefix for boolean returns (though not present in current code)

### Comment Standards
- **Function Headers**: Brief comment describing function purpose
- **Section Comments**: Group related functionality with section comments
- **Inline Comments**: Explain complex regex patterns and business logic
- **TODO Comments**: Mark areas for future enhancement (Fixed-Length support)

### Variable Declaration Patterns
- **Initialization**: Always initialize variables: `var result = [];`
- **Scope Management**: Declare variables at function top when possible
- **Meaningful Names**: `mappingRules`, `headers`, `incrementCounter`
- **Consistent Naming**: Use same naming pattern across similar variables

### Module Export Patterns
```javascript
// Conditional module exports for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    transformData: transformData,
    applyLogic: applyLogic
  };
}
```

### Performance Optimization Patterns
- **Regex Compilation**: Compile regex patterns once, reuse multiple times
- **Array Methods**: Use native array methods (`map`, `forEach`, `filter`) for efficiency
- **String Building**: Use array join for multiple concatenations
- **Early Exit**: Return immediately when conditions are met to avoid unnecessary processing
- **Caching**: Store parsed mapping rules to avoid re-parsing during batch operations