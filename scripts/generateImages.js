require('dotenv').config();
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    fetch: nodeFetch,
});

const downloadImage = async (url, filepath) => {
    const response = await nodeFetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
};

const generateOptionImages = async () => {
    try {
        const questions = await prisma.question.findMany({
            include: {
                options: true,
                category: true,
            },
        });

        const optionsDir = path.join(__dirname, '..', 'public', 'assets', 'img', 'options');
        if (!fs.existsSync(optionsDir)) {
            fs.mkdirSync(optionsDir, { recursive: true });
        }

        for (const question of questions) {
            for (const option of question.options) {
                const searchQuery = `${option.text} ${question.category.name}`;
                console.log(`Recherche d'images pour: ${searchQuery}`);

                try {
                    const result = await unsplash.search.getPhotos({
                        query: searchQuery,
                        perPage: 1,
                        orientation: 'landscape',
                    });

                    if (result.response?.results?.length > 0) {
                        const photo = result.response.results[0];
                        const imageUrl = photo.urls.regular;
                        const filename = `${option.text.toLowerCase().replace(/\s+/g, '_')}.jpg`;
                        const filepath = path.join(optionsDir, filename);

                        await downloadImage(imageUrl, filepath);
                        console.log(`✓ Image téléchargée pour ${option.text}`);

                        // Mettre à jour le chemin de l'image dans la base de données
                        await prisma.option.update({
                            where: { id: option.id },
                            data: { imagePath: `/assets/img/options/${filename}` }
                        });
                    }
                } catch (error) {
                    console.error(`Erreur lors du téléchargement de l'image pour ${option.text}:`, error);
                }

                // Attendre un peu pour respecter la limite de l'API
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log('Génération des images terminée !');
    } catch (error) {
        console.error('Erreur lors de la génération des images:', error);
    } finally {
        await prisma.$disconnect();
    }
};

generateOptionImages();
