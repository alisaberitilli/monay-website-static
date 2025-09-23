// App module for testing
// This file exports the Express app instance for use in tests

import express from 'express';
import dotenv from 'dotenv';
import Bootstrap from './bootstrap';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();
app.set('port', process.env.PORT || 5000);

// Initialize with bootstrap
const bootstrap = new Bootstrap(app);

// Export app for testing
module.exports = app;
module.exports.app = app;
export default app;