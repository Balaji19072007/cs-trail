// controllers/googleAuthController.js
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// FIX: Read CLIENT_ID from process.env instead of hardcoding
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 

// Security Check: Ensure CLIENT_ID is available
if (!CLIENT_ID) {
    console.error('FATAL ERROR: GOOGLE_CLIENT_ID is not defined in environment variables.');
}

const googleClient = new OAuth2Client(CLIENT_ID);

// Helper to generate a JWT for your application
const generateToken = (userId, email) => {
    return jwt.sign(
        { user: { id: userId, email } },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
    );
};

// ===================================================================
// Verification Function
// ===================================================================
const verifyGoogleToken = async (idToken) => {
    // This is the point where the Google Auth Library verifies the token
    const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID, // CRUCIAL: Must match your Client ID
    });
    const payload = ticket.getPayload();
    
    // Return the necessary user data, including the unique Google ID (sub)
    return {
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        email: payload['email'],
        photoUrl: payload['picture'],
        googleId: payload['sub'] 
    };
};

// ===================================================================
// New Helper: Finds a unique username (Needed for Mongoose validation)
// ===================================================================
const findUniqueUsername = async (initialUsername) => {
    // 1. Sanitize the base username
    let base = initialUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!base) base = 'guser'; 

    let username = base;
    let counter = 0;
    
    // 2. Check for uniqueness and append a number if needed
    while (await User.findOne({ username })) {
        counter++;
        username = `${base}${counter}`;
    }
    return username;
};


// @route   POST /api/auth/google
// @desc    Sign in or Sign up user using Google token
// @access  Public
exports.googleAuth = async (req, res) => {
    const { idToken } = req.body; 

    try {
        // 1. Verify Token and get user info
        const googleUser = await verifyGoogleToken(idToken);
        const { firstName, lastName, email, photoUrl, googleId } = googleUser; 
        
        // --- Username Generation Logic ---
        const namePart = `${firstName || ''}${lastName || ''}`.replace(/\s+/g, '');
        const emailPart = email.split('@')[0];
        // Use name, then email prefix, then unique Google ID as the starting point
        const initialUsername = namePart || emailPart || `user${googleId}`;
        // --- End Username Generation Logic ---


        // 2. Check if the user already exists in the database
        let user = await User.findOne({ email });

        if (user) {
            // --- SIGN IN / UPDATE (FIX IMPLEMENTED HERE) ---
            
            // CRITICAL FIX: If the existing user is missing a username, generate and save it.
            if (!user.username) {
                const username = await findUniqueUsername(initialUsername);
                user.username = username;
            }

            user.photoUrl = photoUrl; 
            user.firstName = firstName || user.firstName; 
            user.lastName = lastName || user.lastName;
            await user.save();
            
            const token = generateToken(user.id, user.email);

            return res.json({
                message: 'Signed in with Google successfully.',
                token,
                userId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                photoUrl: user.photoUrl
            });
        } else {
            // --- SIGN UP ---
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            
            // Generate a guaranteed unique username for the new user
            const username = await findUniqueUsername(initialUsername);
            
            user = new User({
                firstName,
                lastName,
                email,
                password: dummyPassword, 
                username: username, 
                photoUrl,
                googleId
            });

            await user.save();
            
            const token = generateToken(user.id, user.email);

            return res.json({
                message: 'Signed up with Google successfully.',
                token,
                userId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                photoUrl: user.photoUrl
            });
        }

    } catch (err) {
        // --- UPDATED LOGGING: THIS WILL SHOW THE SPECIFIC GOOGLE AUTH ERROR ---
        console.error('================================================');
        console.error('Google Auth Token Verification Failed:');
        console.error('Error Type (Name):', err.name); 
        console.error('Specific Error Message:', err.message); 
        console.error('Error Stack (for internal debugging):', err.stack); 
        console.error('================================================');
        
        res.status(401).json({ msg: 'Google authentication failed or token invalid. Please check Test Users or Client ID configuration.' });
    }
};