// src/components/problems/CodeEditor.jsx
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../../config/api.js';

// --- CONFIGURATION ---
const MONACO_LANGUAGE_MAP = {
  'C': 'c', 'C++': 'cpp', 'Java': 'java', 'Python': 'python', 'JavaScript': 'javascript',
};

const SUPPORTED_LANGUAGES = ['C', 'C++', 'Java', 'Python', 'JavaScript'];

// Add execution language mapping
const EXECUTION_LANGUAGE_MAP = {
  'C': 'c',
  'C++': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'JavaScript': 'javascript'
};

const DEFAULT_CODE = {
 'C': `#include <stdio.h>\n\nint main() {\n    int number;\n    printf("Please enter a number: ");\n    fflush(stdout);  // Force output flush\n    scanf("%d", &number);\n    printf("You entered: %d\\n", number);\n    return 0;\n}`,
  
  'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    int number;\n    cout << "Enter a number: ";\n    cin >> number;\n    cout << "You entered: " << number << endl;\n    return 0;\n}`,
  
  'Java': `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter a number: ");\n        int number = scanner.nextInt();\n        System.out.println("You entered: " + number);\n        scanner.close();\n    }\n}`,
  
  'Python': `user_input = input("Enter number: ")\nprint("You entered:", user_input)`,
  
  'JavaScript': `const readline = require('readline');\n\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.question('Enter number: ', (answer) => {\n  console.log('You entered:', answer);\n  rl.close();\n});`
};

const CodeEditor = forwardRef(({ 
    initialCode = DEFAULT_CODE['Python'], 
    language: propLanguage = 'Python',
    theme: propTheme = 'vs-dark', 
    isProblemSolver = false, 
    onOutputReceived 
}, ref) => {

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(propLanguage);
  const [theme, setTheme] = useState(propTheme);
  
  // State for real-time input handling
  const [output, setOutput] = useState('Output will appear here.'); 
  const [isRunning, setIsRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [error, setError] = useState('');
  
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const terminalRef = useRef(null);
  const inputBufferRef = useRef('');
  const isInputActiveRef = useRef(false);
  
  // Sync props to internal state
  useEffect(() => {
    setCode(initialCode);
    setTheme(propTheme);
    setLanguage(propLanguage);
  }, [initialCode, propTheme]);
  
  // Update code when language changes
  useEffect(() => {
    if (!isProblemSolver) {
      setCode(DEFAULT_CODE[language] || '');
      setOutput('Output will appear here.');
      setError('');
      setIsRunning(false);
      setIsWaitingForInput(false);
      inputBufferRef.current = '';
      isInputActiveRef.current = false;
    }
  }, [language, isProblemSolver]);
  
  // --- Theme-aware classes ---
  const isDarkTheme = theme === 'vs-dark' || theme === 'hc-black';
  const toolbarBg = isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'; 
  const borderClass = isDarkTheme ? 'border-gray-700' : 'border-gray-300';
  const ioHeaderBg = isDarkTheme ? 'bg-gray-800' : 'bg-gray-200';
  const ioBodyBg = isDarkTheme ? 'bg-gray-900' : 'bg-white'; 
  
  const textMain = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  
  const outputTextClass = isDarkTheme ? 'text-green-400' : 'text-green-600';
  const errorTextClass = isDarkTheme ? 'text-red-400' : 'text-red-600';
  const inputPromptClass = isDarkTheme ? 'text-yellow-400' : 'text-yellow-600';
  // ----------------------------------------------------

  // --- Socket.IO Initialization and Listeners ---
  useEffect(() => {
    socketRef.current = io(API_CONFIG.SOCKET_URL);

    socketRef.current.on('execution-result', (result) => {
      setIsRunning(false);
      setIsWaitingForInput(false);
      isInputActiveRef.current = false;
      
      if (result.success) {
        setOutput(prev => prev + (result.output || '\n[Program completed successfully]'));
        setError('');
      } else {
        setError(result.error || 'Execution failed');
      }
    });

    // Real-time output
    socketRef.current.on('execution-output', (data) => {
      if (data.output) {
        setOutput(prev => {
          // Remove any existing "Executing..." message
          if (prev === 'Executing...\n') {
            return data.output;
          }
          return prev + data.output;
        });
      }
    });

    // Event when program is waiting for input
    socketRef.current.on('waiting-for-input', () => {
      setIsWaitingForInput(true);
      isInputActiveRef.current = true;
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onOutputReceived]);

  // Handle terminal key presses for input
  useEffect(() => {
    const handleTerminalKeyPress = (e) => {
      if (!isWaitingForInput || !terminalRef.current) return;

      // Only handle if terminal is focused
      if (document.activeElement !== terminalRef.current) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        // Send the input buffer
        if (inputBufferRef.current.trim() !== '') {
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('send-input', inputBufferRef.current);
            // Add the input to output with a newline
            setOutput(prev => prev + inputBufferRef.current + '\n');
            inputBufferRef.current = '';
            setIsWaitingForInput(false);
            isInputActiveRef.current = false;
          }
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        // Remove last character from input buffer
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          setOutput(prev => {
            // Remove the last visible character from output
            const lines = prev.split('\n');
            if (lines.length > 0) {
              const lastLine = lines[lines.length - 1];
              // Only modify if we're in active input mode
              if (isInputActiveRef.current && lastLine.length > 0) {
                lines[lines.length - 1] = lastLine.slice(0, -1);
                return lines.join('\n');
              }
            }
            return prev;
          });
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Add character to input buffer
        inputBufferRef.current += e.key;
        setOutput(prev => prev + e.key);
      }
    };

    document.addEventListener('keydown', handleTerminalKeyPress);
    return () => {
      document.removeEventListener('keydown', handleTerminalKeyPress);
    };
  }, [isWaitingForInput]);

  // Focus terminal when waiting for input
  useEffect(() => {
    if (isWaitingForInput && terminalRef.current) {
      terminalRef.current.focus();
    }
  }, [isWaitingForInput]);

  // Use proper execution language mapping
  const handleRunCode = useCallback((codeToRun) => {
    if (!socketRef.current || !socketRef.current.connected) {
        setOutput('Compiler service is disconnected. Check network.');
        return;
    }

    setIsRunning(true);
    setIsWaitingForInput(false);
    isInputActiveRef.current = false;
    setOutput('Executing...\n');
    setError('');
    inputBufferRef.current = '';
    
    // Use the correct execution language mapping
    const executionLanguage = EXECUTION_LANGUAGE_MAP[language] || language.toLowerCase();
    
    socketRef.current.emit('execute-code', {
      language: executionLanguage,
      code: codeToRun,
    });
  }, [language]);

  // Stop execution
  const handleStopExecution = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop-execution');
    }
    setIsRunning(false);
    setIsWaitingForInput(false);
    isInputActiveRef.current = false;
  }, []);

  // Expose methods to the parent component
  useImperativeHandle(ref, () => ({
      runCode: handleRunCode,
      stopCode: handleStopExecution,
      getCode: () => editorRef.current?.getValue() || code,
  }));

  // --- UI Handlers (Only active in Freeform mode) ---
  const handleInternalRunCode = () => {
    if (!isProblemSolver) {
        if (isRunning) {
            handleStopExecution();
        } else {
            handleRunCode(code);
        }
    }
  };
  
  const handleReset = () => {
    setCode(DEFAULT_CODE[language] || '');
    setOutput('Output will appear here.');
    setError('');
    setIsRunning(false);
    setIsWaitingForInput(false);
    inputBufferRef.current = '';
    isInputActiveRef.current = false;
  };
  
  const handleCopyCode = () => {
    const codeToCopy = editorRef.current?.getValue() || code;
    navigator.clipboard.writeText(codeToCopy);
  };
  
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Code will be updated automatically via useEffect
  };

  const showControls = !isProblemSolver; 
  const finalLanguage = language;
  const finalTheme = theme;

  // --- Terminal Output Rendering Logic ---
  const renderTerminalOutput = () => {
    if (error) {
        return <pre className={`${errorTextClass} font-mono text-sm whitespace-pre-wrap text-left`}>{error}</pre>;
    }
    
    let displayOutput = output;
    
    return (
      <pre className={`font-mono text-sm whitespace-pre-wrap ${outputTextClass} text-left`}>
        {displayOutput}
        {isWaitingForInput && (
          <span className={`${inputPromptClass} blink`}>█</span>
        )}
      </pre>
    );
  };

  // Handle terminal click to focus
  const handleTerminalClick = () => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  };

  return (
    <div className={`flex flex-col h-full ${ioBodyBg} ${showControls ? `rounded-lg border ${borderClass}` : 'border-none'} overflow-hidden`}>
      
      {/* Toolbar (Only visible in Freeform Playground) */}
      {showControls && (
        <div className={`flex items-center justify-between px-4 py-3 ${toolbarBg} border-b ${borderClass}`}>
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <select
              value={finalLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`px-3 py-2 ${ioBodyBg} border ${borderClass} ${textMain} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}> {lang} </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className={`px-3 py-2 ${toolbarBg} hover:${ioHeaderBg} ${textSecondary} rounded-md text-sm transition-colors border ${borderClass}`}
              title="Copy Code"
            > 📋 Copy </button>
            <button
              onClick={handleReset}
              className={`px-3 py-2 ${toolbarBg} hover:${ioHeaderBg} ${textSecondary} rounded-md text-sm transition-colors border ${borderClass}`}
              title="Reset Code"
            > 🔄 Reset </button>
            <button
              onClick={handleInternalRunCode}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? '⏹️ Stop' : '▶️ Run Code'}
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[finalLanguage]}
          theme={finalTheme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Input/Output Section */}
      {showControls && (
        <div className={`h-64 border-t ${borderClass} flex flex-col`}>
          <div className={`flex border-b ${borderClass} h-full`}>
            
            {/* Terminal View */}
            <div className="flex-1 flex flex-col">
              <div className={`px-4 py-2 ${ioHeaderBg} font-semibold text-sm ${textMain}`}>
                Terminal
                {(error || isRunning || isWaitingForInput) && (
                  <span className={`ml-2 ${
                    error ? errorTextClass : 
                    isWaitingForInput ? inputPromptClass : textSecondary
                  }`}>
                    ({error ? 'Error' : isWaitingForInput ? 'Waiting for input' : 'Live'})
                  </span>
                )}
              </div>
              <div className={`h-full flex flex-col`}>
                  
                  {/* Terminal Display - Clickable and focusable */}
                  <div 
                    ref={terminalRef}
                    tabIndex={0}
                    onClick={handleTerminalClick}
                    className={`flex-1 px-4 py-2 ${ioBodyBg} overflow-auto font-mono text-sm whitespace-pre-wrap outline-none cursor-text text-left ${
                      isWaitingForInput ? 'ring-1 ring-yellow-500' : ''
                    }`}
                    style={{ 
                      caretColor: isWaitingForInput ? (isDarkTheme ? '#fbbf24' : '#d97706') : 'transparent',
                      textAlign: 'left'
                    }}
                  >
                    {renderTerminalOutput()}
                  </div>
                  
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CodeEditor;