require('dotenv').config();
const Sequelize = require('sequelize');
const { Logging } = require('@google-cloud/logging');
const fs = require('fs');

// Initialize Google Cloud Logging client
const logging = new Logging({ keyFilename: 'credentials.json' });
const cloudLog = logging.log('myapp-log');

// Define log file path
const logFilePath = '/opt/csye6225/myapp.log';

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

// Function to write log messages to file
function writeToFile(message) {
  const logEntry = `${new Date().toISOString()} - ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, logEntry); // Append to file
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: (message) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn', // You can adjust the level based on your requirements
        message: message
      };
      console.log(JSON.stringify(logEntry)); // Log to console

      // Log to Google Cloud Logging
      writeToCloudLogging('warn', message);

      // Write to log file
      writeToFile(message);
    }
  }
);

module.exports = sequelize;
