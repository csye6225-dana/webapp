const { User } = require('../models');

const createUser = async(req, res) => {
    try {
      // Create user using Sequelize model
      const user = await User.create(req.body);
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