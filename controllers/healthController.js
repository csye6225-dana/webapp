const Logger = require('node-json-logger');
const { Logging } = require('@google-cloud/logging');
const Sequelize = require('sequelize'); // Import Sequelize
const sequelize = require('../connection');

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

const checkHealth = async (req, res) => {
  try {
    // Check database connectivity
    await sequelize.authenticate();
    fileLogger.info('Database connection succeed!'); // Log info for successful connection
    writeToCloudLogging('info', 'Database connection succeed!'); // Log to Google Cloud Logging

    // Add warning if there are any sequelize warnings
    if (sequelize?.showWarnings?.length > 0) {
      fileLogger.warn(`Sequelize Warnings: ${JSON.stringify(sequelize.showWarnings)}`);
      writeToCloudLogging('warning', `Sequelize Warnings: ${JSON.stringify(sequelize.showWarnings)}`); // Log to Google Cloud Logging
    }

    res.status(200).header('Cache-Control', 'no-cache').send();
  } catch (error) {
    fileLogger.error({ message: 'Database connection error', error }); // Log error for connection error with stack trace
    writeToCloudLogging('error', { message: 'Database connection error', error }); // Log to Google Cloud Logging

    // Add warning for specific error conditions, if necessary
    if (error instanceof Sequelize.TimeoutError) {
      fileLogger.warn('Database connection timeout'); // Log warning for connection timeout
      writeToCloudLogging('warning', 'Database connection timeout'); // Log to Google Cloud Logging
    }

    res.status(503).header('Cache-Control', 'no-cache').send();
  }
};

module.exports = { checkHealth };
