// src/components/problems/CodeEditorForSolvePage.jsx
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../../config/api.js'; // adjust path if needed

// --- CONFIGURATION ---
const MONACO_LANGUAGE_MAP = {
  'C': 'c', 'C++': 'cpp', 'Java': 'java', 'Python': 'python', 'JavaScript': 'javascript',
};
const EXECUTION_LANGUAGE_MAP = {
  'C': 'c', 'C++': 'cpp', 'Java': 'java', 'Python': 'python', 'JavaScript': 'javascript'
};

const DEFAULT_CODE = {
  'C': `#include <stdio.h>\n\nint main() {\n    int number;\n    printf("Please enter a number: ");\n    scanf("%d", &number);\n    printf("You entered: %d\\n", number);\n    return 0;\n}`,
  'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    int number;\n    cout << "Enter a number: ";\n    cin >> number;\n    cout << "You entered: " << number << endl;\n    return 0;\n}`,
  'Java': `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter a number: ");\n        int number = scanner.nextInt();\n        System.out.println("You entered: \" + number);\n        scanner.close();\n    }\n}`,
  'Python': `user_input = input("Enter number: ")\nprint("You entered:", user_input)`,
  'JavaScript': `const readline = require('readline');\n\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.question('Enter number: ', (answer) => {\n  console.log('You entered:', answer);\n  rl.close();\n});`
};

const CodeEditorForSolvePage = forwardRef(({
    initialCode = DEFAULT_CODE['Python'],
    language: propLanguage = 'Python',
    theme: propTheme = 'vs-dark',
    onOutputReceived,
    onCodeChange,
}, ref) => {

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(propLanguage);
  const [theme, setTheme] = useState(propTheme);

  const [isWaitingForInput, setIsWaitingForInput] = useState(false);

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const inputBufferRef = useRef('');
  // parent's console DOM node (passed via setTerminalRef)
  const consoleDomRef = useRef(null);

  // Sync props to internal state
  useEffect(() => {
    setCode(initialCode);
    setTheme(propTheme);
    setLanguage(propLanguage);
  }, [initialCode, propTheme, propLanguage]);

  // --- Socket.IO Initialization and Listeners ---
  useEffect(() => {
    socketRef.current = io(API_CONFIG.SOCKET_URL);

    socketRef.current.on('execution-result', (result) => {
      if (onOutputReceived) {
          onOutputReceived(
              result.success ? (result.output || 'Execution finished.') : (result.error || 'Execution failed'),
              !result.success,
              false // isRunning = false
          );
      }
      setIsWaitingForInput(false);
    });

    socketRef.current.on('execution-output', (data) => {
      if (onOutputReceived && data.output) {
          const output = data.output;
          // avoid showing user-echoed input (we handle that locally)
          if (!inputBufferRef.current || !output.includes(inputBufferRef.current)) {
              onOutputReceived(output, false, true);
          }
      }
    });

    socketRef.current.on('waiting-for-input', () => {
      setIsWaitingForInput(true);
      // focus the console DOM node when waiting for input
      setTimeout(() => consoleDomRef.current?.focus?.(), 0);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onOutputReceived]);

  // Handle keyboard input when waiting for input (fixed backspace handling)
  useEffect(() => {
    const handleTerminalKeyPress = (e) => {
      if (!isWaitingForInput) return;
      if (!consoleDomRef.current || document.activeElement !== consoleDomRef.current) return;

      // prevent default so Backspace / Enter don't navigate/back
      if (['Enter', 'Backspace'].includes(e.key) || e.key.length === 1) {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        const inputToSend = inputBufferRef.current;
        if (onOutputReceived) onOutputReceived('\n', false, true); // newline echo

        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('send-input', inputToSend);
        }
        // append newline in parent's console via callback
        if (onOutputReceived) onOutputReceived(inputToSend + '\n', false, true);

        // reset buffer and state
        inputBufferRef.current = '';
        setIsWaitingForInput(false);
        return;
      }

      if (e.key === 'Backspace') {
        // remove last char from buffer and update parent's console display
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          if (onOutputReceived) {
            // Send control sequence back to parent: remove last char visually
            // parent should handle \b in its output processor; we also provide full buffer
            onOutputReceived('\b', false, true);
          }
        }
        return;
      }

      // normal printable character
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        inputBufferRef.current += e.key;
        if (onOutputReceived) onOutputReceived(e.key, false, true);
      }
    };

    document.addEventListener('keydown', handleTerminalKeyPress);
    return () => {
      document.removeEventListener('keydown', handleTerminalKeyPress);
    };
  }, [isWaitingForInput, onOutputReceived]);

  // auto-focus console when waiting for input
  useEffect(() => {
    if (isWaitingForInput) {
      setTimeout(() => consoleDomRef.current?.focus?.(), 0);
    }
  }, [isWaitingForInput]);

  const handleRunCode = useCallback((codeToRun, userInput) => {
    if (!socketRef.current || !socketRef.current.connected) {
      if (onOutputReceived) onOutputReceived('Compiler service is disconnected. Check network.', true, false);
      return;
    }
    setIsWaitingForInput(false);
    inputBufferRef.current = '';
    if (onOutputReceived) onOutputReceived('Executing.\n', false, true);

    const executionLanguage = EXECUTION_LANGUAGE_MAP[language] || language.toLowerCase();

    socketRef.current.emit('execute-code', {
      language: executionLanguage,
      code: codeToRun,
      userInput: userInput || '',
    });
  }, [language, onOutputReceived]);

  const handleStopExecution = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop-execution');
    }
    setIsWaitingForInput(false);
    inputBufferRef.current = '';
  }, []);

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (onCodeChange) onCodeChange(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // keep focus on mount for quick editing
    setTimeout(() => editor?.focus?.(), 50);
  };

  useImperativeHandle(ref, () => ({
    runCode: (c, userInput) => handleRunCode(c, userInput),
    stopCode: handleStopExecution,
    getCode: () => editorRef.current?.getValue() || code,
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
