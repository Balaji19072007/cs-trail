// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stream = require('stream'); // Added for file upload streaming
const path = require('path'); // Added for utility functions

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// --- Utility: Generates a username from name parts ---
const generateUsername = (firstName, lastName) => {
  return `${firstName}${lastName}`.replace(/\s/g, '').toLowerCase();
};

// --- Utility: Validate Email Format ---
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- Utility: Validate Password Strength ---
const isStrongPassword = (password) => {
  return password.length >= 8;
};

/**
 * @desc    User Sign In (Authenticate User)
 * @route   POST /api/auth/signin
 * @access  Public
 */
exports.signInUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    // 2. Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 3. Compare submitted password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 4. Create and send JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          photoUrl: user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
        });
      }
    );
  } catch (err) {
    console.error('Sign in error:', err.message);
    res.status(500).json({ msg: 'Server error during sign in' });
  }
};

/**
 * @desc    User Sign Up (Register User)
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signUpUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // 1. Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        msg: 'Password must be at least 8 characters long' 
      });
    }

    // 2. Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // 3. Generate username
    const baseUsername = generateUsername(firstName, lastName);
    let username = baseUsername;
    let counter = 1;

    // Ensure username is unique
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new user with only fields that exist in User model
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      photoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
      // Removed: score, problemsSolved, rank (not in User model)
    });

    await newUser.save();

    // 6. Create and send JWT
    const payload = {
      user: {
        id: newUser.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          userId: newUser.id,
          name: `${newUser.firstName} ${newUser.lastName}`,
          email: newUser.email,
          photoUrl: newUser.photoUrl
        });
      }
    );
  } catch (err) {
    console.error('Sign up error:', err.message);
    res.status(500).json({ msg: 'Server error during sign up' });
  }
};

/**
 * @desc    Send OTP for Email Verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email address' });
    }

    // Check if user already exists (for signup flow)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // TODO: Implement actual email sending
    console.log(`📧 OTP for ${email}: ${otp}`);

    res.json({ 
      msg: 'OTP sent successfully',
      // For development/testing only
      debugOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ msg: 'Server error while sending OTP' });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }

    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ msg: 'OTP not found or expired' });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ msg: 'OTP expired' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // OTP verified successfully - remove from storage
    otpStore.delete(email);

    res.json({ msg: 'OTP verified successfully' });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ msg: 'Server error while verifying OTP' });
  }
};

/**
 * @desc    Get Current User
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
      totalPoints: user.totalPoints,
      currentStreak: user.currentStreak,
      role: user.role
    });
  } catch (err) {
    console.error('Get current user error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * @desc    Update User Profile (Handles text fields and file upload to Cloudinary)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  // Fields sent from the frontend (via req.body, even if FormData is used)
  const { firstName, lastName, bio } = req.body;
  const file = req.file; // File data from multer (only present if an image was sent)
  
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // --- 1. Handle Text Fields (First Name, Last Name, Bio) ---
    // Check for undefined because firstName/lastName can be sent even without change
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    // Note: Bio can be an empty string, so we check for undefined
    if (bio !== undefined) user.bio = bio; 
    
    // --- 2. Handle Profile Picture Upload (if file is present) ---
    if (file) {
        const cloudinary = req.app.get('cloudinary');
        if (!cloudinary) {
            throw new Error('Cloudinary configuration missing on server.');
        }

        // We use an Upload Stream to send the buffer directly to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                // Set up the writable stream to pipe the buffer into
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);

                const cld_upload_stream = cloudinary.uploader.upload_stream(
                    {
                        // Use the user's ID as the folder and a unique name
                        folder: `cs_studio_profiles/${user.id}`,
                        public_id: `profile_${Date.now()}`,
                        tags: ['profile_picture', user.username],
                        resource_type: 'image',
                        quality: "auto:good", // Auto-optimize image quality
                        fetch_format: "auto"    // Auto-optimize image format
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            reject(new Error('Failed to upload image to storage.'));
                        } else {
                            resolve(result);
                        }
                    }
                );

                bufferStream.pipe(cld_upload_stream);
            });
        };
        
        const result = await uploadStream();
        
        // Update the user's photoUrl with the secure URL from Cloudinary
        user.photoUrl = result.secure_url;
    }

    // --- 3. Save User to MongoDB and Respond ---
    // Update the combined name field if necessary (not explicitly in schema, but good practice)
    user.name = `${user.firstName} ${user.lastName}`.trim();

    // Since username and email are not exposed in Settings.jsx, we skip the logic 
    // to check if they are taken, allowing the rest of the profile update to proceed.
    
    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(), 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        photoUrl: user.photoUrl,
        bio: user.bio 
      },
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error during profile update' });
  }
};