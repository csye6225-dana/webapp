const Logger = require('node-json-logger');
const User = require('../models/User');
const bcrypt = require('bcrypt');

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
      level: 'debug' // Set default level to debug
    }
  }
});

// Function to create a new user
const createUser = async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  // Check if required fields are missing in request body
  if (!username || !password || !firstName || !lastName) {
    logger.error('Missing required fields. Please provide username, password, firstName, and lastName.'); // Log error
    return res.status(400).json({ error: 'Missing required fields. Please provide username, password, firstName, and lastName.' });
  }

  try {
    // Create user using Sequelize model
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.warn(`${username} already exists. Please use another one.`); // Log warning
      return res.status(400).json({ error: 'The username already exists. Please use another one.' });
    }
    const newUser = await User.createUser({ username, password, firstName, lastName });
    logger.info(`User ${username} created successfully!`); // Log info
    res.status(201).json(newUser);
  } catch (error) {
    logger.error({ message: 'Error creating new user', error }); // Log error with stack trace
    res.status(500).json({ error: 'Internal server error.' });
  }
};



const updateUser = async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'password']; // Allowed fields for update
  const receivedFields = Object.keys(req.body);
  const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    logger.debug(`Invalid field(s) for update: ${invalidFields.join(', ')}`); // Log error for invalid fields
    return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
  }

  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      logger.error('User not found'); // Log error for user not found
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
      logger.error('User not found'); // Log error for user not found
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the account_updated field
    await User.update({ account_updated: new Date() }, { where: { username: req.user.username } });
    logger.info('User updated successfully'); // Log info for successful update
    return res.status(200).json({ result: "Successfully updated"});
  } catch (error) {
    logger.error({ message: 'Error updating user', error }); // Log error with stack trace
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  if (Object.keys(req.body).length > 0) {
    logger.debug('No body payload allowed'); // Log error for invalid request
    return res.status(400).json({ error: 'No body payload allowed' });
  }
  try {
    // Fetch user data from the database
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      logger.error('User not found'); // Log error for user not found
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const otherInfo = Object.assign({}, user.get());
    delete otherInfo.password;
    logger.info('User fetched successfully'); // Log info for successful fetch
    return res.status(200).json(otherInfo);
  } catch (error) {
    logger.error({ message: 'Error fetching user', error }); // Log error with stack trace
    res.status(error.status || 500).json({ error: error.message });
  }
};



module.exports = {
    createUser,
    updateUser,
    getUser
}

