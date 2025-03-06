// src/router/preferenceRouter.js
const express = require("express");
const preferenceRouter = express.Router();
const preferenceController = require("../controllers/preferenceController");

preferenceRouter.get("/", preferenceController.getPreferencesForm);
preferenceRouter.post("/", preferenceController.savePreferences);
preferenceRouter.get("/recommendations", preferenceController.getRecommendations);

module.exports = preferenceRouter;