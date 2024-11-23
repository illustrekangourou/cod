import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddleware(app) {
    // Basic security middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something broke!' });
    });
}