const User = require('../models/User');

const createUser = async(req, res) => {
    try {
      // Create user using Sequelize model
        const existingUser = await User.findOne({ where: { email: process.env.USER_EMAIL } });
        if (existingUser) {
            console.log('User already exists.');
            return;
        }


      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

const  updateUser = async (req, res) => {
    // Update user using Sequelize model
    // Handle errors and send appropriate responses
  };

const getUser = async (req, res) => {
    // Fetch user using Sequelize model
    // Handle errors and send appropriate responses
};

module.exports = {
    createUser,
    updateUser,
    getUser
}

