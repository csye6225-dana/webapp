const express = require('express');
const router = express.Router();
const checkHealthMiddleware = require('../models/checkHealthMiddleware');
const healthController = require('../controllers/healthController');

router.get('/', checkHealthMiddleware, healthController.checkHealth);

module.exports = router;
