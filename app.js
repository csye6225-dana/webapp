const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Initializing 
const initializeApp = async () => {
  try {
    // Boostrapping
    await bootstrap.sync({ alter: true }); 
    console.log('Boostrapping the Database successfully!');
  } catch (error) {
    console.error('Error for initializing app:\n', error.message);
  }
};



// Middleware to handle payload 
const userRouter = require('./routes/userRouters.js')
app.use('/users', userRouter);

// Run the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeApp();
});
