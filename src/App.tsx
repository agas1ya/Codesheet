import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [theme, setTheme] = useState('vs-dark')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [minimap, setMinimap] = useState(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const executeCode = () => {
    if (!code.trim()) {
      alert('Please enter some code to execute!')
      return
    }

    setIsConverting(true)
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
      setIsConverting(false)
    }
  }

  const sampleCode = `// Sample SheetJS code - Creates and downloads an Excel file
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

console.log("Excel file created and downloaded!");`

  const loadSample = () => {
    setCode(sampleCode)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>SheetJS Code Executor</h1>
        <p>Write and execute JavaScript/SheetJS code in your browser</p>
      </header>
      
      <main className="app-main">
        <div className="editor-settings">
          <div className="setting-group">
            <button className="control-button" onClick={loadSample} title="Load sample code">
              📝 Load Sample
            </button>
            <button className="control-button" onClick={resetEditor} title="Clear editor">
              🗑️ Clear
            </button>
          </div>
          
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
              <span>Language: JavaScript</span>
            </div>
          </div>
          <Editor
            height="400px"
            language="javascript"
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
            onClick={executeCode}
            disabled={isConverting || !code.trim()}
          >
            {isConverting ? 'Executing...' : 'Execute Code'}
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
