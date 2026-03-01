# UI Components Documentation

## Header Section

### Main Title
- **Element**: `<h2>` with AI robot icon
- **Text**: "JavaScript Mapper"
- **Badge**: "AI Powered" with brain icon
- **Purpose**: Application branding and AI feature highlight

### Gradient Divider
- **Element**: Colored horizontal bar
- **Purpose**: Visual separator between header and content

## Tab Navigation

### Tab Container
- **Tabs Available**: 3 main sections
- **Active State**: Blue highlight and border
- **Hover Effect**: Light gray background on inactive tabs

#### JS Generator Tab
- **Icon**: Code symbol (`fas fa-code`)
- **Status**: Active by default
- **Purpose**: Main functionality for creating mapping JavaScript

#### Mapping Table Converter Tab  
- **Icon**: Exchange arrows (`fas fa-exchange-alt`)
- **Status**: Work in Progress
- **Purpose**: Future feature for mapping table conversion

#### Reference Tab
- **Icon**: Book (`fas fa-book`) 
- **Purpose**: Interactive function reference and documentation

## JS Generator Content

### Input Configuration Grid

#### Row 1: File Selection
**Select Input Data File**
- **Element**: File input (`#dataFile`)
- **Accept**: `.csv,.txt` files
- **Purpose**: Choose source data file to transform
- **Icon**: File symbol

**Select Mapping CSV**
- **Element**: File input (`#mappingFile`) 
- **Accept**: `.csv` files
- **Purpose**: Choose mapping rules configuration file
- **Icon**: Sitemap symbol

**File Type**
- **Element**: Dropdown (`#fileType`)
- **Options**: 
  - Delimited (default)
  - Fixed-Length (Work in Progress)
- **Purpose**: Specify input file format type
- **Icon**: File-alt symbol

#### Row 2: Processing Options
**Delimiter** (Delimited files only)
- **Element**: Dropdown (`#delimiter`)
- **Options**: Comma, Pipe, Semicolon, Tab, Colon, Space, Tilde, Caret
- **Default**: Comma (,)
- **Purpose**: Specify field separator character
- **Icon**: Cogs symbol

**Skip Rows** (Delimited files only)
- **Element**: Number input (`#skipRows`)
- **Default**: 1
- **Min**: 0
- **Purpose**: Number of header/metadata rows to skip
- **Helper Text**: "Number of rows to skip from top"
- **Icon**: Layer-group symbol

### Fixed-Length Message
- **Element**: Warning banner (`#fixedLengthMessage`)
- **Display**: Hidden by default, shows when Fixed-Length selected
- **Content**: "Work In Progress - Fixed-Length file support is coming soon"
- **Style**: Yellow warning background with construction icon

### Action Buttons

#### Preview Files Button
- **Element**: Button (`#previewBtn`)
- **Text**: "Preview Files"
- **Icon**: Eye symbol
- **Purpose**: Load and validate both files, show previews
- **State**: Enabled when file type is Delimited

#### Reset Button  
- **Element**: Button (`#resetBtn`)
- **Text**: "Reset"
- **Icon**: Redo symbol
- **Style**: Red gradient background
- **Purpose**: Clear all inputs and outputs with animated feedback
- **Animation**: Spinning stickman figure on click

#### Stickman Animation
- **Element**: SVG figure (`#stickman`)
- **Display**: Hidden by default
- **Animation**: 2-second spin/scale animation during reset
- **Purpose**: Visual feedback for reset action

## Preview Section (`#previewSection`)

### Mapping Table Preview
- **Element**: Table (`#tablePreview`)
- **Purpose**: Display parsed mapping CSV in table format
- **Features**: Horizontal scroll, alternating row colors
- **Visibility**: Hidden until Preview Files clicked

### Input File Preview  
- **Element**: Textarea (`#inputPreview`)
- **Purpose**: Show raw content of input data file
- **Style**: Monospace font, read-only
- **Height**: 150px

### Generation Configuration

#### Generation Type
- **Element**: Dropdown (`#generationType`)
- **Options**:
  - "Runtime Flexible (requires mapping CSV)" (Dynamic mode)
  - "Self-Contained (embedded rules)" (Static mode)
- **Purpose**: Choose between dynamic or static code generation
- **Icon**: Cogs symbol

#### Generate Button
- **Element**: Button (`#generateBtn`)
- **Text**: "Generate Mapper JS + Output CSV"
- **Badge**: "Automated" with bolt icon
- **State**: Disabled until files previewed successfully
- **Purpose**: Create JavaScript mapper and transform data

## Result Section (`#resultSection`)

### Generated JavaScript Mapper
- **Element**: Textarea (`#output`)
- **Purpose**: Display generated JavaScript mapping code
- **Style**: Monospace font, read-only
- **Height**: 250px

#### Download JS Button
- **Element**: Button (`#downloadJsBtn`)
- **Text**: "Download JS File"
- **Icon**: Download symbol
- **Filename**: "mapping.js"
- **Visibility**: Hidden until code generated

### Mapped CSV Output
- **Element**: Textarea (`#mappedData`)
- **Purpose**: Show transformed data in CSV format (preview)
- **Style**: Monospace font, read-only
- **Height**: 250px

#### Download CSV Button
- **Element**: Button (`#downloadCsvBtn`)
- **Text**: "Download CSV File"  
- **Icon**: Download symbol
- **Filename**: "mapped_data.csv"
- **Visibility**: Hidden until data transformed

## Mapping Table Converter Content

### Work in Progress Message
- **Element**: Centered message box
- **Icon**: Large construction symbol (48px)
- **Title**: "Work In Progress"
- **Text**: "Mapping Table Converter functionality is coming soon"
- **Style**: Yellow warning background

## Reference Content

### Function Category Selector
- **Element**: Dropdown (`#referenceView`)
- **Options**:
  - Basic Commands
  - String Functions  
  - Math Functions
  - Conditional Logic
  - Validation Functions
  - Error Handling
- **Purpose**: Filter reference table by function type
- **Icon**: Book symbol

### Reference Table
- **Element**: Dynamic table (`#referenceTable`)
- **Columns**: Function, Description, Syntax, Example
- **Content**: Updates based on selected category
- **Style**: Professional table with alternating row colors
- **Purpose**: Interactive documentation for mapping functions

## Interactive Behaviors

### Tab Switching
- **Trigger**: Click on tab headers
- **Effect**: Show/hide corresponding content sections
- **Visual**: Active tab highlighted in blue

### File Type Toggle
- **Trigger**: Change File Type dropdown
- **Effect**: Show/hide delimiter and skip rows options
- **Fixed-Length**: Hides options, shows work-in-progress message

### File Validation
- **Trigger**: Preview Files button click
- **Validation**: Checks if selected delimiter exists in files
- **Error**: Alert if delimiter not found
- **Success**: Enables Generate button, shows preview sections

### Generation Mode
- **Static Mode**: Generates self-contained code with embedded rules
- **Dynamic Mode**: Generates universal code requiring mapping CSV at runtime
- **Usage Instructions**: Static mode includes complete usage examples in generated code

### Reset Animation
- **Trigger**: Reset button click
- **Animation**: Stickman spins and scales over 2 seconds
- **Effect**: Clears all inputs, hides sections, resets form state

## Responsive Design Features

### Grid Layout
- **Input Grid**: CSS Grid with defined column widths
- **Responsive**: Adjusts spacing and alignment
- **Breakpoints**: Optimized for desktop and mobile

### Visual Hierarchy
- **Typography**: Inter font family with weight variations
- **Colors**: Blue accent theme with gray neutrals
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle depth with box-shadow effects

### Accessibility
- **Focus States**: Blue outline on interactive elements
- **Icons**: FontAwesome icons with semantic meaning
- **Labels**: Descriptive text for all form controls
- **Contrast**: High contrast text and background colors