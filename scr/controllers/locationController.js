const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMap = async (req, res) => {
    try {
        const locations = await prisma.location.findMany();
        res.render('pages/map', {
            locations: JSON.stringify(locations),
            title: 'Carte des Lieux',
            user: req.user // Assurez-vous que cette ligne est présente si vous gérez l'authentification
        });
    } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
        res.status(500).render('pages/error', {
            message: "Erreur lors du chargement de la carte",
            error: error
        });
    }
};