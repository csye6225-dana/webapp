const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User.js');
const healthRouter = require('./routes/healthRouters.js');
const userRouter = require('./routes/userRouters.js');
const checkHealthMiddleware = require('./models/checkHealthMiddleware.js');
const authenticateUser = require('./middlewares/authMiddleware.js');
const { writeToCloudLogging, writeToLogFile } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


// Attach health router with health check middleware
app.use('/healthz', checkHealthMiddleware, healthRouter);
// Attach user router
app.use('/v1/user', userRouter);
// Authentication middleware for GET and PUT request
app.use('/v1/user', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT') {
    authenticateUser(req, res, next);
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorMessage = `[ERROR] ${err.message}\n${err.stack}`;
  console.error(errorMessage); // Log error with stack trace
  writeToLogFile('error', errorMessage);
  writeToCloudLogging('error', errorMessage);
  res.status(err.status || 500).json({ error: err.message });
});

// Run the server
const server = app.listen(PORT, '0.0.0.0', async () => {
  try {
    // Bootstrap the database
    await bootstrap.sync({ alter: true });
    console.log('Bootstrap the Database successfully!!'); // Log initialization success
    writeToLogFile('info', 'Bootstrap the Database successfully!!');
    writeToCloudLogging('info', 'Bootstrap the Database successfully!!');
  } catch (error) {
    console.error(`Error initializing app: ${error.message}`); // Log initialization error
    writeToLogFile('debug', `Error initializing app: ${error.message}`);
    writeToCloudLogging('debug', `Error initializing app: ${error.message}`);
  }
  console.log(`Running on the port: ${PORT}`); // Log server startup
  writeToLogFile('info', `Running on the port: ${PORT}`);
  writeToCloudLogging('info', `Running on the port: ${PORT}`);
});
