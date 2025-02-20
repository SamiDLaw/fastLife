const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const twig = require('twig');
const userRouter = require('./src/router/userRouter');
const preferenceRouter = require('./src/router/preferenceRouter');
const locationRouter = require('./src/router/locationRouter');
const eventRouter = require('./src/router/eventRouter');
const authMiddleware = require('./src/middleware/auth');
const sessionMiddleware = require('./src/middleware/sessionMiddleware');

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
app.use(express.static(path.join(__dirname, 'public')));

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

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;