// main.js
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./connection');

const app = express();
const PORT = process.env.PORT || 8888;

app.use(bodyParser.json());

// Middleware to handle payload 
app.use('/healthz', (req, res, next) => {
    if (req.headers['content-length'] > 0) {
        return res.status(400).header('Cache-Control', 'no-cache').send(); // Bad Request
      }
    if (req.method !== 'GET') {
    return res.status(405).header('Cache-Control', 'no-cache').send(); // Method Not Allowed
    }
  
  next();
});

// Health Check Endpoint
app.get('/healthz', async (req, res) => {
  try {
    // Check database connectivity
    await sequelize.authenticate();
    res.status(200).header('Cache-Control', 'no-cache').send();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).header('Cache-Control', 'no-cache').send();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
