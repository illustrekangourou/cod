import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve static files from the public directory
router.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// API info endpoint
router.get('/api', (req, res) => {
    res.json({ message: 'Chess of Doom API' });
});

export default router;