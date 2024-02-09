const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    try {
        // Hashing function
        const hashedPassword = await bcrypt.hash(req.body.password, 15);
        req.body.password = hashedPassword;

        // Create user 
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
 };



module.exports = {createUser}