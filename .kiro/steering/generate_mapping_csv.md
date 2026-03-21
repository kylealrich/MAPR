---
inclusion: manual
---

# Generate Mapping CSV - Learnings & Optimization Notes

## Document Analysis (python-docx)

### Fast Table Identification
- The field mapping table is typically the **largest table** in the document (60-80+ rows).
- Look for tables with headers containing: `S No.`, `Target`, `Input/source file`, `Remarks`, `Type`, `Size`, `Required`.
- Skip small tables (< 10 rows) — they are metadata, email configs, test scenarios, or sign-off blocks.
- Table index is not fixed across documents; always scan by header signature, not by index.

### Column Mapping from Document to CSV
- The document's "Input/source file" column contains free-text descriptions with embedded column letters (e.g., "Column A", "Column C").
- Map column letters to 1-indexed numbers: A=1, B=2, C=3, ... Z=26.
- Transformation hints are embedded in the same cell (e.g., "Remove leading zeroes", "First 6 digits", "Last 5 digit").
- Hardcoded values appear as plain text without column references (e.g., "AHF", "0", "N").
- "Blank" or empty Input/source file means no mapping (leave InputColumnNumber and MappingLogic empty).

### Determining File Type
- **Delimited**: Document mentions "CSV", "comma", "pipe", "tab", column letters (A, B, C...), or shows tabular source data.
- **Fixed-Length**: Document mentions "Start", "End", character positions, or record type indicators.
- The Cerner GLTrans interface is **comma-delimited, single business class**.

### Determining Single vs Multi-Record
- **Single**: One business class target (e.g., "GLTransactionInterface business class").
- **Multiple**: Document references multiple record types, type indicator positions, or parent-child relationships between record types.

## Mapping Logic Translation Rules

### From Document Description to MappingLogic Syntax
| Document Description | MappingLogic |
|---|---|
| "Column X" (direct) | `ColumnN` |
| "Remove leading zeroes" + Column | `RemoveLeadingZeroes(ColumnN)` |
| "First N digits" + Column | `Left(ColumnN,N)` |
| "Last N digits" + Column | `Right(ColumnN,N)` |
| Hardcoded literal value | `Hardcode 'value'` |
| "Increment by 1" / "Sequence Number" | `Increment By 1` |
| Date field with format conversion | `DateReformat(ColumnN,'MMDDYYYY','YYYYMMDD')` |
| "X will default if left blank" | `If ColumnN == '' Then 'X' Else ColumnN` |
| "Blank" or no source | (leave empty) |
| "HardCoded = N" | `Hardcode 'N'` |

### DataType Mapping
| Document Type | CSV DataType |
|---|---|
| AlphaUpper, Alpha | string |
| Numeric | integer |
| Decimal (with size like 18.2) | decimal |
| Date | string (dates stored as formatted strings) |
| Boolean | string |
| UniqueID | (skip row — system-generated) |

### Fields to Skip
- `UniqueID` — system-generated, no mapping needed.
- `GLTransactionInterface_user_fields` — internal placeholder, no mapping.
- Fields with no source and no default (rows 20-47 ReportCurrencyAmount.*) — omit unless document specifies a source.
- `ErrorMessage` — system-generated.
- `SenderLogicalID`, `SenderComponentID`, `SenderCreationDateTime`, `SenderBODID`, `SenderOriginalBOD` — system/integration fields, omit.

## Archive Check
- Always check `/archive/` for existing mappings for the same interface before generating from scratch.
- An existing mapping can serve as a validated baseline — cross-reference against the document to catch updates.

## Performance Tips
- Extract only the field mapping table (largest table) — skip all others.
- Write a single Python script that extracts, analyzes, and determines file type in one pass.
- Clean up all temp files after generation.
- The `executePwsh` shell may be stuck from prior mapper runs — always use `controlPwshProcess` for shell commands.

## SoNH CB Recon (INT_FIN_093) - Learnings (2026-03-21)

### Document Structure
- The SoNH CB Recon document uses a different table structure than Aultman Health docs.
- The FSM field mapping table has headers: `FSM Field`, `Type`, `Field Size`, `Required Field?`, `Remarks`, `Sample Value`, `Bank Values /Fields`.
- Row 1 is a merged header row ("CashLedgerBankUpdate Business Class") with a note — skip it.
- Actual field rows start at Row 2.
- The "Bank Values /Fields" column names the bank format field (e.g., "Account Number", "Dollar Amount", "Status Code", "Paid Date", "Check Serial Number").
- There is NO separate bank format table with Start/End positions — positions must be derived from the sample record and extract sample table.

### Fixed-Length Position Derivation
- Sample record: `33118329320000262751R00000002873501092645236521` (47 chars)
- Extract sample table (Table 15) lists field values in order without position info.
- Derived positions:
  - Account Number: pos 1-10 (10 chars)
  - Check Serial Number: pos 11-20 (10 chars)
  - Status Code: pos 21-21 (1 char)
  - Dollar Amount: pos 22-33 (12 chars, 2 implied decimals)
  - Paid Date: pos 34-39 (6 chars, MMDDYY format)
  - Batch and Sequence Number: pos 40-47 (8 chars) — NOT mapped per document

### Engine Limitations Encountered
- `Divide()` only accepts two Column references — cannot do `Divide(Column4, Hardcode '100')`.
- `DateReformat()` only supports 8-char formats (MMDDYYYY, YYYYMMDD) — no MMDDYY (6-char) support.
- `ElseIf` is NOT supported in the If conditional parser — only `If...Then...Else`.
- `ImpliedDecimal` column in the mapping CSV is for documentation only — the exe does not process it.
- For fields requiring transformations beyond engine capabilities (implied decimal, MMDDYY dates), output the raw column value and rely on IPA to handle the conversion.

### Mapping Decisions
- CashManagementGroup: Hardcoded 'SONH' per document default.
- RunGroup: Hardcoded 'SONH_CBrecon' — IPA constructs the full RunGroup with CashCode and date at runtime.
- CashLedgerUpdateAction: `If Column3 == 'P' Then '4' Else '6'` — simplified from ElseIf since only P and R values exist.
- TransactionAmount: Raw Column4 with ImpliedDecimal=2 — IPA handles decimal insertion.
- ActionDate: Raw Column5 — IPA handles MMDDYY→YYYYMMDD conversion.
- CashCode: Hardcoded empty — IPA looks up CashCode from CashManagementAccount at runtime.
- CheckNumber: `RemoveLeadingZeroes(Column2)` per document sample showing "read as 262751".

### File Already in Archive
- The input docx was already in `/archive/` from a prior session — check before attempting move.
- PowerShell `Copy-Item` chokes on `+` in filenames — use `-LiteralPath` parameter.
