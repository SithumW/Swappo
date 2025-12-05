// routes/auth.js

/*
import express from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register endpoint (additional to BetterAuth)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await req.prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await req.prisma.user.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        loyalty_points: 0,
        badge: 'BRONZE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        badge: true,
        loyalty_points: true
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get session info
router.get('/session', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await req.auth.api.signOut({
      headers: req.headers
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;


*/