const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'scr', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const locationRouter = require('./scr/router/locationRouter');

// Rediriger la racine vers la page de carte
app.get('/', (req, res) => {
    res.redirect('/map');
});

// Utiliser le routeur des locations pour /map
app.use('/map', locationRouter);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('pages/404', { title: 'Page non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});