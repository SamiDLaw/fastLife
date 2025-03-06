const express = require("express");
const locationRouter = express.Router();
const locationController = require('../controllers/locationController');

locationRouter.get('/', locationController.getMap);
locationRouter.get('/aggregated-data', locationController.getAggregatedData);
locationRouter.get('/search', locationController.searchLocations);

module.exports = locationRouter;