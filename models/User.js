const Logger = require('node-json-logger');
const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
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
      level: 'info'
    }
  }
});

// Define User table
const User = sequelize.define('User', {
  id:{
    type:DataTypes.STRING,
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
},{
  timestamps:false
});

// Create a new user
User.createUser = async function(userData) {
  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(userData.password, 15);
    userData.password = hashedPassword;
    const newUser = await User.create(userData);

    // Log user creation info
    logger.info(`User ${newUser.username} created successfully`);

    // Exclude write-only fields in JSON output
    const otherInfo = Object.assign({}, newUser.get());
    delete otherInfo.password;
    return otherInfo;
  } catch (error) {
    // Log error creating user with stack trace
    logger.error('Error creating user:', error);
    throw new Error('Error creating user: ' + error.message);
  }
};

// Validate a password
User.prototype.validPWD = async function(password){
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
