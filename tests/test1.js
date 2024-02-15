const axios = require('axios');

async function runIntegrationTests() {
  try {
    // Create an account
    const createUserResponse = await axios.post('http://localhost:8080/v1/user/self', {
        username: "testuser11",
        password: "testpassword",
        lastName: "lastname",
        firstName: "firstname"
    });

    // Ensure account creation was successful
    if (createUserResponse.status !== 201) {
      throw new Error('Failed to create user');
    }

    // Retrieve user data with basic authentication
    const getUserResponse = await axios.get('http://localhost:8080/v1/user/self', {
      auth: {
        username: 'testuser11',
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
