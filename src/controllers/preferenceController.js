// src/controllers/preferenceController.js


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getPreferencesForm = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect("/login");
    }
    try {
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: {
                preferences: {
                    include: {
                        option: true
                    }
                }
            }
        });

        const questions = await prisma.question.findMany({
            include: {
                options: true,
                category: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Ajouter les images pour chaque option
        const questionsWithImages = questions.map(question => ({
            ...question,
            options: question.options.map(option => ({
                ...option,
                imagePath: option.imagePath || `/assets/img/options/${option.text.toLowerCase().replace(/\s+/g, '_')}.jpg`
            }))
        }));

        res.render("pages/preferences.twig", {
            questions: questionsWithImages,
            isNewUser: !user.preferencesSet,
            selectedPreferences: user.preferences.map(p => p.optionId)
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        res.status(500).send("Erreur lors de la récupération des questions.");
    }
};

exports.savePreferences = async (req, res) => {
    const userId = req.session.userId;
    const preferences = req.body.preferences;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Utilisateur non connecté" 
        });
    }

    if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Veuillez sélectionner au moins une préférence par catégorie" 
        });
    }

    try {
        // Supprimer les anciennes préférences
        await prisma.preference.deleteMany({
            where: { userId: userId },
        });

        // Créer les nouvelles préférences
        const preferenceData = preferences.map(optionId => ({
            userId: userId,
            optionId: parseInt(optionId),
        }));

        await prisma.preference.createMany({
            data: preferenceData,
        });

        // Mettre à jour le statut des préférences de l'utilisateur
        await prisma.user.update({
            where: { id: userId },
            data: { preferencesSet: true }
        });

        res.json({ 
            success: true, 
            message: "Préférences enregistrées avec succès",
            redirect: "/map"
        });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des préférences :", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de l'enregistrement des préférences" 
        });
    }
};

exports.getRecommendations = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Utilisateur non connecté"
        });
    }
    try {
        const preferences = await prisma.preference.findMany({
            where: { userId: userId },
            include: {
                option: {
                    include: {
                        question: { include: { category: true } }
                    }
                }
            },
        });

        const preferredCategoryIds = [...new Set(preferences.map(pref => pref.option.question.category.id))];
        
        const events = await prisma.event.findMany({
            where: {
                categoryId: { in: preferredCategoryIds }
            },
            include: {
                category: true,
                location: true,
            },
        });

        const scoredEvents = events.map(event => ({
            ...event,
            score: preferences.filter(pref => pref.option.question.categoryId === event.categoryId).length
        }));

        const recommendedEvents = scoredEvents
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        res.json({ 
            success: true, 
            events: recommendedEvents 
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des recommandations :", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des recommandations"
        });
    }
};