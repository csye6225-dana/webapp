const Logger = require('node-json-logger');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { PubSub } = require('@google-cloud/pubsub');
const { Logging } = require('@google-cloud/logging');
const fs = require('fs');

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
      level: 'debug' // Set default level to debug
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

const pubsub = new PubSub();
const topicName = 'new-user-created';

const createUser = async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  // Check if required fields are missing in request body
  if (!username || !password || !firstName || !lastName) {
    fileLogger.error('Missing required fields. Please provide username, password, firstName, and lastName.'); // Log error
    writeToCloudLogging('error', 'Missing required fields. Please provide username, password, firstName, and lastName.'); // Log to Google Cloud Logging
    return res.status(400).json({ error: 'Missing required fields. Please provide username, password, firstName, and lastName.' });
  }
  try {
    // Create user using Sequelize model
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      fileLogger.warn(`${username} already exists. Please use another one.`); // Log warning
      writeToCloudLogging('warning', `${username} already exists. Please use another one.`); // Log to Google Cloud Logging
      return res.status(400).json({ error: 'The username already exists. Please use another one.' });
    }
    const newUser = await User.createUser({ username, password, firstName, lastName });
    
    // Publish message to Pub/Sub topic
    await publishMessage(newUser);

    fileLogger.info(`User ${username} created successfully!`); // Log info
    writeToCloudLogging('info', `User ${username} created successfully!`); // Log to Google Cloud Logging
    res.status(201).json(newUser);
  } catch (error) {
    fileLogger.error({ message: 'Error creating new user', error }); // Log error with stack trace
    writeToCloudLogging('error', { message: 'Error creating new user', error }); // Log to Google Cloud Logging
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Function to publish message to Pub/Sub topic
async function publishMessage(newUser) {
  const data = JSON.stringify(newUser);
  try {
    await pubsub.topic(topicName).publish(Buffer.from(data));
    fileLogger.info(`Message published to ${topicName}: ${data}`);
    writeToCloudLogging('info', `Message published to ${topicName}: ${data}`); // Log to Google Cloud Logging
  } catch (error) {
    fileLogger.error(`Error publishing message to ${topicName}: ${error}`);
    writeToCloudLogging('error', `Error publishing message to ${topicName}: ${error}`); // Log to Google Cloud Logging
    throw error;
  }
}

const updateUser = async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'password']; // Allowed fields for update
  const receivedFields = Object.keys(req.body);
  const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    fileLogger.debug(`Invalid field(s) for update: ${invalidFields.join(', ')}`); // Log error for invalid fields
    writeToCloudLogging('debug', `Invalid field(s) for update: ${invalidFields.join(', ')}`); // Log to Google Cloud Logging
    return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
  }

  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      fileLogger.error('User not found'); // Log error for user not found
      writeToCloudLogging('error', 'User not found'); // Log to Google Cloud Logging
      return res.status(404).json({ error: 'User not found' });
    }

    // Update 
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 15);
      req.body.password = hashedPassword;
    }
    const [affectedRows] = await User.update(req.body, {
      where: { username: req.user.username }
    });

    // Check if affected 
    if (affectedRows === 0) {
      fileLogger.error('User not found'); // Log error for user not found
      writeToCloudLogging('error', 'User not found'); // Log to Google Cloud Logging
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the account_updated field
    await User.update({ account_updated: new Date() }, { where: { username: req.user.username } });
    fileLogger.info('User updated successfully'); // Log info for successful update
    writeToCloudLogging('info', 'User updated successfully'); // Log to Google Cloud Logging
    return res.status(200).json({ result: "Successfully updated"});
  } catch (error) {
    fileLogger.error({ message: 'Error updating user', error }); // Log error with stack trace
    writeToCloudLogging('error', { message: 'Error updating user', error }); // Log to Google Cloud Logging
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  if (Object.keys(req.body).length > 0) {
    fileLogger.debug('No body payload allowed'); // Log error for invalid request
    writeToCloudLogging('debug', 'No body payload allowed'); // Log to Google Cloud Logging
    return res.status(400).json({ error: 'No body payload allowed' });
  }
  try {
    // Fetch user data from the database
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      fileLogger.error('User not found'); // Log error for user not found
      writeToCloudLogging('error', 'User not found'); // Log to Google Cloud Logging
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const otherInfo = Object.assign({}, user.get());
    delete otherInfo.password;
    fileLogger.info('User fetched successfully'); // Log info for successful fetch
    writeToCloudLogging('info', 'User fetched successfully'); // Log to Google Cloud Logging
    return res.status(200).json(otherInfo);
  } catch (error) {
    fileLogger.error({ message: 'Error fetching user', error }); // Log error with stack trace
    writeToCloudLogging('error', { message: 'Error fetching user', error }); // Log to Google Cloud Logging
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
    createUser,
    updateUser,
    getUser
}
