const app = require('./app');
const config = require('./config/env');

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

// Handle graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', exitHandler);
process.on('SIGINT', exitHandler);
