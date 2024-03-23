const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const healthRouter = require('./routes/healthRouters.js');
const userRouter = require('./routes/userRouters.js');
const checkHealthMiddleware = require('./middlewares/checkHealthMiddleware'); 
const authenticateUser = require('./middlewares/authMiddleware.js');
const Logger = require('node-json-logger');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT;

app.use(bodyParser.json());

// Log file path
const logFilePath = '/tmp/myapp.log';

// Check if log file exists, create it if it doesn't
if (!fs.existsSync(logFilePath)) {
  try {
    fs.writeFileSync(logFilePath, ''); // Create an empty file
    console.log('Log file created successfully');
  } catch (error) {
    console.debug('Error creating log file:', error);
    // Handle error accordingly
  }
}

// Create a logger instance
const logger = new Logger({
  appenders: {
    file: {
      type: 'file',
      filename: logFilePath,
      layout: {
        type: 'json',
        'json-layout': true, // Enable JSON layout
        timestamp: (logEvent) => {
          // Customize timestamp format
          return dateFormat(new Date(logEvent.startTime), "yyyy-mm-dd'T'HH:MM:ss.l'Z'");
        }
      }
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'info'
    }
  }
});

// Initializing 
const initializeApp = async () => {
  try {
    // Bootstrap the database
    await bootstrap.sync({ alter: true });
    logger.info('Bootstrap the Database successfully!!'); // Log initialization success
  } catch (error) {
    logger.debug(`Error initializing app: ${error.message}`); // Log initialization error
  }
};

// Attach health router with health check middleware
app.use('/healthz', checkHealthMiddleware, healthRouter);
// Attach user router
app.use('/v1/user', userRouter);
// Authentication middleware for GET and PUT request
app.use('/v1/user', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT') {
    authenticateUser(req, res, next);
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack }); // Log error with stack trace
  res.status(err.status).json({ error: err.message });
});

// Run the server
const server = app.listen(PORT, '0.0.0.0', async () => {
  try {
    await initializeApp();
    logger.info(`Running on the port: ${PORT}`); // Log server startup
  } catch (error) {
    logger.error(`Error during server startup: ${error.message}`); // Log server startup error
    process.exit(1);
  }
});
