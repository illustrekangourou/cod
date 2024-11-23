import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { exec } from 'child_process';
import { watch } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build the client
async function buildClient() {
  return new Promise((resolve, reject) => {
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error}`);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
}

// Create development server
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    switch (url.pathname) {
      case '/':
        const html = await readFile(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        break;

      case '/dist/bundle.js':
        const js = await readFile(path.join(__dirname, '..', 'public', 'dist', 'bundle.js'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(js);
        break;

      default:
        res.writeHead(404);
        res.end('Not found');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Internal server error');
  }
});

// Watch for file changes and rebuild
watch(path.join(__dirname, '..', 'src'), { recursive: true }, async (eventType, filename) => {
  if (filename) {
    console.log(`File ${filename} changed. Rebuilding...`);
    await buildClient();
  }
});

// Initial build
await buildClient();

// Start development server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
});