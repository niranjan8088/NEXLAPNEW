// server.js — GoDaddy Node.js entry point for NexLapTech
// Compatible with both GoDaddy cPanel (Phusion Passenger) and containerized/VPS runners.
const http = require('http');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

// Load Next.js from frontend dependencies
let next;
try {
  next = require(path.join(frontendDir, 'node_modules', 'next'));
} catch (e) {
  try {
    next = require('next');
  } catch (err) {
    console.error('Failed to load Next.js module. Ensure frontend dependencies are installed.', err);
    process.exit(1);
  }
}

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: frontendDir });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on port ${port} (NODE_ENV=${process.env.NODE_ENV || 'production'})`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js application:', err);
    process.exit(1);
  });
