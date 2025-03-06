// src/controllers/preferenceController.js


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imageMapping = require('../utils/imageMapping');

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

        // Récupérer toutes les questions avec leurs options
        const allQuestions = await prisma.question.findMany({
            include: {
                options: {
                    orderBy: {
                        id: 'asc'
                    }
                },
                category: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Ajouter les images pour chaque option
        const questionsWithImages = allQuestions.map(question => ({
            ...question,
            options: question.options.map(option => {
                // Utiliser le mapping statique pour trouver l'image correspondante
                let imagePath;
                
                // Vérifier si l'option a un chemin d'image défini dans la base de données
                if (option.imagePath && option.imagePath.startsWith('/assets')) {
                    imagePath = option.imagePath;
                    console.log(`Option ${option.id} (${option.text}) utilise l'image de la base de données: ${imagePath}`);
                } 
                // Sinon, utiliser le mapping statique
                else if (imageMapping[option.text]) {
                    imagePath = `/assets/img/options/${imageMapping[option.text]}`;
                    console.log(`Option ${option.id} (${option.text}) utilise l'image du mapping: ${imagePath}`);
                } 
                // Fallback: utiliser un nom générique basé sur le texte
                else {
                    // Normaliser le texte pour générer un nom de fichier
                    let normalizedText = option.text
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
                        .toLowerCase().replace(/\s+/g, '_'); // Mettre en minuscule et remplacer les espaces
                    
                    imagePath = `/assets/img/options/${normalizedText}.jpg`;
                    console.log(`Option ${option.id} (${option.text}) utilise l'image générée par fallback: ${imagePath}`);
                }
                
                return {
                    ...option,
                    imagePath: imagePath
                };
            })
        }));
        
        // Log pour déboguer
        console.log(`Nombre de questions: ${questionsWithImages.length}`);
        questionsWithImages.forEach((q, i) => {
            console.log(`Question ${i+1}: ${q.text} - ${q.options.length} options`);
        });

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
    if (!userId) {
        return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    try {
        const { preferences } = req.body;
        
        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                success: false,
                message: "Format de données invalide"
            });
        }

        // Convertir tous les IDs en entiers
        const preferenceIds = preferences.map(id => parseInt(id)).filter(id => !isNaN(id));

        // Récupérer toutes les questions pour la validation
        const questions = await prisma.question.findMany({
            include: {
                options: true
            }
        });

        // Grouper les préférences par question
        const preferencesByQuestion = new Map();
        for (const optionId of preferenceIds) {
            const question = questions.find(q => q.options.some(o => o.id === optionId));
            if (question) {
                if (!preferencesByQuestion.has(question.id)) {
                    preferencesByQuestion.set(question.id, []);
                }
                preferencesByQuestion.get(question.id).push(optionId);
            }
        }

        // Valider que chaque question n'a pas plus de 3 choix
        for (const [questionId, questionPreferences] of preferencesByQuestion) {
            if (questionPreferences.length > 3) {
                return res.status(400).json({
                    success: false,
                    message: "Vous ne pouvez sélectionner que 3 options maximum par question"
                });
            }
        }

        // Supprimer les anciennes préférences
        await prisma.preference.deleteMany({
            where: { userId }
        });

        // Créer les nouvelles préférences
        if (preferenceIds.length > 0) {
            await prisma.preference.createMany({
                data: preferenceIds.map(optionId => ({
                    userId,
                    optionId
                }))
            });
        }

        // Marquer que l'utilisateur a défini ses préférences
        await prisma.user.update({
            where: { id: userId },
            data: { preferencesSet: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences:", error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de la sauvegarde des préférences"
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