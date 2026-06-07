const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const resetCodes = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    // Default role validation
    const userRole = role === 'bank_manager' ? 'bank_manager' : 'customer';

    // Check if email already exists
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, role, created_at',
      [full_name, email, phone, hashedPassword, userRole]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.full_name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.full_name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    // req.user contains decoded token info
    const result = await db.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user registered with this email address.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code
    resetCodes.set(email, { code, expiresAt });

    // Output code to server terminal console logs
    console.log('\n==================================================');
    console.log(`[PASSWORD RESET CODE DISPATCHED]`);
    console.log(`Email: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`Expires in: 10 minutes`);
    console.log('==================================================\n');

    return res.status(200).json({
      message: 'A 6-digit verification code has been dispatched. For local development, check your terminal server console logs!'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }

    const savedRecord = resetCodes.get(email);
    if (!savedRecord) {
      return res.status(400).json({ error: 'No verification code request found for this email.' });
    }

    if (savedRecord.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (Date.now() > savedRecord.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update database
    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    // Clear record
    resetCodes.delete(email);

    return res.status(200).json({
      message: 'Password successfully updated. You may now log in with your new credentials.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
