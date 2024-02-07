const express = require('express');
const bodyParser = require('body-parser');
const bootstrap = require('./models/User');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Middleware to handle payload 
const userRouter = require('./routes/userRouters.js')

const initializeApp = async () => {
  try {
    // Sync or migrate the database
    await bootstrap.sync({ alter: true }); 

    console.log('Database schema synchronized successfully.');
  } catch (error) {
    console.error('Error initializing app:', error.message);
  }
};


// Run the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeApp();
});
