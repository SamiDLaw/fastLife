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

        // Récupérer toutes les questions avec leurs options
        const allQuestions = await prisma.question.findMany({
            include: {
                options: {
                    take: 3, // Limite stricte à 3 options par question
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

        // Fonction pour mapper les noms d'options aux noms de fichiers existants
        const getImagePath = (optionText) => {
            // Table de correspondance pour les cas spéciaux
            const specialCases = {
                'Économique': '_conomique.jpg',
                'Élégante': '_l_gante.jpg',
                'Bars et cafés': 'bars_et_caf_s.jpg',
                'Bien-être & détente': 'bien_tre_d_tente.jpg',
                'Branchée': 'branch_e.jpg',
                'Cuisine française': 'cuisine_fran_aise.jpg',
                'Cuisine méditerranéenne': 'cuisine_m_diterran_enne.jpg',
                'Décontractée': 'd_contract_e.jpg',
                'Forêts': 'for_ts.jpg',
                'Musées et expositions': 'mus_es_et_expositions.jpg',
                'Randonnée': 'randonn_e.jpg',
                'Théâtre et spectacles': 'th_tre_et_spectacles.jpg',
                'Vélo': 'v_lo.jpg'
            };
            
            // Vérifier si c'est un cas spécial
            if (specialCases[optionText]) {
                return `/assets/img/options/${specialCases[optionText]}`;
            }
            
            // Sinon, utiliser la normalisation standard
            const normalizedText = optionText.toLowerCase()
                .replace(/\s+/g, '_')                // Remplacer les espaces par des underscores
                .normalize("NFD")                    // Décomposer les caractères accentués
                .replace(/[\u0300-\u036f]/g, "");   // Supprimer les accents
                
            return `/assets/img/options/${normalizedText}.jpg`;
        };

        // Vérifier si Cloudinary est activé
        const useCloudinary = process.env.USE_CLOUDINARY === 'true';
        const cloudinaryBaseUrl = process.env.CLOUDINARY_BASE_URL;

        // Fonction pour obtenir le chemin Cloudinary si activé
        const getCloudinaryPath = (localPath) => {
            if (!useCloudinary || !cloudinaryBaseUrl) return localPath;
            
            // Extraire le nom du fichier du chemin local
            const fileName = localPath.split('/').pop();
            
            // S'assurer que l'URL Cloudinary n'a pas de double slash
            // Supprimer le slash final de cloudinaryBaseUrl s'il existe
            const baseUrl = cloudinaryBaseUrl.endsWith('/') 
                ? cloudinaryBaseUrl.slice(0, -1) 
                : cloudinaryBaseUrl;
                
            // Construire le chemin Cloudinary
            return `${baseUrl}/options/${fileName}`;
        };
        
        // Ajouter les images pour chaque option
        const questionsWithImages = allQuestions.map(question => ({
            ...question,
            options: question.options.map(option => {
                const localPath = option.imagePath || getImagePath(option.text);
                const finalPath = useCloudinary ? getCloudinaryPath(localPath) : localPath;
                return {
                    ...option,
                    imagePath: finalPath
                };
            })
        }));
        
        // Debug: Afficher les chemins d'images pour vérification
        console.log("Chemins d'images générés:");
        questionsWithImages.forEach(question => {
            question.options.forEach(option => {
                console.log(`Option: "${option.text}" -> Image: ${option.imagePath}`);
            });
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

        // Vérifier le nombre total de préférences
        if (preferenceIds.length > questions.length * 3) {
            return res.status(400).json({
                success: false,
                message: "Le nombre total de préférences dépasse la limite autorisée"
            });
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