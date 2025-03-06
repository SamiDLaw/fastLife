// scripts/updateUnsplashImages.js
require('dotenv').config();
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const unsplash = createApi({
    accessKey: process.env.UNSPLASH_API_KEY,
    fetch: nodeFetch,
});

async function updateLocationImages() {
    try {
        // Récupérer toutes les locations sans image
        const locations = await prisma.location.findMany({
            where: {
                OR: [
                    { imageUrl: null },
                    { imageUrl: '' }
                ]
            }
        });

        console.log(`Mise à jour des images pour ${locations.length} lieux...`);

        for (const location of locations) {
            try {
                // Rechercher une photo sur Unsplash
                const searchResults = await unsplash.search.getPhotos({
                    query: `${location.name} ${location.type}`,
                    orientation: 'landscape',
                    perPage: 1
                });

                if (searchResults.response?.results?.length > 0) {
                    const photo = searchResults.response.results[0];
                    const imageUrl = photo.urls.regular;

                    // Mettre à jour l'URL de l'image dans la base de données
                    await prisma.location.update({
                        where: { id: location.id },
                        data: { imageUrl }
                    });

                    console.log(`✓ Image mise à jour pour ${location.name}`);
                } else {
                    console.log(`⚠ Aucune image trouvée pour ${location.name}`);
                }

                // Attendre 1 seconde entre chaque requête pour respecter la limite d'API
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Erreur lors de la mise à jour de l'image pour ${location.name}:`, error);
            }
        }

        console.log('Mise à jour des images terminée !');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des images:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateLocationImages();
