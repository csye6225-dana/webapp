const bcrypt = require('bcrypt');

 const createUser = async (req, res) => {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;

      // Create user using Sequelize model
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
 };



module.exports = {createUser}