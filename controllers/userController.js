const User = require('../models/User');

const createUser = async(req, res) => {
  const {email, pwd, fname, lname} = req.body;
  try {
    // Create user using Sequelize model
    const existingUser = await User.findOne({ where: {email} });
    if (existingUser) {
      console.log('The email is already registered. Please use another one.');
      return res.status(400).json({error: 'The email is already registered. Please use another one.'});
    }
    const newUser = await User.createUser({email,pwd,fname,lname});
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

