const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Check for token in request headers
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded.user;
    next();
  });
};
