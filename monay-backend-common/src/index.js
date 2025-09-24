import express from 'express';
import dotenv from 'dotenv';
import Bootstrap from './bootstrap.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
//dotenv.config();
const app = express();
app.set('port', process.env.PORT || 5000);
const bootstrap = new Bootstrap(app);
