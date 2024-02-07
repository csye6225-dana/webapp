// Add router
const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController');

router.put('/', UserController.updateUser);
router.get('/', UserController.getUser);

module.exports = router;