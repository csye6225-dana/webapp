const Logger = require('node-json-logger');
const sequelize = require('../connection');

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

const checkHealth = async (req, res) => {
  try {
    // Check database connectivity
    await sequelize.authenticate();
    logger.info('Database connection succeed!'); // Log info for successful connection

    // Add warning if there are any sequelize warnings
    if (sequelize?.showWarnings?.length > 0) {
      logger.warn(`Sequelize Warnings: ${JSON.stringify(sequelize.showWarnings)}`);
    }

    res.status(200).header('Cache-Control', 'no-cache').send();
  } catch (error) {
    logger.error({ message: 'Database connection error', error }); // Log error for connection error with stack trace

    // Add warning for specific error conditions, if necessary
    if (error instanceof Sequelize.TimeoutError) {
      logger.warn('Database connection timeout'); // Log warning for connection timeout
    }

    res.status(503).header('Cache-Control', 'no-cache').send();
  }
};

module.exports = { checkHealth };
