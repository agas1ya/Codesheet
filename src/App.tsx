import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isConverting, setIsConverting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [theme, setTheme] = useState('vs-dark')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [minimap, setMinimap] = useState(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const detectLanguage = (codeText: string): string => {
    const trimmedCode = codeText.trim()
    
    // Simple language detection based on common patterns
    if (trimmedCode.includes('import ') && trimmedCode.includes('from ')) return 'javascript'
    if (trimmedCode.includes('def ') || trimmedCode.includes('import ')) return 'python'
    if (trimmedCode.includes('#include') || trimmedCode.includes('int main')) return 'cpp'
    if (trimmedCode.includes('public class') || trimmedCode.includes('import java')) return 'java'
    if (trimmedCode.includes('function') || trimmedCode.includes('const ') || trimmedCode.includes('let ')) return 'javascript'
    if (trimmedCode.includes('<?php')) return 'php'
    if (trimmedCode.includes('<html') || trimmedCode.includes('<div')) return 'html'
    if (trimmedCode.includes('body {') || trimmedCode.includes('.class')) return 'css'
    
    return 'plaintext'
  }

  const parseCodeToData = (codeText: string) => {
    const lines = codeText.split('\n')
    const data: (string | number)[][] = []
    
    // Add headers
    data.push(['Line', 'Code', 'Type', 'Length'])
    
    // Add each line of code with analysis
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()
      let lineType = 'code'
      
      // Analyze line type
      if (trimmedLine === '') {
        lineType = 'empty'
      } else if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('/*')) {
        lineType = 'comment'
      } else if (trimmedLine.includes('import ') || trimmedLine.includes('from ') || trimmedLine.includes('#include')) {
        lineType = 'import'
      } else if (trimmedLine.includes('function ') || trimmedLine.includes('def ') || trimmedLine.includes('class ')) {
        lineType = 'declaration'
      }
      
      data.push([lineNumber, line, lineType, line.length])
    })
    
    return data
  }

  const convertToSpreadsheet = () => {
    if (!code.trim()) {
      alert('Please enter some code to convert!')
      return
    }

    setIsConverting(true)
    
    try {
      // Parse code into data
      const data = parseCodeToData(code)
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      
      // Create main code sheet
      const codeSheet = XLSX.utils.aoa_to_sheet(data)
      
      // Set column widths for better formatting
      codeSheet['!cols'] = [
        { width: 8 },   // Line number
        { width: 80 },  // Code
        { width: 15 },  // Type
        { width: 10 }   // Length
      ]
      
      // Add conditional formatting style (basic)
      const range = XLSX.utils.decode_range(codeSheet['!ref'] || 'A1')
      for (let R = range.s.r + 1; R <= range.e.r; R++) {
        const typeCell = XLSX.utils.encode_cell({ r: R, c: 2 })
        if (codeSheet[typeCell] && codeSheet[typeCell].v === 'comment') {
          // Mark comment rows (would need more advanced styling in real implementation)
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, codeSheet, 'Code Analysis')
      
      // Create summary sheet
      const summary = [
        ['Metric', 'Value'],
        ['Total Lines', data.length - 1],
        ['Non-empty Lines', data.filter(row => row[2] !== 'empty').length - 1],
        ['Comment Lines', data.filter(row => row[2] === 'comment').length],
        ['Import Lines', data.filter(row => row[2] === 'import').length],
        ['Declaration Lines', data.filter(row => row[2] === 'declaration').length],
        ['Average Line Length', Math.round(data.slice(1).reduce((sum, row) => sum + Number(row[3]), 0) / (data.length - 1))],
        ['Detected Language', detectLanguage(code)],
        ['Generated On', new Date().toLocaleString()]
      ]
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summary)
      summarySheet['!cols'] = [{ width: 20 }, { width: 20 }]
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
      const detectedLang = detectLanguage(code)
      const filename = `code-analysis-${detectedLang}-${timestamp}.xlsx`
      
      // Write and download the file
      XLSX.writeFile(workbook, filename)
      
    } catch (error) {
      console.error('Error converting code:', error)
      alert('An error occurred while converting the code. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage)
  }

  const sampleCode = {
    javascript: `// Sample SheetJS code - Creates and downloads an Excel file
const workbook = XLSX.utils.book_new();

// Create sample data
const data = [
  ["Student Name", "Age", "Gender", "Favorite Sport"],
  ["Alice", 15, "Female", "Basketball"],
  ["Bob", 16, "Male", "Soccer"],
  ["Charlie", 15, "Male", "Tennis"],
  ["Diana", 16, "Female", "Basketball"]
];

// Create worksheet from data
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Set column widths
worksheet['!cols'] = [
  { width: 15 }, // Student Name
  { width: 8 },  // Age  
  { width: 10 }, // Gender
  { width: 15 }  // Favorite Sport
];

// Add the worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

// Add a summary sheet
const summary = [
  ["Summary Statistics", ""],
  ["Total Students", 4],
  ["Average Age", 15.5],
  ["Sports Distribution", ""],
  ["Basketball", 2],
  ["Soccer", 1], 
  ["Tennis", 1]
];

const summarySheet = XLSX.utils.aoa_to_sheet(summary);
XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

// Download the file
XLSX.writeFile(workbook, "student-data.xlsx");

console.log("Excel file created and downloaded!");`,
    python: `# Sample Python code
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

numbers = [1, 2, 3, 4, 5]
doubled = [x * 2 for x in numbers]
print(doubled)`,
    java: `// Sample Java code
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10));
    }
}`
  }

  const loadSample = () => {
    setCode(sampleCode[language as keyof typeof sampleCode] || sampleCode.javascript)
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Add custom keybindings
    editor.addAction({
      id: 'increase-font-size',
      label: 'Increase Font Size',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal],
      run: () => setFontSize(prev => Math.min(prev + 2, 24))
    })
    
    editor.addAction({
      id: 'decrease-font-size', 
      label: 'Decrease Font Size',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus],
      run: () => setFontSize(prev => Math.max(prev - 2, 10))
    })
    
    editor.addAction({
      id: 'toggle-word-wrap',
      label: 'Toggle Word Wrap',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      run: () => setWordWrap(prev => !prev)
    })
  }

  const resetEditor = () => {
    setCode('')
    setFontSize(14)
    setWordWrap(true)
    setMinimap(false)
    setExecutionResult(null)
  }

  const executeCode = () => {
    if (!code.trim()) {
      alert('Please enter some code to execute!')
      return
    }

    if (language !== 'javascript') {
      alert('Code execution is only supported for JavaScript/SheetJS code!')
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      // Create a safe execution context with XLSX available
      const safeContext = {
        XLSX: XLSX,
        console: {
          log: (...args: unknown[]) => {
            const message = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
            setExecutionResult(prev => (prev ? prev + '\n' + message : message))
          }
        },
        alert: (message: string) => {
          setExecutionResult(prev => (prev ? prev + '\nAlert: ' + message : 'Alert: ' + message))
        }
      }

      // Execute the code in the safe context
      const func = new Function(...Object.keys(safeContext), code)
      const result = func(...Object.values(safeContext))
      
      if (result !== undefined) {
        const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
        setExecutionResult(prev => (prev ? prev + '\nResult: ' + resultStr : 'Result: ' + resultStr))
      } else if (!executionResult) {
        setExecutionResult('Code executed successfully!')
      }

    } catch (error) {
      setExecutionResult(`Error: ${(error as Error).message}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Code to Spreadsheet Converter</h1>
        <p>Paste your code below and convert it to a downloadable Excel file with analysis</p>
      </header>
      
      <main className="app-main">
        <div className="controls">
          <div className="language-selector">
            <label htmlFor="language">Language:</label>
            <select 
              id="language"
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="plaintext">Plain Text</option>
            </select>
          </div>
          <div className="editor-controls">
            <button className="control-button" onClick={loadSample} title="Load sample code">
              📝 Load Sample
            </button>
            <button className="control-button" onClick={resetEditor} title="Clear editor">
              🗑️ Clear
            </button>
            {language === 'javascript' && (
              <button 
                className="control-button execute-button" 
                onClick={executeCode} 
                title="Execute JavaScript/SheetJS code"
                disabled={isExecuting}
              >
                {isExecuting ? '⏳ Running...' : '▶️ Execute'}
              </button>
            )}
          </div>
        </div>
        
        <div className="editor-settings">
          <div className="setting-group">
            <label htmlFor="theme">Theme:</label>
            <select 
              id="theme"
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="vs-dark">Dark</option>
              <option value="vs">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label htmlFor="fontSize">Font Size:</label>
            <input
              id="fontSize"
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span>{fontSize}px</span>
          </div>
          
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
              Word Wrap
            </label>
          </div>
          
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
              />
              Minimap
            </label>
          </div>
        </div>
        
        <div className="editor-container">
          <div className="editor-header">
            <span className="editor-title">Code Editor</span>
            <div className="editor-info">
              <span>Lines: {code.split('\n').length}</span>
              <span>Characters: {code.length}</span>
              <span>Language: {language}</span>
            </div>
          </div>
          <Editor
            height="400px"
            language={language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: minimap },
              scrollBeyondLastLine: false,
              fontSize: fontSize,
              wordWrap: wordWrap ? 'on' : 'off',
              automaticLayout: true,
              lineNumbers: 'on',
              renderWhitespace: 'boundary',
              renderControlCharacters: true,
              autoIndent: 'advanced',
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              trimAutoWhitespace: true,
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoSurround: 'languageDefined',
              showFoldingControls: 'always',
              foldingStrategy: 'indentation',
              smoothScrolling: true,
              mouseWheelZoom: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              parameterHints: { enabled: true },
              hover: { enabled: true }
            }}
          />
        </div>
        
        {executionResult && (
          <div className="execution-result">
            <div className="result-header">
              <span className="result-title">Execution Result</span>
              <button 
                className="clear-result-button" 
                onClick={() => setExecutionResult(null)}
                title="Clear result"
              >
                ✕
              </button>
            </div>
            <pre className="result-content">{executionResult}</pre>
          </div>
        )}
        
        <div className="convert-section">
          <button 
            className="convert-button" 
            onClick={convertToSpreadsheet}
            disabled={isConverting || !code.trim()}
          >
            {isConverting ? 'Converting...' : 'Convert to Excel'}
          </button>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© 2025 Code to Spreadsheet Converter</p>
        <p>Created by Agastya Dubey</p>
        <p>All rights reserved. Your code is processed locally in your browser.</p>
      </footer>
    </div>
  )
}

export default App
