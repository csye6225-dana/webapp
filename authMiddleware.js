const basicAuth = require('basic-auth');
const User = require('./models/User');

const authenticateUser = async (req, res, next) => {
  
  const credentials = basicAuth(req);
  if (!credentials || !credentials.name || !credentials.pass) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    // Find user by username
    const user = await User.findOne({ where: { username: credentials.name } });
    if (!user || !user.validPassword(credentials.pass)) {
      res.status(401).json({ error: 'Unauthorized user' });
      return;
    }
    // Set req.user with user information
    req.user = {
      id: user.id,
      username: user.username,
      // Add other user properties as needed
    };
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateUser;
