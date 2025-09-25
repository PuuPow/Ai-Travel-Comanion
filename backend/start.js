const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Travel Planner Backend...');

// Function to start the server with restart capability
function startServer() {
  const serverPath = path.join(__dirname, 'src', 'server.js');
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: __dirname
  });

  server.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    setTimeout(() => {
      console.log('🔄 Attempting to restart server...');
      startServer();
    }, 3000);
  });

  server.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}, signal ${signal}`);
      setTimeout(() => {
        console.log('🔄 Restarting server...');
        startServer();
      }, 3000);
    }
  });

  // Handle process termination gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
  });

  return server;
}

// Start the server
startServer();