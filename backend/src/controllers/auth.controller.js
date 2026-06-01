import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    // DEBUG: Log incoming request body
    console.log('Request Body:', req.body);

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    console.log("STEP 1 - Validation passed");
    console.log("STEP 2 - Checking existing user");

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    console.log("STEP 3 - Creating user document");

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
    });

    console.log("STEP 4 - Saving user");

    await user.save();

    console.log("STEP 5 - User saved successfully");

    console.log("STEP 6 - Generating token");

    // Generate JWT token
    const token = generateToken(user._id);

    console.log("STEP 7 - Token generated");

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password field (normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

/**
 * Get current user profile (protected route)
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      endpoint: "PROFILE_ENDPOINT",
      message: "Profile endpoint reached successfully",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

/**
 * Logout user (stateless - JWT based)
 * POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  try {
    // Since JWT is stateless, logout is just a client-side operation
    // Client should remove the token from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
