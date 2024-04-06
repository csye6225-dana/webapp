const { writeToCloudLogging, writeToLogFile } = require('../logger');

const checkHealthMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    writeToLogFile('error', `Method Not Allowed: ${req.method}`); // Log error for Method Not Allowed
    writeToCloudLogging('error', `Method Not Allowed: ${req.method}`); // Log to Google Cloud Logging
    return res.status(404).header('Cache-Control', 'no-cache').send(); // Method Not Allowed
  }
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    writeToLogFile('error','Bad Request: Request contains body or parameters'); // Log error for Bad Request
    writeToCloudLogging('error', 'Bad Request: Request contains body or parameters'); // Log to Google Cloud Logging
    return res.status(400).header('Cache-Control', 'no-cache').send(); // Bad Request
  }

  // Log health check success
  writeToLogFile('info','Health check passed successfully');
  writeToCloudLogging('info', 'Health check passed successfully'); // Log to Google Cloud Logging
  
  next();
};
  
module.exports = checkHealthMiddleware;
