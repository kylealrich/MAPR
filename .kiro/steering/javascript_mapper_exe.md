# JavaScript_Mapper.exe - Execution & Interaction Reference

## What It Is

`BIN/JavaScript_Mapper.exe` is a PyInstaller-compiled Windows executable built from `BIN/javascript_mapper.py`. It is an interactive CLI tool that transforms data files (delimited or fixed-length) using CSV mapping tables, producing JavaScript mapper code and mapped CSV output.

## Source & Build

- Source: `BIN/javascript_mapper.py` (Python 3, ~1771 lines)
- Wrapper: `BIN/run_mapper.py` (disables `cls` so piped stdin works)
- Compiled with PyInstaller into a standalone `.exe` (no Python required to run)

## Path Resolution

The exe resolves all paths relative to its **parent directory** (not the BIN folder). If the exe lives at `BIN/JavaScript_Mapper.exe`, it strips the `BIN` suffix and uses the workspace root as the base. This means:
- `input/` = workspace root `input/` folder
- `output/` = workspace root `output/` folder
- `archive/` = workspace root `archive/` folder

```python
# From resolve():
base = os.path.dirname(os.path.abspath(sys.argv[0]))
if os.path.basename(base).upper() == 'BIN':
    base = os.path.dirname(base)
```

## Directory Requirements

The exe auto-creates these directories if missing:
- `input/` — place input data files and mapping CSVs here before running
- `output/` — all generated files are written here
- `archive/` — processed input files are moved here after completion

## Interactive Menu Flow

The exe is fully interactive (stdin prompts). It cannot accept command-line arguments. The flow is:

### Step 1: File Type Selection
```
[1] Delimited (CSV, pipe, tab, etc.)
[2] Fixed-Length
```

### Delimited Workflow (Choice 1)
1. **Step 1A** — Pick input data file from `input/` (filters: .csv, .txt, .dat, .tsv)
2. **Step 1B** — Pick mapping CSV file from `input/` (filters: .csv)
3. **Step 1C** — Choose delimiter: Comma, Pipe, Tab, Semicolon, or Custom
4. **Step 1D** — Enter number of rows to skip (default 0)
5. **Step 2** — Processing (automatic)
6. **Step 3** — Archive (automatic, moves input files to `archive/`)
7. **Step 4** — Create HTML viewer? (y/n)

### Fixed-Length Workflow (Choice 2)
1. **Step 1A** — Multi-record file? (y/n)
   - **Single-record**: Pick input file, pick mapping CSV
   - **Multi-record**: Pick input file, pick record type config CSV, then pick mapping CSV for each record type
2. **Step 2** — Processing
3. **Step 3** — Archive
4. **Step 4** — HTML viewer? (y/n)

## Piping Input (Non-Interactive Automation)

Since the exe uses `input()` prompts, automate it by piping newline-separated answers. Use `run_mapper.py` wrapper to prevent `cls` from consuming stdin.

**Important**: The number of piped answers depends on how many files are in `input/` and how many record types exist. Each `pick_file` prompt shows a numbered list — you must provide the correct index.

## Output Files Generated

For an input file named `MyData.csv`, the exe produces:

| File | Location | Description |
|------|----------|-------------|
| `MyData_Mapped.csv` | `output/` | Transformed CSV data |
| `MyData_RuntimeFlexible_Mapper.js` | `output/` | ES5 JS with `transformData()` function, reads mapping at runtime |
| `MyData_SelfContained_Mapper.js` | `output/` | ES5 JS with hardcoded rules and `mapRecord()` function |
| `MyData_Mapped.html` | `output/` | Tabbed HTML viewer (if user chose yes) with JS code + CSV table |

For multi-record fixed-length, additional per-type CSVs are created:
- `MyData_{OutputName}_Mapped.csv` for each record type

## Mapping CSV Format

### Delimited Mapping Table
Required columns (header names are normalized, case/space insensitive):
```csv
TargetFieldName,Required,InputColumnNumber,MappingLogic,SampleValue
AccountCode,Y,5,"Left(Column5,6)",102002
Status,N,,Hardcode '0',0
```
- `TargetFieldName` or `FieldName` — output column name
- `MappingLogic` — transformation expression (see syntax_reference.md)
- `InputColumnNumber` — fallback direct column mapping (1-indexed) when no MappingLogic
- `Required` — Y/N for validation

### Fixed-Length Mapping Table
```csv
FieldName,Start,End,Required,MappingLogic,DefaultValue
Record Type,1,1,Y,,
Company Code,2,5,Y,RemoveLeadingZeroes(Company Code),
```
- `Start`/`End` — 1-indexed character positions in the fixed-length line
- `MappingLogic` — optional transformation (if blank, raw extracted value is used)
- `DefaultValue` — fallback when no logic specified

### Multi-Record Config CSV
```csv
RecordType,TypeIndicatorPosition,TypeIndicatorValue,MappingFile,ParentRecordType,OutputName
H,1,H,header_mapping.csv,,Headers
L,1,L,line_mapping.csv,H,LineItems
```
- `TypeIndicatorPosition` — 1-indexed position of the record type character
- `TypeIndicatorValue` — character value that identifies this record type
- `MappingFile` — name of the mapping CSV for this record type (informational; user picks interactively)

## Supported Transformation Functions

The exe's `apply_logic()` supports the same functions as `mapper-core.js`:
- Column references: `Column1`, `Column12`
- String: `Trim()`, `Uppercase()`, `Lowercase()`, `Left()`, `Right()`, `Substring()`, `Concat()`, `Replace()`, `PadLeft()`, `PadRight()`, `AddLeft()`, `AddRight()`, `RemoveLeadingZeroes()`, `RemoveTrailingSpaces()`
- Math: `Sum()`, `Multiply()`, `Divide()`, `Round()`, `Abs()`
- Date: `DateReformat()`, `Today()`, `Now()`
- Logic: `If...Then...Else`, `Hardcode 'value'`, `'static value'`, `Increment By 1`
- Concatenation with `+` operator

## Kiro Interaction Guidelines

### CRITICAL: How to Run via Kiro (Step-by-Step)

The default `executePwsh` shell can get stuck with lingering interactive processes from prior mapper runs. **ALWAYS use `controlPwshProcess` (background process) to run the mapper.** Never use `executePwsh`.

**WARNING — Stuck Shell**: If a previous mapper run left a stuck interactive process, the `executePwsh` shell becomes unusable — even simple commands like `python temp_sort.py` will be swallowed by the lingering `Enter number:` prompt. If you suspect the shell is stuck, use `controlPwshProcess` for ALL commands (not just the mapper) until the shell is clean.

#### Step 1: Determine File Indices

Use `listDirectory` on the `input/` folder. The exe uses `sorted(os.listdir())` which is **ASCII sort order** (uppercase letters before lowercase, digits before letters, underscore `_` sorts after uppercase `Z`).

**PREFERRED APPROACH — Compute Sort Order Manually**: Rather than running a Python script to get the sort order (which can fail if the shell is stuck), compute it yourself from the `listDirectory` output. Apply ASCII sort: digits (0x30-0x39) < uppercase (0x41-0x5A) < underscore (0x5F) < lowercase (0x61-0x7A). Character-by-character comparison, shorter string wins if one is a prefix of the other.

**IMPORTANT — Two Separate Sorted Lists**: The exe builds different file lists for different prompts based on extension filters:
- **"All files" prompts** (input data file): filters `.csv`, `.txt`, `.dat`, `.tsv` — shows ALL matching files, sorted.
- **"CSV only" prompts** (mapping files, config file): filters `.csv` only — shows only `.csv` files, sorted.

You must compute indices separately for each filtered list. The index for a `.csv` file in the "all files" list will differ from its index in the "CSV only" list.

Example: if `input/` contains these files (already ASCII-sorted):
```
OMRQ_Comment_FixedLength_Mapping.csv
OMRQ_Detail_FixedLength_Mapping.csv
OMRQ_Header_FixedLength_Mapping.csv
OMRQ_Line_FixedLength_Mapping.csv
OMRQ_RecordType_Config.csv
input.csv
input.txt
omrq.bcs.20250405101502.txt
```

The exe builds these lists:
```
All files list (for input data file selection):
  [1] OMRQ_Comment_FixedLength_Mapping.csv
  [2] OMRQ_Detail_FixedLength_Mapping.csv
  [3] OMRQ_Header_FixedLength_Mapping.csv
  [4] OMRQ_Line_FixedLength_Mapping.csv
  [5] OMRQ_RecordType_Config.csv
  [6] input.csv
  [7] input.txt
  [8] omrq.bcs.20250405101502.txt

CSV-only list (for config file and mapping file selection):
  [1] OMRQ_Comment_FixedLength_Mapping.csv
  [2] OMRQ_Detail_FixedLength_Mapping.csv
  [3] OMRQ_Header_FixedLength_Mapping.csv
  [4] OMRQ_Line_FixedLength_Mapping.csv
  [5] OMRQ_RecordType_Config.csv
  [6] input.csv
```

**Multi-Record Mapping File Selection**: For multi-record fixed-length, the exe asks for mapping files in the order the record types appear in the config CSV (row order). The CSV-only file list is the SAME for every record type prompt — indices do not change between prompts. Read the config CSV to determine the record type order, then look up each mapping filename in the CSV-only sorted list.

**WARNING**: The sort order may differ from what you expect. `CernerGLT` sorts before `CernerGL_` because uppercase `T` (ASCII 84) < `_` (ASCII 95). Always verify by checking the actual sorted order of filenames.

#### Step 2: Write Answers to a Temp File

Use `fsWrite` to create a temp file with one answer per line. Always include a trailing blank line for the final "Press Enter to exit..." prompt.

```
# Delimited example (temp_input.txt):
1           ← file type: delimited
1           ← input data file index (from ALL files list)
1           ← mapping file index (from CSV-only list)
1           ← delimiter: comma
0           ← skip rows
y           ← create HTML
            ← (blank line for Press Enter to exit)
```

```
# Fixed-length single-record example (temp_input.txt):
2           ← file type: fixed-length
n           ← not multi-record
1           ← input data file index (from ALL files list)
1           ← mapping file index (from CSV-only list)
y           ← create HTML
            ← (blank line for Press Enter to exit)
```

```
# Fixed-length multi-record example (temp_input.txt):
2           ← file type: fixed-length
y           ← multi-record
8           ← input data file index (from ALL files list)
5           ← config file index (from CSV-only list)
3           ← mapping file for record type 1 (from CSV-only list, same list reused)
4           ← mapping file for record type 2 (from CSV-only list, same list reused)
2           ← mapping file for record type 3 (from CSV-only list, same list reused)
1           ← mapping file for record type 4 (from CSV-only list, same list reused)
y           ← create HTML
            ← (blank line for Press Enter to exit)
```

#### Step 3: Run with controlPwshProcess

```powershell
Get-Content temp_input.txt | python BIN/run_mapper.py
```

Use `controlPwshProcess` with action `start` to run this command. Then use `getProcessOutput` (with `lines` parameter, e.g. `lines: 80`) to read the results.

**NOTE**: `getProcessOutput` requires the `lines` parameter — omitting it causes a schema validation error.

#### Step 4: Verify and Clean Up

1. Read the process output to confirm success (look for "SUCCESS: N records processed")
2. Stop the background process with `controlPwshProcess` action `stop`
3. Delete the temp file with `deleteFile`
4. Check `output/` for generated files

### Delimiter Mapping

When the user specifies a delimiter, map it to the exe's choice number:
| User Says | Exe Choice |
|-----------|-----------|
| Comma     | 1         |
| Pipe      | 2         |
| Tab       | 3         |
| Semicolon | 4         |
| Custom    | 5 (then enter the character on next line) |

### After Running
- Check `output/` for generated files
- The exe auto-archives input files to `archive/` (with timestamp suffix if duplicates exist)
- If HTML was generated, it auto-opens in the default browser on Windows

### Common Pitfalls
- **NEVER use `executePwsh`** to run the mapper — it can leave a stuck interactive process that hijacks all subsequent commands in that shell. Always use `controlPwshProcess`.
- **Stuck shell contamination**: A stuck mapper process poisons the entire `executePwsh` shell. Even unrelated commands (e.g., `python temp_sort.py`) will be consumed by the lingering `Enter number:` prompt. If this happens, use `controlPwshProcess` for ALL commands until the shell recovers.
- **Don't run helper scripts via `executePwsh` to determine sort order** — if the shell is stuck, they'll fail silently. Instead, compute ASCII sort order manually from `listDirectory` output, or run the helper via `controlPwshProcess`.
- The exe calls `cls` on startup which can consume piped stdin — always use `run_mapper.py` wrapper, never run `javascript_mapper.py` directly.
- File numbering is dynamic based on what's in `input/` — always check `listDirectory` first.
- **Two different file lists**: The exe uses an "all files" list for input data file selection and a "CSV-only" list for mapping/config file selection. A file's index differs between these lists. Always compute indices for both lists separately.
- **Multi-record mapping file list is reused**: The CSV-only file list shown for each record type's mapping file prompt is identical — indices don't change between prompts. Compute them once.
- **Record type order comes from the config CSV**: The exe asks for mapping files in the row order of the record type config CSV. Read the config to determine this order before building the temp input file.
- ASCII sort order can be surprising: `CernerGLT...` sorts BEFORE `CernerGL_...` because `T` < `_` in ASCII.
- The exe exits with `input('\nPress Enter to exit...')` at the end — the temp file must have a trailing blank line.
- Multi-record workflows require one answer per record type for mapping file selection.
- If a run picks the wrong files and archives them, restore from `archive/` before retrying.
- **`getProcessOutput` requires `lines` parameter** — omitting it causes a schema validation error. Use `lines: 80` or similar.
- **Timing for `getProcessOutput`**: The mapper typically completes within a few seconds for small-to-medium files (e.g., 16 records across 4 record types). A single `getProcessOutput` call right after `controlPwshProcess` start is usually sufficient — no need for polling or delays.
- **Always answer `y` to HTML viewer** unless the user explicitly declines — the HTML viewer auto-opens in the browser and provides immediate visual confirmation of results.
- **Verified multi-record fixed-length workflow** (2026-03-21): Successfully ran with 4 record types (Header/Line/Detail/Comment), 16 total records. The temp_input.txt pattern `2 → y → {all-files-idx} → {csv-config-idx} → {csv-mapping-idx per record type in config row order} → y → blank line` works correctly.
- **Verified delimited workflow** (2026-03-21): Successfully ran CernerGLTrans_20251025.txt with CernerGL_MappingTable.csv, comma delimiter, 0 skip rows, 645 records processed. The temp_input.txt pattern `1 → {all-files-idx} → {csv-mapping-idx} → {delimiter-choice} → {skip-rows} → y → blank line` works correctly.
- **CRITICAL — `listDirectory` sort ≠ exe sort**: The `listDirectory` tool returns files in filesystem order (often alphabetical by full name), but the exe uses Python's `sorted(os.listdir())` which is strict ASCII byte order. These can differ. Example: `listDirectory` showed `CernerGL_MappingTable.csv` before `CernerGLTrans_20251025.txt`, but the exe sorted `CernerGLTrans_20251025.txt` first because `T` (0x54) < `_` (0x5F). **Always apply ASCII sort manually to the `listDirectory` output — never trust its display order as the exe's order.**
- **Stuck shell after failed run**: If a mapper run selects wrong files and you need to restore from archive, use `controlPwshProcess` for the copy command too — the `executePwsh` shell will be stuck from the mapper's lingering prompt.
