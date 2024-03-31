const Logger = require('node-json-logger');
const { Logging } = require('@google-cloud/logging');

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

const checkHealthMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    fileLogger.error(`Method Not Allowed: ${req.method}`); // Log error for Method Not Allowed
    writeToCloudLogging('error', `Method Not Allowed: ${req.method}`); // Log to Google Cloud Logging
    return res.status(404).header('Cache-Control', 'no-cache').send(); // Method Not Allowed
  }
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    fileLogger.error('Bad Request: Request contains body or parameters'); // Log error for Bad Request
    writeToCloudLogging('error', 'Bad Request: Request contains body or parameters'); // Log to Google Cloud Logging
    return res.status(400).header('Cache-Control', 'no-cache').send(); // Bad Request
  }

  // Log health check success
  fileLogger.info('Health check passed successfully');
  writeToCloudLogging('info', 'Health check passed successfully'); // Log to Google Cloud Logging
  
  next();
};
  
module.exports = checkHealthMiddleware;
