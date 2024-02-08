// Add router
const express = require('express')
const router = express.Router()
const authenticateUser = require('../authMiddleware');
const UserController = require('../controllers/userController');

router.post('/user/self', UserController.createUser);
router.put('/user/self', authenticateUser, UserController.updateUser);
router.get('/user/self', UserController.getUser);

module.exports = router;