# JavaScript Mapper - Project Structure

## Directory Organization

### Root Level Files
- **`JavaScript_Mapper.html`** - Main application interface with tabbed navigation and AI-powered features
- **`mapper-core.js`** - Core transformation engine for IPA integration and dynamic processing
- **`CernerGL_MappingTable.csv`** - Cerner General Ledger mapping configuration
- **`CernerGLTrans_20251025.txt`** - Sample Cerner GL transaction data
- **`presentation input file.txt`** - Demo input file for presentations
- **`presentation mapping file.csv`** - Demo mapping configuration

### Core Directories

#### `/docs/` - Comprehensive Documentation
- **`README.md`** - Main project documentation with quick start guide
- **`api-reference.md`** - Function reference and API documentation
- **`mapping-configuration.md`** - Mapping table configuration guide
- **`ui-components.md`** - User interface component documentation
- **`troubleshooting.md`** - Common issues and solutions
- **`hackathon-presentation.md`** - Presentation materials and demos
- **`ipa-integration.md`** - IPA integration patterns and examples
- **`pdf-to-mapping-guide.md`** - Guide for converting PDF specs to mappings

#### `/test/` - Test Data and Validation
- **`Cerner_GL_*.csv`** - Cerner General Ledger test datasets
- **`CernerGL_Mapping.csv`** - Test mapping configurations
- **`CernerGL_Mapping.pdf`** - PDF specification for mapping rules
- **`mapping_table.csv`** - Generic test mapping table
- **`test_mapping_commands.html`** - Interactive test interface

#### `/archive/` - Legacy and Backup Files
- **`JavaScript_Mapper_*.html`** - Previous versions and backups
- **`mapping_generator*.html`** - Legacy mapping generator interfaces
- **`*_Examples.csv`** - Historical example files and test data
- **`input.csv`** - Legacy input data samples

#### `/ANA050/` - Project-Specific Files
- **`*.docx`** - Analysis and design specifications for Aultman Health projects
- **`Test*.csv`** - Project-specific test datasets
- **Field mapping documentation and specifications

#### `/.amazonq/rules/memory-bank/` - AI Assistant Memory
- **`product.md`** - Product overview and capabilities
- **`structure.md`** - Project organization (this file)
- **`tech.md`** - Technology stack and dependencies
- **`guidelines.md`** - Development patterns and standards

## Core Components & Relationships

### Application Architecture
```
JavaScript_Mapper.html (UI Layer)
├── Tabbed Interface
│   ├── JS Generator Tab (Primary)
│   ├── Mapping Table Converter Tab
│   └── Reference Tab (Function Library)
├── File Processing Engine
├── Preview System
└── Download Manager

mapper-core.js (Processing Engine)
├── CSV Parser
├── Transformation Functions (25+)
├── Dynamic Mapper Generator
├── Validation System
└── IPA Integration Layer
```

### Data Flow Architecture
1. **Input Layer**: File selection and validation
2. **Configuration Layer**: Mapping table processing and rule parsing
3. **Transformation Layer**: Dynamic function generation and data processing
4. **Validation Layer**: Error checking and data quality validation
5. **Output Layer**: JavaScript code generation and CSV output creation

### Integration Patterns
- **Standalone Mode**: Self-contained HTML application
- **IPA Integration**: Core functions exported for automation systems
- **Dynamic Processing**: Runtime mapping table interpretation
- **Static Generation**: Pre-compiled transformation functions

## Architectural Patterns

### Modular Design
- **Separation of Concerns**: UI, processing, and validation are distinct layers
- **Function Library**: Reusable transformation functions with consistent interfaces
- **Configuration-Driven**: Mapping rules define behavior without code changes
- **Plugin Architecture**: Easy addition of new transformation functions

### Data Processing Pipeline
1. **File Ingestion**: Multi-format file reading with delimiter detection
2. **Mapping Interpretation**: CSV mapping table parsing and rule extraction
3. **Dynamic Code Generation**: Runtime creation of transformation functions
4. **Batch Processing**: Row-by-row data transformation with error handling
5. **Output Generation**: Formatted CSV creation with proper escaping

### Error Handling Strategy
- **Validation Gates**: Multiple validation points throughout the pipeline
- **Graceful Degradation**: Partial processing with error reporting
- **User Feedback**: Clear error messages with actionable guidance
- **Data Quality Checks**: Built-in validation for common data issues

### Scalability Considerations
- **Memory Efficient**: Streaming processing for large datasets
- **Modular Functions**: Independent transformation functions for parallel processing
- **Caching Strategy**: Parsed mapping rules cached for repeated use
- **Progressive Enhancement**: Core functionality works without advanced features