const DataTypes = require('sequelize');
const sequelize = require('../connection');
const bcrypt = require('bcrypt');


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
  },
  lastName: {
    type: DataTypes.STRING,
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

// Define a method to create a new user
User.createUser = async function(userData) {
  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(userData.password, 15);
    userData.password = hashedPassword;
    const newUser = await User.create(userData);

    // exclude write-only in JSON output
    const otherInfo = Object.assign({}, newUser.get());
    delete otherInfo.password;
    return otherInfo;
      
    //return error;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};
module.exports = User;
