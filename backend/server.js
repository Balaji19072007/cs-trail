const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { v2: cloudinary } = require('cloudinary'); 
const multer = require('multer');

const app = express();
const server = http.createServer(app);

// --- Model Imports ---
const User = require('./models/User');
const Problem = require('./models/Problem');

// --- Controller & Route Imports ---
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const problemRoutes = require('./routes/problemRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const statsRoutes = require('./routes/statsRoutes'); // Keep this import

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Or for all origins (less secure but works for development)
app.use(cors());
// --- Global Middleware ---

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};
app.use(cors(corsOptions));
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
})
// Body Parser Middleware
app.use(bodyParser.json());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/signin', authLimiter);
app.use('/api/auth/signup', authLimiter);

// --- CLOUDINARY & MULTER SETUP ---

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error('❌ WARNING: Cloudinary credentials are missing. Image upload will fail.');
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured successfully.');
  app.set('cloudinary', cloudinary);
}

const upload = multer({
  storage: multer.memoryStorage(), 
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
app.set('upload', upload);
// ------------------------------------

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cs-studio';

if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/google-auth', googleAuthRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/predict', predictionRoutes);
app.use('/api/stats', statsRoutes); // ✅ FIXED: Only mount once

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ===================================================================
// --- Socket.IO: MULTI-LANGUAGE EXECUTION WITH INPUT SUPPORT ---
// ===================================================================

const io = new Server(server, {
  cors: corsOptions
});

// Store execution sessions
const executionSessions = new Map();

// Helper function to clean up temp files
function cleanupTempFile(tempFile) {
  try {
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch (e) {
    console.error('Error cleaning temp file:', e.message);
  }
}

// Helper function to clean up multiple files
function cleanupFiles(files) {
  files.forEach(file => {
    if (file && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        console.error('Error cleaning file:', file, e.message);
      }
    }
  });
}

// Test GCC and G++ availability on server start
function testCompilers() {
  console.log('🔧 Testing compiler availability...');
  
  // Test GCC
  const gccTest = spawn('gcc', ['--version']);
  gccTest.stdout.on('data', (data) => {
    console.log('✅ GCC is available:', data.toString().split('\n')[0]);
  });
  gccTest.stderr.on('data', (data) => {
    console.error('❌ GCC test error:', data.toString());
  });
  gccTest.on('close', (code) => {
    console.log(`🔧 GCC test exited with code: ${code}`);
  });
  gccTest.on('error', (err) => {
    console.error('❌ GCC not found in PATH:', err.message);
  });

  // Test G++
  const gppTest = spawn('g++', ['--version']);
  gppTest.stdout.on('data', (data) => {
    console.log('✅ G++ is available:', data.toString().split('\n')[0]);
  });
  gppTest.stderr.on('data', (data) => {
    console.error('❌ G++ test error:', data.toString());
  });
  gppTest.on('close', (code) => {
    console.log(`🔧 G++ test exited with code: ${code}`);
  });
  gppTest.on('error', (err) => {
    console.error('❌ G++ not found in PATH:', err.message);
  });
}

// Call compiler test on server start
testCompilers();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Execute code with interactive input
  socket.on('execute-code', async (data) => {
    const { language, code } = data;
    
    console.log(`⚡ Executing ${language} code for socket ${socket.id}`);
    
    try {
      // Clean previous session
      if (executionSessions.has(socket.id)) {
        const oldSession = executionSessions.get(socket.id);
        if (oldSession.process) {
          oldSession.process.kill();
        }
        executionSessions.delete(socket.id);
      }

      // Create a temporary directory
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const sessionId = `${socket.id}_${Date.now()}`;

      // Validate and clean code
      const cleanedCode = code.replace(/^-\s+/gm, '');

      switch (language.toLowerCase()) {
        case 'python':
          await executePython(cleanedCode, socket, sessionId, tempDir);
          break;
        
        case 'c':
          await executeC(cleanedCode, socket, sessionId, tempDir);
          break;
        
        case 'cpp':
          await executeCpp(cleanedCode, socket, sessionId, tempDir);
          break;
        
        case 'java':
          await executeJava(cleanedCode, socket, sessionId, tempDir);
          break;
        
        case 'javascript':
          await executeJavaScript(cleanedCode, socket, sessionId, tempDir);
          break;
        
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

    } catch (error) {
      console.error('❌ Execution setup failed:', error);
      socket.emit('execution-result', {
        success: false,
        error: `Execution setup failed: ${error.message}`
      });
    }
  });

  // Handle user input
  socket.on('send-input', (input) => {
    const session = executionSessions.get(socket.id);
    if (session && session.process && session.isRunning) {
      console.log(`📥 Input received for ${socket.id} (${session.language}): "${input}"`);
      
      // Reset input expected flag
      session.inputExpected = false;
      
      // Write input to the process's STDIN with newline
      session.process.stdin.write(input + '\n');
      
    } else {
      socket.emit('execution-output', {
        output: '\n[Error: No active execution session]',
        isError: true
      });
    }
  });

  // Stop execution
  socket.on('stop-execution', () => {
    console.log(`🛑 Stopping execution for socket ${socket.id}`);
    const session = executionSessions.get(socket.id);
    if (session) {
      if (session.process) {
        session.process.kill();
      }
      cleanupFiles(session.tempFiles || []);
      executionSessions.delete(socket.id);
    }
    socket.emit('execution-result', {
      success: false,
      output: '\n[Execution stopped by user]'
    });
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    const session = executionSessions.get(socket.id);
    if (session) {
      if (session.process) {
        session.process.kill();
      }
      cleanupFiles(session.tempFiles || []);
      executionSessions.delete(socket.id);
    }
  });
});

// ===================================================================
// --- LANGUAGE EXECUTION FUNCTIONS ---
// ===================================================================

// Python Execution
function executePython(code, socket, sessionId, tempDir) {
  return new Promise((resolve) => {
    const tempFile = path.join(tempDir, `${sessionId}.py`);
    fs.writeFileSync(tempFile, code);

    const pythonProcess = spawn('python', [tempFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });

    // Store session
    executionSessions.set(socket.id, {
      process: pythonProcess,
      language: 'python',
      tempFiles: [tempFile],
      isRunning: true,
      lastOutput: '',
      inputExpected: false
    });

    socket.emit('execution-output', { output: 'Executing Python...\n' });
    setupProcessHandlers(pythonProcess, socket, [tempFile]);
    resolve();
  });
}

// C Execution - FIXED VERSION with automatic input detection
function executeC(code, socket, sessionId, tempDir) {
  return new Promise((resolve) => {
    const sourceFile = path.join(tempDir, `${sessionId}.c`);
    const executable = path.join(tempDir, `${sessionId}${process.platform === 'win32' ? '.exe' : ''}`);
    
    console.log(`🔧 Compiling C: ${sourceFile} -> ${executable}`);
    
    // Write the C code to file
    fs.writeFileSync(sourceFile, code);

    // Compile C code with basic flags
    const compileArgs = [sourceFile, '-o', executable];
    
    const compileProcess = spawn('gcc', compileArgs, {
      timeout: 15000,
      cwd: tempDir
    });

    let compileOutput = '';
    let compileError = '';

    compileProcess.stdout.on('data', (data) => {
      compileOutput += data.toString();
    });

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (exitCode) => {
      console.log(`🔧 C compilation exited with code: ${exitCode}`);
      
      if (exitCode !== 0) {
        console.error(`❌ C Compilation failed: ${compileError}`);
        socket.emit('execution-result', {
          success: false,
          error: `C Compilation failed:\n${compileError || 'Unknown compilation error'}`
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      // Check if executable was created
      if (!fs.existsSync(executable)) {
        console.error(`❌ Executable not found: ${executable}`);
        socket.emit('execution-result', {
          success: false,
          error: 'C Compilation failed: Executable was not created.'
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      console.log(`✅ C executable created: ${executable}`);

      // Make executable executable (Unix-like systems)
      if (process.platform !== 'win32') {
        try {
          fs.chmodSync(executable, 0o755);
        } catch (e) {
          console.log('⚠️ Could not set executable permissions:', e.message);
        }
      }

      // Execute compiled C program with proper input handling
      const cProcess = spawn(executable, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
        cwd: tempDir
      });

      executionSessions.set(socket.id, {
        process: cProcess,
        language: 'c',
        tempFiles: [sourceFile, executable],
        isRunning: true,
        lastOutput: '',
        inputExpected: false
      });

      socket.emit('execution-output', { output: 'Executing C...\n' });
      
      // Enhanced process handlers for C
      setupProcessHandlersForC(cProcess, socket, [sourceFile, executable]);
      resolve();
    });

    compileProcess.on('error', (err) => {
      console.error('❌ C Compiler spawn error:', err);
      socket.emit('execution-result', {
        success: false,
        error: `C Compiler error: ${err.message}\nMake sure GCC is installed and available in PATH.`
      });
      cleanupFiles([sourceFile]);
      resolve();
    });
  });
}

// C++ Execution
function executeCpp(code, socket, sessionId, tempDir) {
  return new Promise((resolve) => {
    const sourceFile = path.join(tempDir, `${sessionId}.cpp`);
    const executable = path.join(tempDir, `${sessionId}${process.platform === 'win32' ? '.exe' : ''}`);
    
    console.log(`🔧 Compiling C++: ${sourceFile} -> ${executable}`);
    
    fs.writeFileSync(sourceFile, code);

    // Compile C++ code
    const compileArgs = [sourceFile, '-o', executable];
    
    const compileProcess = spawn('g++', compileArgs, {
      timeout: 15000,
      cwd: tempDir
    });

    let compileOutput = '';
    let compileError = '';

    compileProcess.stdout.on('data', (data) => {
      compileOutput += data.toString();
    });

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (exitCode) => {
      console.log(`🔧 C++ compilation exited with code: ${exitCode}`);
      
      if (exitCode !== 0) {
        console.error(`❌ C++ Compilation failed: ${compileError}`);
        socket.emit('execution-result', {
          success: false,
          error: `C++ Compilation failed:\n${compileError || 'Unknown compilation error'}`
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      // Check if executable was created
      if (!fs.existsSync(executable)) {
        console.error(`❌ Executable not found: ${executable}`);
        socket.emit('execution-result', {
          success: false,
          error: 'C++ Compilation failed: Executable was not created.'
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      console.log(`✅ C++ executable created: ${executable}`);

      // Make executable executable (Unix-like systems)
      if (process.platform !== 'win32') {
        try {
          fs.chmodSync(executable, 0o755);
        } catch (e) {
          console.log('⚠️ Could not set executable permissions:', e.message);
        }
      }

      // Execute compiled C++ program
      const cppProcess = spawn(executable, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
        cwd: tempDir
      });

      executionSessions.set(socket.id, {
        process: cppProcess,
        language: 'cpp',
        tempFiles: [sourceFile, executable],
        isRunning: true,
        lastOutput: '',
        inputExpected: false
      });

      socket.emit('execution-output', { output: 'Executing C++...\n' });
      setupProcessHandlers(cppProcess, socket, [sourceFile, executable]);
      resolve();
    });

    compileProcess.on('error', (err) => {
      console.error('❌ C++ Compiler spawn error:', err);
      socket.emit('execution-result', {
        success: false,
        error: `C++ Compiler error: ${err.message}\nMake sure G++ is installed and available in PATH.`
      });
      cleanupFiles([sourceFile]);
      resolve();
    });
  });
}

// Java Execution
function executeJava(code, socket, sessionId, tempDir) {
  return new Promise((resolve) => {
    const sourceFile = path.join(tempDir, 'Main.java');
    
    fs.writeFileSync(sourceFile, code);

    // Compile Java code
    const compileProcess = spawn('javac', [sourceFile], {
      timeout: 10000,
      cwd: tempDir
    });

    let compileOutput = '';
    let compileError = '';

    compileProcess.stdout.on('data', (data) => {
      compileOutput += data.toString();
    });

    compileProcess.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compileProcess.on('close', (code) => {
      if (code !== 0) {
        socket.emit('execution-result', {
          success: false,
          error: `Java Compilation failed:\n${compileError || 'Unknown compilation error'}`
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      // Check if class file was created
      const classFile = path.join(tempDir, 'Main.class');
      if (!fs.existsSync(classFile)) {
        socket.emit('execution-result', {
          success: false,
          error: 'Java Compilation failed: Class file was not created'
        });
        cleanupFiles([sourceFile]);
        return resolve();
      }

      // Execute Java program
      const javaProcess = spawn('java', ['-cp', tempDir, 'Main'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 15000,
        cwd: tempDir
      });

      executionSessions.set(socket.id, {
        process: javaProcess,
        language: 'java',
        tempFiles: [sourceFile, classFile],
        isRunning: true,
        lastOutput: '',
        inputExpected: false
      });

      socket.emit('execution-output', { output: 'Executing Java...\n' });
      setupProcessHandlers(javaProcess, socket, [sourceFile, classFile]);
      resolve();
    });

    compileProcess.on('error', (err) => {
      console.error('Java Compiler spawn error:', err);
      socket.emit('execution-result', {
        success: false,
        error: `Java Compiler error: ${err.message}\nMake sure Java JDK is installed and available in PATH.`
      });
      cleanupFiles([sourceFile]);
      resolve();
    });
  });
}

// JavaScript Execution
function executeJavaScript(code, socket, sessionId, tempDir) {
  return new Promise((resolve) => {
    const tempFile = path.join(tempDir, `${sessionId}.js`);
    fs.writeFileSync(tempFile, code);

    const nodeProcess = spawn('node', [tempFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
      cwd: tempDir
    });

    executionSessions.set(socket.id, {
      process: nodeProcess,
      language: 'javascript',
      tempFiles: [tempFile],
      isRunning: true,
      lastOutput: '',
      inputExpected: false
    });

    socket.emit('execution-output', { output: 'Executing JavaScript...\n' });
    setupProcessHandlers(nodeProcess, socket, [tempFile]);
    resolve();
  });
}

// Special process handler for C with automatic input detection
function setupProcessHandlersForC(process, socket, tempFiles) {
  let outputBuffer = '';
  let inputTimeout = null;

  // Handle stdout
  process.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`📤 C Output for ${socket.id}:`, JSON.stringify(output));
    outputBuffer += output;
    
    // Send output to client
    socket.emit('execution-output', { output: output });
    
    // Check for input patterns in the accumulated output
    const session = executionSessions.get(socket.id);
    if (session) {
      session.lastOutput = outputBuffer;
      
      // Enhanced input detection for C programs without fflush
      const inputPatterns = [
        /Enter/i,
        /enter/i,
        /input/i,
        /number/i,
        /value/i,
        /:\s*$/,
        />\s*$/,
        /\?\s*$/,
        /scanf/,
        /waiting/i
      ];
      
      const hasInputPrompt = inputPatterns.some(pattern => outputBuffer.match(pattern));
      const endsWithPrompt = output.endsWith(':') || output.endsWith('?') || output.endsWith('>');
      
      if ((hasInputPrompt || endsWithPrompt) && !session.inputExpected) {
        console.log(`🔍 C Program waiting for input detected`);
        session.inputExpected = true;
        
        // Small delay to ensure the prompt is fully displayed
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          socket.emit('waiting-for-input');
        }, 100);
      }
    }
  });

  // Handle stderr
  process.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.log(`❌ C Error for ${socket.id}:`, errorOutput);
    socket.emit('execution-output', { output: errorOutput, isError: true });
  });

  // Handle process exit
  process.on('close', (code) => {
    console.log(`✅ C Process closed for socket ${socket.id} with exit code ${code}`);
    clearTimeout(inputTimeout);
    
    // Clean up temp files
    cleanupFiles(tempFiles);
    
    const success = code === 0;
    socket.emit('execution-result', {
      success: success,
      output: `\n[Program ${success ? 'completed successfully' : 'finished with exit code ' + code}]`,
      exitCode: code
    });
    
    executionSessions.delete(socket.id);
  });

  // Handle process errors
  process.on('error', (err) => {
    console.error(`❌ C Process error for ${socket.id}:`, err);
    clearTimeout(inputTimeout);
    
    // Clean up temp files
    cleanupFiles(tempFiles);

    socket.emit('execution-result', {
      success: false,
      error: `Execution error: ${err.message}`
    });
    
    executionSessions.delete(socket.id);
  });
}

// Common process handler setup
function setupProcessHandlers(process, socket, tempFiles) {
  let outputBuffer = '';
  let inputTimeout = null;

  // Handle stdout
  process.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`📤 Output for ${socket.id}:`, JSON.stringify(output));
    outputBuffer += output;
    
    socket.emit('execution-output', { output: output });
    
    const session = executionSessions.get(socket.id);
    if (session) {
      session.lastOutput = outputBuffer;
      
      // Universal input detection
      const inputPatterns = [
        /Enter/i,
        /enter/i,
        /input/i,
        /number/i,
        /value/i,
        /:\s*$/,
        />\s*$/,
        /\?\s*$/,
        /scanf/,
        /cin\s*>>/,
        /readline/,
        /prompt/i,
        /waiting/i
      ];
      
      const hasInputPrompt = inputPatterns.some(pattern => outputBuffer.match(pattern));
      const endsWithPrompt = output.endsWith(':') || output.endsWith('?') || output.endsWith('>');
      
      if ((hasInputPrompt || endsWithPrompt) && !session.inputExpected) {
        console.log(`🔍 Program waiting for input detected (${session.language})`);
        session.inputExpected = true;
        
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          socket.emit('waiting-for-input');
        }, 150);
      }
    }
  });

  // Handle stderr
  process.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.log(`❌ Error for ${socket.id}:`, errorOutput);
    socket.emit('execution-output', { output: errorOutput, isError: true });
  });

  // Handle process exit
  process.on('close', (code) => {
    console.log(`✅ Process closed for socket ${socket.id} with exit code ${code}`);
    clearTimeout(inputTimeout);
    
    cleanupFiles(tempFiles);
    
    const success = code === 0;
    socket.emit('execution-result', {
      success: success,
      output: `\n[Program ${success ? 'completed successfully' : 'finished with exit code ' + code}]`,
      exitCode: code
    });
    
    executionSessions.delete(socket.id);
  });

  process.on('error', (err) => {
    console.error(`❌ Process error for ${socket.id}:`, err);
    clearTimeout(inputTimeout);
    
    cleanupFiles(tempFiles);

    let errorMessage = `Execution error: ${err.message}`;
    if (err.code === 'ENOENT') {
      const lang = executionSessions.get(socket.id)?.language || 'program';
      errorMessage = `${lang.charAt(0).toUpperCase() + lang.slice(1)} compiler is not installed or not in PATH.`;
    }

    socket.emit('execution-result', {
      success: false,
      error: errorMessage
    });
    
    executionSessions.delete(socket.id);
  });
}

// ===================================================================
// --- STATIC FILE SERVING AND ERROR HANDLERS ---
// ===================================================================

// --- Static File Serving (for production) ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// --- Enhanced 404 Handler ---
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    msg: 'Route not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    msg: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log('🐍 Real-time Python compiler running locally');
  console.log('⚡ Real-time C compiler running locally');
  console.log('🔥 Real-time C++ compiler running locally');
  console.log('☕ Real-time Java compiler running locally');
  console.log('📜 Real-time JavaScript compiler running locally');
  console.log('💡 Make sure compilers are installed on your system!');
  console.log('✅ Stats routes registered: /api/stats/user-stats, /api/stats/rating-status, /api/stats/rating-eligibility');
});

module.exports = { app, server, io };