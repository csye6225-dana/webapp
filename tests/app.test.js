// app.test.js

const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../app');

// Use a test database
const testConfig = {
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

describe('API Endpoints', () => {
  let connection;

  beforeAll(async () => {
    // Create a connection to the test database
    connection = await mysql.createConnection(testConfig);
  });

  afterAll(async () => {
    // Close the connection after all tests are done
    await connection.end();
  });

  test('GET /healthz - success', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' }); // Assuming your health check endpoint returns `{ status: 'ok' }`
  });

  // Add more test cases as needed
});
