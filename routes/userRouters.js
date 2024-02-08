// Add router
const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController');

router.post('/v1', UserController.createUser);
router.put('/v1', UserController.updateUser);
router.get('/v1', UserController.getUser);

module.exports = router;