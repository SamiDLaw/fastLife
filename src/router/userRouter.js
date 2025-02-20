// src/router/userRouter.js

const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");


userRouter.get("/login", (req, res) => {
    console.log("Accès à la page de connexion");
    res.render("pages/login.twig");
});

// Route pour traiter la connexion
userRouter.get("/login", userController.loginPage);

// Route pour traiter la connexion
userRouter.post("/login", userController.loginUser);

// Route pour la déconnexion
userRouter.get("/logout", userController.logoutUser);

// Route pour afficher la page d'inscription
userRouter.get("/register", (req, res) => {
    res.render("pages/register.twig");
});

// Route pour traiter l'inscription
userRouter.post("/register", userController.registerUser);

module.exports = userRouter;