require('dotenv').config();


// database.js
const Sequelize = require('sequelize');
const sequelize = new Sequelize('cyse6225',process.env.DB_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});

module.exports = sequelize;
