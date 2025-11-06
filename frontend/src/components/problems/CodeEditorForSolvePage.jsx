// src/components/problems/CodeEditorForSolvePage.jsx
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { API_CONFIG } from '../../config/api.js'; 
import { sendInputToProgram, setupCompilerSocket, sendCodeForExecution, stopCodeExecution } from '../../api/problemApi.js'; // FIX: Import utilities

// --- CONFIGURATION ---
const MONACO_LANGUAGE_MAP = {
  'C': 'c', 'C++': 'cpp', 'Java': 'java', 'Python': 'python', 'JavaScript': 'javascript',
};
const EXECUTION_LANGUAGE_MAP = {
  'C': 'c', 'C++': 'cpp', 'Java': 'java', 'Python': 'python', 'JavaScript': 'javascript'
};

const DEFAULT_CODE = {
  'C': `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  
  'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  
  'Java': `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  
  'Python': `\n# Write your code here\n`,
  
  'JavaScript': `// Write your code here\nconst solution = (input) => {\n  return "Output";\n};`
};

const CodeEditorForSolvePage = forwardRef(({
    initialCode = DEFAULT_CODE['Python'],
    language: propLanguage = 'Python',
    theme: propTheme = 'vs-dark',
    onOutputReceived,
    onCodeChange,
}, ref) => {

  const [code, setCode] = useState(initialCode);
  const [language] = useState(propLanguage);
  const [theme] = useState(propTheme);

  const [isWaitingForInput, setIsWaitingForInput] = useState(false);

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const inputBufferRef = useRef('');
  // parent's console DOM node (passed via setTerminalRef)
  const consoleDomRef = useRef(null);

  // Sync props to internal state
  useEffect(() => {
    setCode(initialCode);
    // Theme and Language props are read-only here
  }, [initialCode, propTheme, propLanguage]);

  // --- Socket.IO Initialization and Listeners (FIXED) ---
  useEffect(() => {
    // FIX: Use setupCompilerSocket which now handles all listeners and disconnections
    socketRef.current = setupCompilerSocket((output, isError, isRunningState, isWaitingInput) => {
        if (isWaitingInput !== undefined) {
            setIsWaitingForInput(isWaitingInput);
        }
        if (onOutputReceived) {
            // Pass all state info (including isWaitingInput) to parent
            onOutputReceived(output, isError, isRunningState, isWaitingInput);
        }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onOutputReceived]);

  // --- Handle keyboard input when waiting for input (FIXED) ---
  useEffect(() => {
    const handleConsoleKeyPress = (e) => {
      if (!isWaitingForInput) return;
      // Ensure the active element is the console itself before processing keys
      if (!consoleDomRef.current || document.activeElement !== consoleDomRef.current) return;

      // Prevent default browser behavior for common keys
      if (['Enter', 'Backspace'].includes(e.key) || e.key.length === 1) {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        const inputToSend = inputBufferRef.current;
        
        // 1. Send the input via the problemApi helper
        sendInputToProgram(socketRef.current, inputToSend);
        
        // 2. Notify parent to append a newline after the echoed input
        if (onOutputReceived) onOutputReceived('\n', false, true);

        // 3. Reset buffer and switch state
        inputBufferRef.current = '';
        setIsWaitingForInput(false);
        return;
      }

      if (e.key === 'Backspace') {
        // Remove last char from buffer and update parent's console display
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          if (onOutputReceived) {
            // Send backspace control sequence to parent for visual removal
            onOutputReceived('\b', false, true);
          }
        }
        return;
      }

      // normal printable character
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        inputBufferRef.current += e.key;
        // Echo the character immediately to the parent's console display
        if (onOutputReceived) onOutputReceived(e.key, false, true);
      }
    };

    document.addEventListener('keydown', handleConsoleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleConsoleKeyPress);
    };
  }, [isWaitingForInput, onOutputReceived]);


  const handleRunCode = useCallback((codeToRun) => {
    if (!socketRef.current || !socketRef.current.connected) {
      if (onOutputReceived) onOutputReceived('Compiler service is disconnected. Check network.', true, false);
      return;
    }
    setIsWaitingForInput(false);
    inputBufferRef.current = '';

    const executionLanguage = EXECUTION_LANGUAGE_MAP[language] || language.toLowerCase();

    // FIX: Use imported sendCodeForExecution helper
    sendCodeForExecution(socketRef.current, codeToRun, executionLanguage);

  }, [language, onOutputReceived]);

  const handleStopExecution = useCallback(() => {
    // FIX: Use imported stopCodeExecution helper
    stopCodeExecution(socketRef.current);

    setIsWaitingForInput(false);
    inputBufferRef.current = '';
  }, []);

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (onCodeChange) onCodeChange(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    setTimeout(() => editor?.focus?.(), 50);
  };

  // --- Expose public methods via ref (FIXED) ---
  useImperativeHandle(ref, () => ({
    runCode: (c) => handleRunCode(c),
    stopCode: handleStopExecution,
    getCode: () => editorRef.current?.getValue() || code,
    // EXPOSED: Function to receive the parent's console DOM node
    setTerminalRef: (node) => { consoleDomRef.current = node; },
    getIsWaitingForInput: () => isWaitingForInput,
  }));

  const finalLanguage = language;
  const finalTheme = theme;

  return (
    <div className={`flex flex-col h-full border-none overflow-hidden`}>
      <div className={`flex-1 overflow-hidden h-full`}>
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
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false
            }
          }}
        />
      </div>
    </div>
  );
});

export default CodeEditorForSolvePage;