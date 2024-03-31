require('dotenv').config();
const Sequelize = require('sequelize'); 
const { writeToCloudLogging, writeToLogFile } = require('./logger');


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: (message) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn', // You can adjust the level based on your requirements
        message: message
      };
      console.log(JSON.stringify(logEntry)); // Log to console

      // Log to Google Cloud Logging
      writeToCloudLogging('warn', message);

      // Write to log file
      writeToLogFile(message);
    }
  }
);

module.exports = sequelize;
