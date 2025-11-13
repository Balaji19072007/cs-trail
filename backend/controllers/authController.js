// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stream = require('stream');
const path = require('path');
const nodemailer = require('nodemailer');

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// OTP Configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 2, // OTP expires after 2 minutes
  MAX_ATTEMPTS: 3
};

// Email Transporter Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP Email to User
 */
const sendOTPEmail = async (to, otp, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CS Studio" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Your CS Studio Verification Code',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .message {
            color: #5a6c7d;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .otp-container {
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .expiry-note {
            background: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
            text-align: center;
        }
        .expiry-note .icon {
            font-size: 20px;
            margin-right: 8px;
        }
        .security-tip {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .contact {
            color: #667eea;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CS Studio</h1>
            <p>Master Algorithms with Interactive Visual Coding</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <strong>Hello ${firstName},</strong>
            </div>
            
            <div class="message">
                Thank you for joining CS Studio! To complete your registration and start your coding journey, please use the verification code below:
            </div>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-note">
                <span class="icon">⏰</span>
                <strong>This code will expire in 2 minutes</strong> for your security.
            </div>
            
            <div class="security-tip">
                <strong>Security Tip:</strong> Never share this code with anyone. CS Studio will never ask for your verification code.
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <div class="button">Complete Registration</div>
            </div>
            
            <div class="footer">
                <div class="logo">CS Studio</div>
                <p>Transform complex algorithms into visual steps</p>
                <p>Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" class="contact">${process.env.EMAIL_USER}</a></p>
                <p style="font-size: 12px; color: #868e96; margin-top: 20px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
      text: `
CS Studio - Verification Code

Hello ${firstName},

Thank you for joining CS Studio! To complete your registration and start your coding journey, please use the verification code below:

Your Verification Code: ${otp}

⏰ This code will expire in 2 minutes for your security.

Security Tip: Never share this code with anyone. CS Studio will never ask for your verification code.

Complete your registration by entering this code on our website.

Need help? Contact us at ${process.env.EMAIL_USER}

If you didn't request this code, please ignore this email.

--
CS Studio Team
Master Algorithms with Interactive Visual Coding
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification code email sent to ${to}`);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    console.log('📧 OTPs will be logged to console only. Please check your email configuration.');
    return false;
  }
};

// Test email configuration on startup
testEmailConfig().then(success => {
  if (success) {
    console.log('📧 Email service initialized successfully');
  } else {
    console.log('❌ Email service configuration failed. OTPs will be logged to console only.');
  }
});

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

// --- Utility: Generate and Store OTP ---
const generateAndStoreOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with expiration (2 minutes)
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000,
    verified: false,
    attempts: 0,
    createdAt: Date.now()
  });

  return otp;
};

// --- Utility: Verify OTP ---
const verifyStoredOTP = (email, otp) => {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return { success: false, msg: 'Verification code not found. Please request a new one.' };
  }

  // Check if OTP expired
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(email);
    return { success: false, msg: 'Verification code has expired. Please request a new one.' };
  }

  // Check attempt limit
  if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    otpStore.delete(email);
    return { success: false, msg: 'Too many failed attempts. Please request a new verification code.' };
  }

  // Verify OTP
  if (otpData.otp !== otp) {
    otpData.attempts += 1;
    otpStore.set(email, otpData);
    
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpData.attempts;
    return { 
      success: false, 
      msg: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.` 
    };
  }

  // Mark OTP as verified
  otpData.verified = true;
  otpStore.set(email, otpData);

  return { success: true, msg: 'Verification code verified successfully' };
};

// --- Utility: Clean expired OTPs ---
const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, otpData] of otpStore.entries()) {
    if (now > otpData.expiresAt) {
      otpStore.delete(email);
    }
  }
};

/**
 * @desc    Send verification code for Email Verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email address' });
    }

    // Check if user already exists (for signup flow)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Clean expired OTPs before generating new one
    cleanExpiredOTPs();

    // Generate and store OTP
    const otp = generateAndStoreOTP(email);

    try {
      // Send OTP via email
      await sendOTPEmail(email, otp, firstName);
      
      console.log(`✅ Verification code sent to ${email}`);
      console.log(`⏰ Code expires at: ${new Date(otpStore.get(email).expiresAt).toLocaleTimeString()}`);
      
      res.json({ 
        msg: `Verification code sent successfully to ${email}. It will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
        // For development/testing only
        debugOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
      });

    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      
      // Fallback: Still return success but log OTP to console
      console.log(`📧 Verification code for ${email}: ${otp} (Email failed, using console fallback)`);
      console.log(`User details: ${firstName} ${lastName}`);
      console.log(`⏰ Code expires at: ${new Date(otpStore.get(email).expiresAt).toLocaleTimeString()}`);
      
      res.json({ 
        msg: `Verification code generated successfully. Check your email. If not received, please try again.`,
        debugOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000,
        emailFailed: true
      });
    }

  } catch (err) {
    console.error('Send verification code error:', err.message);
    res.status(500).json({ msg: 'Server error while sending verification code' });
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
      return res.status(400).json({ msg: 'Email and verification code are required' });
    }

    const result = verifyStoredOTP(email, otp);
    
    if (!result.success) {
      return res.status(400).json({ msg: result.msg });
    }

    res.json({ 
      msg: result.msg,
      verified: true
    });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ msg: 'Server error while verifying code' });
  }
};

/**
 * @desc    User Sign Up (Register User) - Now requires OTP verification
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signUpUser = async (req, res) => {
  const { firstName, lastName, email, password, otp } = req.body;

  try {
    // 1. Validation
    if (!firstName || !lastName || !email || !password || !otp) {
      return res.status(400).json({ msg: 'Please provide all required fields including verification code' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        msg: 'Password must be at least 8 characters long' 
      });
    }

    // 2. Verify OTP before proceeding
    const otpVerification = verifyStoredOTP(email, otp);
    if (!otpVerification.success) {
      return res.status(400).json({ msg: otpVerification.msg });
    }

    // 3. Check if user already exists (additional safety check)
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // 4. Generate username
    const baseUsername = generateUsername(firstName, lastName);
    let username = baseUsername;
    let counter = 1;

    // Ensure username is unique
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      photoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
    });

    await newUser.save();

    // 7. Clean up OTP after successful registration
    otpStore.delete(email);

    // 8. Create and send JWT
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