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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    fallthrough: true,
    index: false
}));

// Route spécifique pour les images des options
app.get('/assets/img/options/:image', (req, res) => {
    const imagePath = path.join(__dirname, 'public', 'assets', 'img', 'options', req.params.image);
    console.log(`Tentative d'accès à l'image: ${imagePath}`);
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error(`Erreur lors de l'envoi de l'image ${req.params.image}:`, err);
            res.status(404).send('Image non trouvée');
        } else {
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

// test log 
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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

// Fonction pour vérifier l'état de la base de données
async function checkDatabaseState() {
    try {
        console.log('Vérification de l\'état de la base de données...');
        
        // Vérifier les catégories
        const categoriesCount = await prisma.category.count();
        console.log(`Nombre de catégories: ${categoriesCount}`);
        
        // Vérifier les questions
        const questionsCount = await prisma.question.count();
        console.log(`Nombre de questions: ${questionsCount}`);
        
        // Vérifier les options
        const optionsCount = await prisma.option.count();
        console.log(`Nombre d'options: ${optionsCount}`);
        
        // Si aucune donnée n'est présente, exécuter le seed
        if (categoriesCount === 0 || questionsCount === 0 || optionsCount === 0) {
            console.log('Aucune donnée trouvée dans la base de données. Exécution du script de seed...');
            // Importer et exécuter le script de seed
            const seedScript = require('./prisma/seed');
            await seedScript.main();
            console.log('Script de seed exécuté avec succès!');
        } else {
            console.log('La base de données contient déjà des données.');
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