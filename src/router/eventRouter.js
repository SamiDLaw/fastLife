const express = require("express");
const eventRouter = express.Router();
const eventController = require('../controllers/eventController');

// Définition des routes
eventRouter.get('/', eventController.getEvents);
eventRouter.get('/api/upcoming', eventController.getUpcomingEvents);

module.exports = eventRouter;
