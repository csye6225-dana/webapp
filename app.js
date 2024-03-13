const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const healthRouter = require('./routes/healthRouters.js');
const userRouter = require('./routes/userRouters.js');
const checkHealthMiddleware = require('./middlewares/checkHealthMiddleware'); // Import checkHealthMiddleware
const authenticateUser = require('./middlewares/authMiddleware.js');
const app = express();

const PORT = process.env.PORT;

app.use(bodyParser.json());

// Initializing 
const initializeApp = async () => {
  try {
    // Bootstrap the database
    await bootstrap.sync({ alter: true }); 
    console.log('Bootstrap the Database successfully!');
  } catch (error) {
    console.error('Error initializing app:', error.message);
  }
};

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
  console.error('Error:', err);
  res.status(err.status).json({ error: err.message });
});

// Run the server
const server = app.listen(PORT,'0.0.0.0', async () => {
  try {
    await initializeApp();
    const address = server.address(); // Get the address info
    console.log(`Running on the port:${PORT}`);
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
});
