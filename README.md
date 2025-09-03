# Code to Spreadsheet Converter

A modern web application that converts source code into Excel spreadsheets with detailed analysis and formatting. Built with React, TypeScript, and Vite.

## Features

- **Multi-language Support**: Supports JavaScript, TypeScript, Python, Java, C++, C#, PHP, Go, Rust, HTML, CSS, SQL, and plain text
- **Code Analysis**: Automatically analyzes code structure including:
  - Line types (code, comments, imports, declarations, empty lines)
  - Line length statistics
  - Language detection
  - Code metrics and summary
- **Monaco Editor**: Professional code editor with syntax highlighting and multi-language support
- **Dual Sheet Export**: Creates two Excel sheets:
  - **Code Analysis**: Line-by-line breakdown with analysis
  - **Summary**: Overall statistics and metrics
- **Sample Code**: Built-in sample code for different programming languages
- **Modern UI**: Beautiful, responsive design with gradient backgrounds and smooth animations

## How to Use

1. **Select Language**: Choose your programming language from the dropdown
2. **Load Sample** (optional): Click "Load Sample" to see example code
3. **Paste Code**: Enter or paste your code in the Monaco editor
4. **Convert**: Click "Convert to Excel" to download the spreadsheet

## What Gets Exported

### Code Analysis Sheet
- **Line**: Line number
- **Code**: The actual code content
- **Type**: Line classification (code, comment, import, declaration, empty)
- **Length**: Character count per line

### Summary Sheet
- Total lines count
- Non-empty lines count
- Comment lines count
- Import lines count
- Declaration lines count
- Average line length
- Detected language
- Generation timestamp

## Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Dependencies

- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Monaco Editor**: VS Code editor in the browser
- **XLSX**: Excel file generation and manipulation
- **ESLint**: Code linting and quality

## Browser Compatibility

Works in all modern browsers that support ES6+ features. The Monaco Editor requires:
- Chrome/Edge 63+
- Firefox 57+
- Safari 11+

## Technologies Used

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Editor**: Monaco Editor (VS Code editor)
- **Spreadsheet**: SheetJS (xlsx)
- **Styling**: CSS3 with custom properties and gradients
- **Fonts**: Inter font family from Google Fonts

## License

MIT License - feel free to use this project for personal or commercial purposes.
