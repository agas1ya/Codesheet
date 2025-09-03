import { useState } from 'react'
import Editor from '@monaco-editor/react'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isConverting, setIsConverting] = useState(false)

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
    javascript: `// Sample JavaScript code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
console.log(doubled);`,
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
          <button className="sample-button" onClick={loadSample}>
            Load Sample
          </button>
        </div>
        
        <div className="editor-container">
          <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              lineNumbers: 'on',
              renderWhitespace: 'boundary',
              renderControlCharacters: true
            }}
          />
        </div>
        
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
    </div>
  )
}

export default App
