// src/middleware/sessionMiddleware.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    res.locals.isAuthenticated = false;
    res.locals.user = null;

    if (req.session && req.session.userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.session.userId }
            });
            
            if (user) {
                res.locals.isAuthenticated = true;
                res.locals.user = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    preferencesSet: user.preferencesSet
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
    }
    
    next();
};
