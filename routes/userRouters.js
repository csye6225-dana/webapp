// Add router
const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController');

router.post('/user/self', UserController.createUser);
router.put('/user/self', UserController.updateUser);
router.get('/user/self', UserController.getUser);

module.exports = router;