const basicAuth = require('basic-auth');
const User = require('../models/User');
const { writeToCloudLogging, writeToLogFile } = require('../logger');


const authenticateUser = async (req, res, next) => {
  try {
    const credentials = basicAuth(req);
    if (!credentials || !credentials.name || !credentials.pass) {
      writeToLogFile('error','Unauthorized: Missing credentials'); // Log error for missing credentials
      writeToCloudLogging('error', 'Unauthorized: Missing credentials'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: Missing credentials' });
    }

    // Find user by username
    const user = await User.findOne({ where: { username: credentials.name } });
    if (!user) {
      writeToLogFile('error','Unauthorized: User not found'); // Log error for user not found
      writeToCloudLogging('error', 'Unauthorized: User not found'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check if password is correct
    const isPasswordValid = await user.validPWD(credentials.pass);
    if (!isPasswordValid) {
      writeToLogFile('error','Unauthorized: Incorrect password'); // Log error for incorrect password
      writeToCloudLogging('error', 'Unauthorized: Incorrect password'); // Log to Google Cloud Logging
      return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    // Set req.user with user information
    req.user = {
      id: user.id,
      username: user.username,
    };

    // Log successful authentication
    writeToLogFile('info',`User ${user.username} authenticated successfully`);
    writeToCloudLogging('info', `User ${user.username} authenticated successfully`); // Log to Google Cloud Logging

    next();
  } catch (error) {
    writeToLogFile('error',{ message: 'Authentication error', error }); // Log authentication error with stack trace
    writeToCloudLogging('error', { message: 'Authentication error', error }); // Log to Google Cloud Logging
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = authenticateUser;
