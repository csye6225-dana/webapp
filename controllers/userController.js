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


const updateUser = async (req, res) => {
  const allowedFields = ['username','firstName', 'lastName', 'password']; // Allowed fields for update
  const receivedFields = Object.keys(req.body);
  
  // Check if any received field is not in the allowed fields
  const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
  }
  
  try {
    // Ensure the user can only update their own account information
    if (req.user.username !== req.body.username) {
      return res.status(403).json({ error: "You are not allowed to update another user's account information" });
    }
    
    // Update the user's account information
    const updatedUser = await User.update(req.body, {
      where: { username: req.user.username },
      returning: true // Get the updated user object
    });

    // Check if any rows were affected by the update
    if (updatedUser[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the account_updated field
    await User.update({ account_updated: new Date() }, { where: { username: req.user.username } });

    // Return the updated user object
    res.json(updatedUser[1][0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUser = async (req, res) => {
  try {
    if (req.body.username !== req.user.username) {
      return res.status(403).json({ error: "You are not allowed to access another user's account information" });
    }

    // Fetch user data from the database
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information before sending the response
    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      account_created: user.account_created,
      account_updated: user.account_updated
    };
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
    createUser,
    updateUser,
    getUser
}

