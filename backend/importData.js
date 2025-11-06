// importData.js
require('dotenv').config({ path: './.env' }); // Load .env file
const mongoose = require('mongoose');
const Problem = require('./models/Problem'); // Require the Problem model
const problems = require('./util/problemData.json');// Import the raw JSON data

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully for data operation.');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

// --- Data Operations ---

// Function to import all problem data
const importData = async () => {
    try {
        // Clear out old data first for a clean start
        await Problem.deleteMany(); 
        
        // Use insertMany for fast insertion of the entire array
        await Problem.insertMany(problems); 

        console.log('✅ Data Successfully Imported!');
        process.exit();

    } catch (error) {
        console.error('❌ Error Importing Data:', error);
        process.exit(1);
    }
};

// Function to destroy (clear) all problem data
const deleteData = async () => {
    try {
        await Problem.deleteMany();
        console.log('🗑️ Data Successfully Destroyed!');
        process.exit();

    } catch (error) {
        console.error('❌ Error Destroying Data:', error);
        process.exit(1);
    }
};

// Connect and run the desired function based on command line argument
connectDB().then(() => {
    if (process.argv[2] === '--import') {
        importData();
    } else if (process.argv[2] === '--delete') {
        deleteData();
    } else {
        console.log('Usage: node importData.js --import OR node importData.js --delete');
        process.exit();
    }
});