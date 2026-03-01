# JavaScript Mapper - Technology Stack

## Programming Languages & Versions

### Primary Languages
- **JavaScript (ES5)** - Core transformation engine and UI logic
- **HTML5** - Application interface and structure
- **CSS3** - Modern styling with gradients, flexbox, and grid layouts
- **CSV** - Data format for input files and mapping configurations

### Language Standards
- **ECMAScript 5** compatibility for broad browser support
- **Vanilla JavaScript** - No external framework dependencies
- **Progressive Enhancement** - Core functionality works in all modern browsers
- **Cross-Platform** - Runs in any web browser environment

## Core Technologies

### Frontend Stack
- **Pure HTML/CSS/JavaScript** - No build process required
- **Font Awesome Icons** - Professional iconography for UI elements
- **CSS Grid & Flexbox** - Responsive layout system
- **CSS Gradients** - Modern visual design elements
- **File API** - Browser-native file reading capabilities

### Data Processing
- **Custom CSV Parser** - Handles quoted fields, escaped characters, and multiple delimiters
- **Regular Expressions** - Pattern matching for transformation functions
- **Dynamic Function Generation** - Runtime creation of mapping functions
- **JSON Processing** - Internal data structure management

### Browser APIs
- **FileReader API** - Client-side file processing
- **Blob API** - File download generation
- **URL.createObjectURL** - Dynamic file creation for downloads
- **Console API** - Debug logging and error reporting

## Build System & Dependencies

### No Build Process Required
- **Zero Dependencies** - Completely self-contained application
- **Single File Deployment** - HTML file contains all necessary code
- **No Package Manager** - No npm, yarn, or other dependency management
- **No Bundling** - Direct browser execution without compilation

### Development Environment
- **Any Text Editor** - VS Code, Sublime Text, Notepad++, etc.
- **Web Browser** - Chrome, Firefox, Safari, Edge for testing
- **Local File System** - No web server required for development
- **Version Control** - Git-friendly single-file architecture

### Deployment Requirements
- **Web Browser** - Any modern browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **File System Access** - Local file reading permissions
- **JavaScript Enabled** - Required for all functionality
- **No Server Required** - Runs entirely client-side

## Development Commands & Scripts

### No Build Commands
- **Development**: Open `JavaScript_Mapper.html` in web browser
- **Testing**: Refresh browser after code changes
- **Deployment**: Copy HTML file to target location
- **Backup**: Standard file copy operations

### File Operations
```bash
# Development workflow
1. Edit JavaScript_Mapper.html in text editor
2. Save file
3. Refresh browser tab
4. Test functionality

# Deployment workflow
1. Copy JavaScript_Mapper.html to web server
2. Ensure file permissions allow reading
3. Access via web browser
```

### Testing Approach
- **Manual Testing** - Interactive testing through web interface
- **Sample Data** - Test files in `/test/` directory
- **Browser Console** - Debug output and error monitoring
- **Cross-Browser Testing** - Verify compatibility across browsers

## Architecture Decisions

### Technology Choices
- **Vanilla JavaScript** - Maximum compatibility, no dependency management
- **Single File Architecture** - Easy deployment and distribution
- **Client-Side Processing** - No server requirements, enhanced privacy
- **ES5 Compatibility** - Broad browser support including older versions

### Performance Considerations
- **Memory Efficient** - Streaming CSV processing for large files
- **Lazy Loading** - Functions loaded only when needed
- **Minimal DOM Manipulation** - Efficient UI updates
- **Caching Strategy** - Parsed mapping rules cached during session

### Security Features
- **Client-Side Only** - No data transmitted to external servers
- **File API Restrictions** - Browser security model enforced
- **Input Validation** - Comprehensive data validation before processing
- **Safe Parsing** - Protected against malformed CSV injection

## Integration Capabilities

### IPA Integration
- **Module Exports** - Core functions available for Node.js environments
- **Standardized API** - Consistent function signatures for automation
- **Error Handling** - Structured error responses for system integration
- **Batch Processing** - Efficient handling of large datasets

### External System Integration
- **CSV Input/Output** - Standard data exchange format
- **JavaScript Generation** - Standalone functions for other applications
- **REST API Ready** - Functions can be wrapped in web services
- **Command Line Compatible** - Core functions work in Node.js CLI tools

### Data Format Support
- **Input Formats**: CSV, TXT, pipe-delimited, tab-delimited, custom delimiters
- **Output Formats**: CSV, JavaScript functions, JSON data structures
- **Encoding Support**: UTF-8, ASCII, Windows-1252
- **Special Characters**: Proper handling of quotes, commas, line breaks