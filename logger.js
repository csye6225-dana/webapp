const { Logging } = require('@google-cloud/logging');
const Logger = require('node-json-logger');
const fs = require('fs');

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
  

  module.exports = { writeToCloudLogging, writeToLogFile };