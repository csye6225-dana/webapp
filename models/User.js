const { DataTypes } = require('sequelize');
const sequelize = require('./connection');

const Users = sequelize.define('Users', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  account_created: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  account_updated: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },

});

module.exports = Users;
