const axios = require('axios');

async function runIntegrationTests() {
  try {
    // Create an account
    const createUserResponse = await axios.post('http://localhost:8080/v1/user', {
      username: 'testuser',
      password: 'testpassword',
      name: 'Test User'
    });

    // Ensure account creation was successful
    if (createUserResponse.status !== 200) {
      throw new Error('Failed to create user');
    }

    // Retrieve user data with basic authentication
    const getUserResponse = await axios.get('http://localhost:8080/v1/user', {
      auth: {
        username: 'testuser',
        password: 'testpassword'
      }
    });

    // Ensure user data retrieval was successful
    if (getUserResponse.status !== 200) {
      throw new Error('Failed to retrieve user data');
    }

    console.log('Integration tests passed successfully');
  } catch (error) {
    console.error('Integration tests failed:', error.message);
    process.exit(1);
  }
}

runIntegrationTests();
