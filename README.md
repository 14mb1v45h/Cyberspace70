# CodeDetect - Programming Language Detection Tool

A powerful web application that automatically detects programming languages from uploaded code files and software packages.

## Features

- **Drag & Drop File Upload**: Easy file upload with visual feedback
- **Multi-File Support**: Upload individual files or ZIP archives
- **Binary Analysis**: Detects languages from compiled executables (.exe, .dll, .class)
- **Source Code Detection**: Analyzes 15+ programming languages from source files
- **Real-time Progress**: Live processing status with progress tracking
- **Language Statistics**: Visual breakdown of detected languages with percentages
- **Large File Support**: Handles files up to 100MB in size
- **Batch Processing**: Process entire software packages at once

## Supported File Types

### Source Code Files
- **Python**: .py, .pyw
- **JavaScript/TypeScript**: .js, .jsx, .ts, .tsx
- **Java**: .java
- **C/C++**: .c, .cpp, .cc, .cxx, .c++, .h, .hpp, .h++
- **C#**: .cs
- **PHP**: .php, .phtml
- **Ruby**: .rb, .rbw
- **Go**: .go
- **Rust**: .rs
- **Swift**: .swift
- **Kotlin**: .kt
- **Scala**: .scala
- **Perl**: .pl, .pm
- **R**: .r, .R
- **Shell Scripts**: .sh, .bash, .zsh, .fish
- **PowerShell**: .ps1, .psm1, .psd1
- **SQL**: .sql
- **Web Files**: .html, .htm, .css, .scss, .sass
- **Configuration**: .json, .yaml, .yml, .toml, .ini

### Binary/Compiled Files
- **Windows Executables**: .exe, .dll (detects C/C++, C#/.NET)
- **Java Bytecode**: .class files
- **Python Bytecode**: .pyc, .pyo files
- **Linux Executables**: ELF binaries

### Archive Support
- **ZIP Files**: Automatically extracts and analyzes all contained files

## How to Use

### 1. Upload Files
- **Drag and Drop**: Simply drag files or ZIP archives onto the upload area
- **Click to Browse**: Click the upload area to select files from your computer
- **Multiple Files**: You can upload multiple files at once

### 2. View Progress
The application shows real-time processing status:
- **Files Processed**: Number of files analyzed
- **Remaining**: Files still being processed
- **Overall Progress**: Percentage completion with progress bar

### 3. View Results

#### File List
- See all uploaded files with their details
- File size and upload timestamp
- Processing status (Complete/Processing/Error)
- Delete files you no longer need

#### Language Statistics
- **Pie Chart**: Visual breakdown of detected languages
- **Percentages**: Exact distribution of each language
- **File Count**: Number of files per language

#### Detection Results
For each detected language, you'll see:
- **Language Name**: Programming language identified
- **Confidence Score**: How certain the detection is (0-100%)
- **Detection Method**: How the language was identified
  - `filename_extension`: Detected from file extension
  - `content_analysis`: Analyzed code content and keywords
  - `binary_analysis`: Analyzed executable file headers
- **Keywords Found**: Specific indicators that led to detection

## Detection Methods

### 1. Filename Analysis
The quickest method - identifies languages based on file extensions:
```
example.py → Python (95% confidence)
example.js → JavaScript (90% confidence)
```

### 2. Content Analysis
Analyzes the actual code content for:
- **Keywords**: Language-specific reserved words
- **Syntax Patterns**: Code structure and formatting
- **Import Statements**: Library and module imports
- **Comments**: Comment styles specific to languages

### 3. Binary Analysis
For compiled files and executables:
- **File Headers**: Analyzes binary file signatures
- **Runtime Detection**: Identifies C/C++ runtime libraries
- **.NET Detection**: Recognizes CLR assemblies
- **JVM Bytecode**: Java class file analysis

## Use Cases

### Software Analysis
- **Audit Codebases**: Understand what languages are used in a project
- **Due Diligence**: Analyze acquired software for technology stack
- **Legacy Systems**: Identify languages in old software packages

### Development
- **Project Planning**: Understand language distribution in large projects
- **Code Review**: Quick overview of file types before detailed review
- **Documentation**: Generate language statistics for project documentation

### Education
- **Learning**: Understand how different file types are structured
- **Research**: Analyze programming language usage patterns
- **Teaching**: Demonstrate language detection techniques

## Performance

- **File Size Limit**: 100MB per file
- **Processing Speed**: 
  - Small files (< 1MB): Instant
  - Medium files (1-10MB): 1-5 seconds
  - Large files (10-100MB): 10-30 seconds
- **Concurrent Processing**: Multiple files processed simultaneously
- **Memory Efficient**: Streams large files without loading entirely into memory

## Error Handling

The application gracefully handles:
- **Unsupported Files**: Skips files that can't be analyzed
- **Corrupted Archives**: Reports extraction errors clearly
- **Large Files**: Shows progress for time-consuming operations
- **Network Issues**: Automatic retry for failed uploads

## API Endpoints

For developers who want to integrate programmatically:

```bash
# Upload files
POST /api/upload
Content-Type: multipart/form-data

# Get all files
GET /api/files

# Get language statistics
GET /api/stats/languages

# Get processing status
GET /api/stats/processing

# Delete a file
DELETE /api/files/:id
```

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: JSZip for archive handling
- **Language Detection**: Custom algorithms with binary analysis

## Tips for Best Results

1. **Upload Source Code**: For most accurate results, include source files when possible
2. **Use ZIP Archives**: For large projects, zip the entire codebase
3. **Include Documentation**: README files help provide context
4. **Mixed Projects**: The tool handles polyglot projects well
5. **Large Binaries**: Break very large files into smaller chunks if needed

## Limitations

- **Obfuscated Code**: Minified or obfuscated code may have lower confidence
- **Mixed Languages**: Files with multiple languages show the dominant one
- **Custom Extensions**: Unusual file extensions may not be recognized
- **Encrypted Archives**: Password-protected ZIP files are not supported

## Privacy & Security

- **Local Processing**: All analysis happens on the server, no external services
- **No Code Storage**: Source code content is not permanently stored
- **File Metadata Only**: Only file names, sizes, and detection results are saved
- **Automatic Cleanup**: Files can be deleted after analysis

---

**Ready to analyze your code?** Simply drag and drop your files or archives to get started!