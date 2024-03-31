const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const healthRouter = require('./routes/healthRouters.js');
const userRouter = require('./routes/userRouters.js');
const checkHealthMiddleware = require('./middlewares/checkHealthMiddleware');
const authenticateUser = require('./middlewares/authMiddleware.js');
const { Logging } = require('@google-cloud/logging');
const Logger = require('node-json-logger');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Define log file path
const logFilePath = '/opt/csye6225/myapp.log';

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

// Create a logger instance for file logging
const fileLogger = new Logger({
  appenders: {
    file: {
      type: 'file',
      filename: logFilePath
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'info'
    }
  }
});

// Initialize Google Cloud Logging client
const logging = new Logging({ keyFilename: 'credentials.json' });

// Create a logger instance for Google Cloud Logging
const cloudLog = logging.log('myapp-log');

// Function to write log messages to Google Cloud Logging
async function writeToCloudLogging(level, message) {
  let severity;
  switch (level) {
    case 'debug':
      severity = 'DEBUG';
      break;
    case 'info':
      severity = 'INFO';
      break;
    case 'warning':
      severity = 'WARNING';
      break;
    case 'error':
      severity = 'ERROR';
      break;
    case 'critical':
      severity = 'CRITICAL';
      break;
    default:
      severity = 'DEFAULT';
  }

  try {
    // Write log entry to Cloud Logging
    await cloudLog.write({ severity: severity, message: message });
  } catch (error) {
    console.error('Error writing to Google Cloud Logging:', error);
  }
}

// Function to write log messages to the file
function writeToLogFile(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, logEntry); // Append to file
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

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
  const errorMessage = `[ERROR] ${err.message}\n${err.stack}`;
  console.error(errorMessage); // Log error with stack trace
  writeToLogFile('error', errorMessage);
  writeToCloudLogging('error', errorMessage);
  res.status(err.status || 500).json({ error: err.message });
});

// Run the server
const server = app.listen(PORT, '0.0.0.0', async () => {
  try {
    // Bootstrap the database
    await bootstrap.sync({ alter: true });
    console.log('Bootstrap the Database successfully!!'); // Log initialization success
    writeToLogFile('info', 'Bootstrap the Database successfully!!');
    writeToCloudLogging('info', 'Bootstrap the Database successfully!!');
  } catch (error) {
    console.error(`Error initializing app: ${error.message}`); // Log initialization error
    writeToLogFile('debug', `Error initializing app: ${error.message}`);
    writeToCloudLogging('debug', `Error initializing app: ${error.message}`);
  }
  console.log(`Running on the port: ${PORT}`); // Log server startup
  writeToLogFile('info', `Running on the port: ${PORT}`);
  writeToCloudLogging('info', `Running on the port: ${PORT}`);
});
