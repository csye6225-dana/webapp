const User = require('../models/User');

//when use Post, create a new user
const createUser = async (req, res) => {
  const {username, password, firstName, lastName } = req.body;
  try {
    // Create user using Sequelize model
    const existingUser = await User.findOne({ where: {username} });
    if (existingUser) {
      console.log(username, 'already exists. Please use another one.');
      return res.status(400).json({ error: 'The email address already exists. Please use another one.' });
    }
    const newUser = await User.createUser({username, password, firstName, lastName});
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating new user', error);
    res.status(500).json({ error: error.message });
  }
};


const  updateUser = async (req, res) => {
    // Update user using Sequelize model
    // Handle errors and send appropriate responses
  };

const getUser = async (req, res) => {
    res.status(200);
};

module.exports = {
    createUser,
    updateUser,
    getUser
}

