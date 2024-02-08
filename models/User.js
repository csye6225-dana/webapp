const DataTypes = require('sequelize');
const sequelize = require('../connection');
const bcrypt = require('bcrypt');


const User = sequelize.define('User', {
  id:{
    type:DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    writeOnly: true,
    set(value) {
      // Hash the password before saving to the database
      const hashedPassword = bcrypt.hashSync(value, 15);
      this.setDataValue('password', hashedPassword);
    }
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
},{
    // exclude write-only in JSON output
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
});
// Define a method to create a new user
User.createUser = async function(userData) {
  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(userData.password, 15);
    userData.password = hashedPassword;
    
    // Create the user in the database
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};
module.exports = User;
