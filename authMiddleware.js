const basicAuth = require('basic-auth');
const User = require('./models/User');

const authenticateUser = async (req, res, next) => {
  
  const credentials = basicAuth(req);
  if (!credentials || !credentials.name || !credentials.pass) {
    return res.status(401).json({ error: 'Unauthorized' });
    
  }
  try {
    // Find user by username
    const user = await User.findOne({ where: { username: credentials.name } });
    if (!user || !user.validPWD(credentials.pass)) {
      return res.status(401).json({ error: 'Unauthorized user' });
      
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateUser;
