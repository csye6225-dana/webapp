// Add router
const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController');


router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.get('/users/:id', UserController.getUser);

module.exports = router;