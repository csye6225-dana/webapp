const Logger = require('node-json-logger');
const { DataTypes } = require('sequelize');
const { Logging } = require('@google-cloud/logging');
const sequelize = require('../connection');
const bcrypt = require('bcrypt');

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

// Create User table
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    writeOnly: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  account_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: false
});

// Create a new user
User.createUser = async function (userData) {
  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(userData.password, 15);
    userData.password = hashedPassword;
    const newUser = await User.create(userData);

    // Log user creation info to file and Google Cloud Logging
    fileLogger.info(`User ${newUser.username} created successfully`);
    writeToCloudLogging('info', `User ${newUser.username} created successfully`);

    // Exclude write-only fields in JSON output
    const otherInfo = Object.assign({}, newUser.get());
    delete otherInfo.password;
    return otherInfo;
  } catch (error) {
    // Log error creating user with stack trace to file and Google Cloud Logging
    fileLogger.error('Error creating user:', error);
    writeToCloudLogging('error', `Error creating user: ${error.message}`);
    throw new Error('Error creating user: ' + error.message);
  }
};

// Validate a password
User.prototype.validPWD = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
