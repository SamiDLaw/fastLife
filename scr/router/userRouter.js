const express = require("express");
const userRouter = express.Router();
const userController = require('../controllers/userController');

// Route pour obtenir tous les utilisateurs
userRouter.get('/', userController.getAllUsers);

// Ajouter d'autres routesroutes
userRouter.post('/register', userController.registerUser);
userRouter.post('/login', userController.loginUser);
userRouter.get('/:id', userController.getUserById);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);

module.exports = userRouter;