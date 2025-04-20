const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const db = require('./db');
const { Pool } = require('pg');

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./'));

// Configure session storage
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

app.use(session({
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'bc99_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Initialize database
db.initializeDatabase();

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Routes

// API endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.createUser(username, hashedPassword);
    
    // Set session
    req.session.userId = user.id;
    
    // Return user (without password)
    const { password: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Get user
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set session
    req.session.userId = user.id;
    
    // Return user (without password)
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await db.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user (without password)
    const { password, ...userData } = user;
    res.json(userData);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/games', async (req, res) => {
  try {
    const games = await db.getAllGames();
    res.json(games);
  } catch (err) {
    console.error('Games fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/play', isAuthenticated, async (req, res) => {
  try {
    const { gameId, betAmount } = req.body;
    const userId = req.session.userId;
    
    // Validate input
    if (!gameId || !betAmount || betAmount <= 0) {
      return res.status(400).json({ message: 'Invalid game parameters' });
    }
    
    // Get user for balance check
    const user = await db.getUserById(userId);
    if (user.balance < betAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Simple game logic - random win/loss
    // In a real app, each game would have its own logic
    const isWin = Math.random() > 0.5;
    const winAmount = isWin ? betAmount * 2 : 0;
    const balanceChange = winAmount - betAmount;
    
    // Update user balance
    const updatedUser = await db.updateUserBalance(userId, balanceChange);
    
    // Record game play
    await db.recordGamePlay(userId, gameId, betAmount, winAmount);
    
    // Return result
    res.json({
      success: true,
      isWin,
      winAmount,
      newBalance: updatedUser.balance,
      message: isWin ? 'Congratulations! You won!' : 'Better luck next time!'
    });
  } catch (err) {
    console.error('Game play error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const history = await db.getGameHistory(userId);
    res.json(history);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve the static HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});