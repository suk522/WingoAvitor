// Database connection and queries
import pg from 'pg';
const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize database with tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 1000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        image_path VARCHAR(255) NOT NULL
      )
    `);
    
    // Create game_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        game_id INTEGER REFERENCES games(id),
        bet_amount DECIMAL(10, 2) NOT NULL,
        win_amount DECIMAL(10, 2) NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample games if they don't exist
    const gamesExist = await client.query('SELECT COUNT(*) FROM games');
    if (parseInt(gamesExist.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO games (name, image_path) VALUES 
        ('BC99 Wingo', 'attached_assets/wingo.png'),
        ('BC99 Aviator', 'attached_assets/avaitor.png'),
        ('BC99 Slots', 'attached_assets/slots.png')
      `);
    }
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// User operations
async function createUser(username, password) {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, password]
  );
  return result.rows[0];
}

async function getUserByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateUserBalance(userId, amount) {
  const result = await pool.query(
    'UPDATE users SET balance = balance + $2 WHERE id = $1 RETURNING *',
    [userId, amount]
  );
  return result.rows[0];
}

// Game operations
async function getAllGames() {
  const result = await pool.query('SELECT * FROM games');
  return result.rows;
}

async function recordGamePlay(userId, gameId, betAmount, winAmount) {
  const result = await pool.query(
    'INSERT INTO game_history (user_id, game_id, bet_amount, win_amount) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, gameId, betAmount, winAmount]
  );
  return result.rows[0];
}

async function getGameHistory(userId) {
  const result = await pool.query(
    `SELECT gh.*, g.name as game_name
     FROM game_history gh
     JOIN games g ON gh.game_id = g.id
     WHERE gh.user_id = $1
     ORDER BY gh.played_at DESC
     LIMIT 20`,
    [userId]
  );
  return result.rows;
}

export {
  initializeDatabase,
  createUser,
  getUserByUsername,
  getUserById,
  updateUserBalance,
  getAllGames,
  recordGamePlay,
  getGameHistory
};