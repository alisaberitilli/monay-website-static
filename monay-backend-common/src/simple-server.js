import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'alisaberi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'monay',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3007'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'monay-secret-key-2025';

// Health check
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: 'ok',
    service: 'monay-backend',
    port,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }, null, 2));
});

// Organizations endpoints
app.get('/api/organizations', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT id, name, type, industry, status, kyc_status, compliance_score,
             wallet_type, feature_tier, email, phone, created_at
      FROM organizations
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations'
    });
  }
});

app.post('/api/organizations', verifyToken, async (req, res) => {
  try {
    const {
      name,
      type,
      industry,
      description,
      email,
      phone,
      address,
      website,
      tax_id,
      wallet_type = 'enterprise',
      feature_tier = 'basic'
    } = req.body;

    const query = `
      INSERT INTO organizations (
        name, type, industry, description, email, phone, address, website,
        tax_id, wallet_type, feature_tier, status, kyc_status, compliance_score,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        'active', 'pending', 75, NOW(), NOW()
      ) RETURNING *
    `;

    const params = [
      name, type, industry, description, email, phone, address, website,
      tax_id, wallet_type, feature_tier
    ];

    const result = await pool.query(query, params);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization'
    });
  }
});

// Check auth status endpoint
app.get('/api/auth/check', verifyTokenOptional, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query user from database
    const query = `
      SELECT id, email, username, password_hash, first_name, last_name,
             auth_level, is_active, is_verified, kyc_verified
      FROM users
      WHERE email = $1 AND is_active = true
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        auth_level: user.auth_level
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      authLevel: user.auth_level,
      isVerified: user.is_verified,
      kycVerified: user.kyc_verified
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token,
      expiresIn: 86400,
      data: {
        user: userData,
        token,
        expiresIn: 86400
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User login endpoint (for other dashboards)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('User login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query user from database
    const query = `
      SELECT id, email, username, password_hash, first_name, last_name,
             auth_level, is_active, is_verified, kyc_verified
      FROM users
      WHERE email = $1 AND is_active = true
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        auth_level: user.auth_level
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      authLevel: user.auth_level,
      isVerified: user.is_verified,
      kycVerified: user.kyc_verified
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token,
      expiresIn: 86400
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user endpoint
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, email, username, first_name, last_name,
             auth_level, is_active, is_verified, kyc_verified,
             created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        authLevel: user.auth_level,
        isVerified: user.is_verified,
        kycVerified: user.kyc_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Protected route example (requires authentication)
app.get('/api/admin/dashboard', verifyToken, async (req, res) => {
  try {
    // Get dashboard stats
    const stats = {
      totalUsers: 0,
      totalTransactions: 0,
      totalVolume: 0,
      activeWallets: 0
    };

    // Get user count
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    stats.totalUsers = parseInt(userCount.rows[0].count);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Middleware to verify JWT token (required)
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = decoded;
    next();
  });
}

// Middleware to verify JWT token (optional)
function verifyTokenOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple Monay Backend Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
  console.log(`🔐 Admin login: http://localhost:${port}/api/admin/login`);
  console.log(`🔐 User login: http://localhost:${port}/api/login`);
  console.log(`📊 Dashboard: http://localhost:${port}/api/admin/dashboard`);
  console.log(`\n✅ CORS enabled for ports: 3000, 3002, 3003, 3007`);
});