// src/routes/utils.js
const express = require("express");
const router = express.Router();
const utilsController = require("../controllers/utilsController");

router.post("/bitrate", utilsController.calculateBitrate);

module.exports = router;
