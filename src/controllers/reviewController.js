const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
    try {
        const { content, rating, placeId } = req.body;
        const userId = req.session.userId;

        const review = await prisma.review.create({
            data: {
                content,
                rating: parseInt(rating),
                userId,
                placeId: parseInt(placeId)
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Erreur lors de la création de l\'avis:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const { placeId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { placeId: parseInt(placeId) },
            include: { user: true }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
    }
};