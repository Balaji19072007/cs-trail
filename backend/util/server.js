// --- Configuration & Setup ---
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); 

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


// --- Global Middleware ---
// CORS Configuration
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Body Parser Middleware
app.use(bodyParser.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

// Security Check: Ensure MONGO_URI is available
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in the environment variables (e.g., in your .env file).');
    process.exit(1); 
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });


// --- Data Seeding (Automatic DB Initialization) ---
async function seedDatabase() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            
            const mockUsers = [
                { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.c@example.com', password: hashedPassword, username: 'sarahc', totalPoints: 5120, currentStreak: 67 },
                { firstName: 'New', lastName: 'User', email: 'test@example.com', password: hashedPassword, username: 'testuser', totalPoints: 10, currentStreak: 1 }
            ];
            await User.insertMany(mockUsers.map(u => ({
                ...u,
                username: u.username || `${u.firstName.toLowerCase()}${u.lastName.toLowerCase()}`,
            })));
            console.log('Database seeded with 2 mock users for leaderboard.');
        }

        const problemCount = await Problem.countDocuments();
        if (problemCount === 0) {
            const mockProblems = [
                { problemId: 1, title: "Two Sum", difficulty: 'Easy', language: 'JavaScript', problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", acceptanceRate: '52.3%' },
                { problemId: 2, title: "Reverse Linked List", difficulty: 'Medium', language: 'Python', problemStatement: "Given the head of a singly linked list, reverse the list, and return the reversed list.", acceptanceRate: '45.1%' },
            ];
            await Problem.insertMany(mockProblems.map(p => ({ ...p })));
            console.log('Database seeded with 2 mock problems.');
        }
        
    } catch (error) {
        console.error('Error seeding database:', error.message);
    }
}

mongoose.connection.once('open', seedDatabase);


// ----------------------------------------------------
// --- API Route Mounting ---
// ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes); 
app.use('/api/problems', problemRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ----------------------------------------------------
// --- STATIC FILE SERVING (FRONTEND) FIX ---
// This section ensures the website loads correctly on port 5000.
// ----------------------------------------------------
// Use __dirname to find the 'public' folder inside the backend directory
const frontendPath = path.join(__dirname, 'public'); 

// 1. Serve static assets (HTML, JS, CSS, images) from the public directory
app.use(express.static(frontendPath));

// 2. Handle specific HTML file requests (e.g., /settings.html)
app.get('/:page.html', (req, res) => {
    const filename = req.params.page + '.html';
    res.sendFile(path.join(frontendPath, filename), (err) => {
        if (err) {
            console.error(`Error serving file ${filename}:`, err.message);
            res.status(404).send('Page not found');
        }
    });
});

// 3. Fallback to serve index.html for the root path (http://localhost:5000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});
// ----------------------------------------------------


// --- Code Compiler Service (Socket.IO Integration) ---
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Helper function for Piston API execution (remains the same)
async function executeCode(code, language) {
    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: language,
            version: '*', 
            files: [{ content: code }]
        });
        const data = response.data;
        // The original logic for extracting execution time is complex, using a simple check for brevity/consistency
        const executionTime = data.run.stdout ? (data.run.stdout.split('\n')[0].match(/Time: (\d+\.\d+s)/)?.[1] || 'N/A') : 'N/A';
        
        if (data.run.stderr) {
            return { status: 'Runtime Error', text: data.run.stderr.trim(), executionTime: executionTime };
        } else if (data.compile && data.compile.stderr) {
            return { status: 'Compilation Error', text: data.compile.stderr.trim(), executionTime: 'N/A' };
        } else {
            return { status: 'Success', text: data.run.stdout.trim(), executionTime: executionTime };
        }

    } catch (error) {
        console.error('Piston API Execution Error:', error.message);
        return { status: 'API Error', text: `Failed to connect to compiler service. Check server logs. ${error.message}`, executionTime: 'N/A' };
    }
}


io.on('connection', (socket) => {
    socket.on('runCode', async (data) => {
        const result = await executeCode(data.code, data.language);
        socket.emit('output', result);
    });
});


// --- Server Start ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});