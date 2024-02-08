const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const app = express();
const authenticateUser = require('./authMiddleware');
const PORT = process.env.PORT || 8080;

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

// Middleware to handle payload 
const userRouter = require('./routes/userRouters.js')

// Apply authentication middleware only for GET and PUT requests
app.use('/v1', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT') {
    authenticateUser(req, res, next);
  } else {
    next();
  }
});

// Attach user router
app.use('/v1', userRouter);

// Run the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeApp();
});
