// src/middleware/auth.js
function authMiddleware(req, res, next) {
    if (req.session.userId) {
        next(); // L'utilisateur est connecté, continuez
    } else {
        res.redirect('/login'); // Redirigez vers la page de connexion
    }
}

module.exports = authMiddleware;