const Logger = require('node-json-logger');
const basicAuth = require('basic-auth');
const { Logging } = require('@google-cloud/logging');
const User = require('../models/User');

// Initialize Google Cloud Logging client
const logging = new Logging({ keyFilename: 'credentials.json' });

// Create a logger instance for file logging
const fileLogger = new Logger({
  appenders: {
    file: {
      type: 'file',
      filename: '/opt/csye6225/myapp.log'
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'info'
    }
  }
});

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

const authenticateUser = async (req, res, next) => {
  try {
    const credentials = basicAuth(req);
    if (!credentials || !credentials.name || !credentials.pass) {
      fileLogger.error('Unauthorized: Missing credentials'); // Log error for missing credentials
      writeToCloudLogging('error', 'Unauthorized: Missing credentials'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: Missing credentials' });
    }

    // Find user by username
    const user = await User.findOne({ where: { username: credentials.name } });
    if (!user) {
      fileLogger.error('Unauthorized: User not found'); // Log error for user not found
      writeToCloudLogging('error', 'Unauthorized: User not found'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check if password is correct
    const isPasswordValid = await user.validPWD(credentials.pass);
    if (!isPasswordValid) {
      fileLogger.error('Unauthorized: Incorrect password'); // Log error for incorrect password
      writeToCloudLogging('error', 'Unauthorized: Incorrect password'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    // Set req.user with user information
    req.user = {
      id: user.id,
      username: user.username,
    };

    // Log successful authentication
    fileLogger.info(`User ${user.username} authenticated successfully`);
    writeToCloudLogging('info', `User ${user.username} authenticated successfully`); // Log to Google Cloud Logging

    next();
  } catch (error) {
    fileLogger.error({ message: 'Authentication error', error }); // Log authentication error with stack trace
    writeToCloudLogging('error', { message: 'Authentication error', error }); // Log to Google Cloud Logging
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = authenticateUser;
