const express = require("express");
const locationRouter = express.Router();
const locationController = require('../controllers/locationController');

// Route pour afficher la carte
locationRouter.get('/', locationController.getMap);

module.exports = locationRouter;