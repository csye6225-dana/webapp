const sequelize = require('../connection');
const { writeToCloudLogging, writeToLogFile } = require('../logger');


const checkHealth = async (req, res) => {
  try {
    // Check database connectivity
    await sequelize.authenticate();
    writeToLogFile('info','Database connection succeed!'); // Log info for successful connection
    writeToCloudLogging('info', 'Database connection succeed!'); // Log to Google Cloud Logging

    // Add warning if there are any sequelize warnings
    if (sequelize?.showWarnings?.length > 0) {
      writeToLogFile('warn',`Sequelize Warnings: ${JSON.stringify(sequelize.showWarnings)}`);
      writeToCloudLogging('warning', `Sequelize Warnings: ${JSON.stringify(sequelize.showWarnings)}`); // Log to Google Cloud Logging
    }

    res.status(200).header('Cache-Control', 'no-cache').send();
  } catch (error) {
    writeToLogFile('error',{ message: 'Database connection error', error }); // Log error for connection error with stack trace
    writeToCloudLogging('error', { message: 'Database connection error', error }); // Log to Google Cloud Logging

    // Add warning for specific error conditions, if necessary
    if (error instanceof Sequelize.TimeoutError) {
      writeToLogFile('warn','Database connection timeout'); // Log warning for connection timeout
      writeToCloudLogging('warning', 'Database connection timeout'); // Log to Google Cloud Logging
    }

    res.status(503).header('Cache-Control', 'no-cache').send();
  }
};

module.exports = { checkHealth };
