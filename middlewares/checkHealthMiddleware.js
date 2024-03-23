const Logger = require('node-json-logger');

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

const checkHealthMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    logger.error(`Method Not Allowed: ${req.method}`); // Log error for Method Not Allowed
    return res.status(405).header('Cache-Control', 'no-cache').send(); // Method Not Allowed
  }
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    logger.error('Bad Request: Request contains body or parameters'); // Log error for Bad Request
    return res.status(400).header('Cache-Control', 'no-cache').send(); // Bad Request
  }

  // Log health check success
  logger.info('Health check passed successfully');
  
  next();
};
  
module.exports = checkHealthMiddleware;
