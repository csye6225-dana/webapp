const Logger = require('node-json-logger');
const basicAuth = require('basic-auth');
const User = require('../models/User');

// Create a logger instance
const logger = new Logger({
  appenders: {
    file: {
      type: 'file',
      filename: '/tmp/myapp.log'
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'info'
    }
  }
});

const authenticateUser = async (req, res, next) => {
  try {
    const credentials = basicAuth(req);
    if (!credentials || !credentials.name || !credentials.pass) {
      logger.error('Unauthorized: Missing credentials'); // Log error for missing credentials
      return res.status(401).json({ error: 'Unauthorized: Missing credentials' });
    }

    // Find user by username
    const user = await User.findOne({ where: { username: credentials.name } });
    if (!user) {
      logger.error('Unauthorized: User not found'); // Log error for user not found
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check if password is correct
    const isPasswordValid = await user.validPWD(credentials.pass);
    if (!isPasswordValid) {
      logger.error('Unauthorized: Incorrect password'); // Log error for incorrect password
      return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    // Set req.user with user information
    req.user = {
      id: user.id,
      username: user.username,
    };

    // Log successful authentication
    logger.info(`User ${user.username} authenticated successfully`);

    next();
  } catch (error) {
    logger.error({ message: 'Authentication error', error }); // Log authentication error with stack trace
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = authenticateUser;
