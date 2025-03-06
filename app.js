const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const twig = require('twig');
const { PrismaClient } = require('@prisma/client');
const userRouter = require('./src/router/userRouter');
const preferenceRouter = require('./src/router/preferenceRouter');
const locationRouter = require('./src/router/locationRouter');
const eventRouter = require('./src/router/eventRouter');
const chatbotRouter = require('./src/router/chatbotRouter');
const authMiddleware = require('./src/middleware/auth');
const sessionMiddleware = require('./src/middleware/sessionMiddleware');

// Initialiser Prisma
const prisma = new PrismaClient();

// Charge les variables d'environnement
require('dotenv').config();

const app = express();

// Configuration de Twig
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware pour parser le JSON et les données URL-encoded
app.use(express.json({ limit: '1mb' })); // Limiter la taille des requêtes JSON
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression pour réduire la taille des réponses
const compression = require('compression');
app.use(compression());

// Middleware pour servir des fichiers statiques avec cache optimisé
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '7d', // Augmenter la durée du cache à 7 jours
    etag: true,
    lastModified: true,
    immutable: true, // Ajouter immutable pour les ressources qui ne changent pas
    fallthrough: true,
    index: false
}));

// Utiliser le module imageMapping pour les URLs d'images
const imageMapping = require('./src/utils/imageMapping');

// Route spécifique pour les images des options avec mise en cache améliorée
app.get('/assets/img/options/:image', (req, res) => {
    // Ajouter des en-têtes de cache puissants
    res.set({
        'Cache-Control': 'public, max-age=604800, immutable', // 7 jours
        'Surrogate-Control': 'public, max-age=604800',
        'Expires': new Date(Date.now() + 604800000).toUTCString()
    });
    
    const imagePath = path.join(__dirname, 'public', 'assets', 'img', 'options', req.params.image);
    
    // En production, ne pas logger chaque accès aux images
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Tentative d'accès à l'image: ${imagePath}`);
    }
    
    res.sendFile(imagePath, (err) => {
        if (err) {
            // Logger uniquement les erreurs, même en production
            console.error(`Erreur lors de l'envoi de l'image ${req.params.image}:`, err);
            res.status(404).send('Image non trouvée');
        } else if (process.env.NODE_ENV !== 'production') {
            console.log(`Image servie avec succès: ${req.params.image}`);
        }
    });
});

// Utilisation de CORS
app.use(cors());

// Configuration de la session
app.use(session({
    secret: 'AJziosDOEOE_9DSsjz6N_SNZsooI',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Middleware pour stocker l'ID utilisateur dans les variables locales
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    next();
});

// Middleware de session pour toutes les routes
app.use(sessionMiddleware);

// Routes publiques
app.use('/', userRouter);
app.use('/api', locationRouter);
app.use('/', chatbotRouter);

// Routes protégées
app.use(authMiddleware);
app.use('/preferences', preferenceRouter);
app.use('/map', locationRouter);
app.use('/events', eventRouter);

// Middleware de logging optimisé pour la production
app.use((req, res, next) => {
    // Ne logger que les requêtes importantes en production
    if (process.env.NODE_ENV !== 'production' || 
        !req.url.startsWith('/assets/') && !req.url.startsWith('/public/')) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Route par défaut
app.get('/', (req, res) => {
    res.redirect('/map');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).render('pages/error', {
        message: "Page non trouvée",
        error: "La page que vous recherchez n'existe pas."
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// Fonction pour vérifier l'état de la base de données de manière optimisée
async function checkDatabaseState() {
    try {
        console.log('Vérification de l\'état de la base de données...');
        
        // Optimisation: vérifier uniquement le nombre de catégories pour déterminer si le seed est nécessaire
        // Cela réduit le nombre de requêtes à la base de données
        const categoriesCount = await prisma.category.count();
        
        // Si aucune catégorie n'est présente, exécuter le seed
        if (categoriesCount === 0) {
            console.log('Aucune donnée trouvée dans la base de données. Exécution du script de seed...');
            // Importer et exécuter le script de seed
            const seedScript = require('./prisma/seed');
            await seedScript.main();
            console.log('Script de seed exécuté avec succès!');
        } else {
            console.log(`Base de données initialisée avec ${categoriesCount} catégories.`);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la base de données:', error);
    }
}

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    
    // Vérifier l'état de la base de données au démarrage
    await checkDatabaseState();
});

module.exports = app;