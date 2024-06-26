const { PubSub } = require('@google-cloud/pubsub');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { writeToCloudLogging, writeToLogFile } = require('../logger');


const pubsub = new PubSub();
const topicName = 'new-user-created';

const createUser = async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  // Check if required fields are missing in request body
  if (!username || !password || !firstName || !lastName) {
    writeToLogFile('error', 'Missing required fields. Please provide username, password, firstName, and lastName.');
    return res.status(400).json({ error: 'Missing required fields. Please provide username, password, firstName, and lastName.' });
  }
  try {
    // Create user using Sequelize model
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      writeToLogFile('warn', `${username} already exists. Please use another one.`);
      return res.status(400).json({ error: 'The username already exists. Please use another one.' });
    }
    const newUser = await User.createUser({ username, password, firstName, lastName });
    
    // // Publish message to Pub/Sub topic
    // await publishMessage(newUser);

    writeToLogFile('info', `User ${username} created successfully!`);
    res.status(201).json(newUser);
  } catch (error) {
    writeToLogFile('error', `Error creating new user: ${error}`);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Function to publish message to Pub/Sub topic
// async function publishMessage(newUser) {
//   const data = JSON.stringify(newUser);
//   try {
//     await pubsub.topic(topicName).publish(Buffer.from(data));
//     writeToLogFile('info', `Message published to ${topicName}: ${data}`);
//   } catch (error) {
//     writeToLogFile('error', `Error publishing message to ${topicName}: ${error}`);
//     throw error;
//   }
// }

const updateUser = async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'password']; // Allowed fields for update
  const receivedFields = Object.keys(req.body);
  const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    writeToLogFile('debug', `Invalid field(s) for update: ${invalidFields.join(', ')}`);
    return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
  }

  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      writeToLogFile('error', 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update 
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 15);
      req.body.password = hashedPassword;
    }
    const [affectedRows] = await User.update(req.body, {
      where: { username: req.user.username }
    });

    // Check if affected 
    if (affectedRows === 0) {
      writeToLogFile('error', 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the account_updated field
    await User.update({ account_updated: new Date() }, { where: { username: req.user.username } });
    writeToLogFile('info', 'User updated successfully');
    return res.status(200).json({ result: "Successfully updated"});
  } catch (error) {
    writeToLogFile('error', `Error updating user: ${error}`);
    res.status(error.status || 500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  if (Object.keys(req.body).length > 0) {
    writeToLogFile('debug', 'No body payload allowed');
    return res.status(400).json({ error: 'No body payload allowed' });
  }
  try {
    // Fetch user data from the database
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      writeToLogFile('error', 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const otherInfo = Object.assign({}, user.get());
    delete otherInfo.password;
    writeToLogFile('info', 'User fetched successfully');
    return res.status(200).json(otherInfo);
  } catch (error) {
    writeToLogFile('error', `Error fetching user: ${error}`);
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
    createUser,
    updateUser,
    getUser
};
