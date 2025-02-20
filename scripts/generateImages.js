require('dotenv').config();
const nodeFetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

if (!PIXABAY_API_KEY) {
    console.error('❌ Erreur: La clé API Pixabay n\'est pas définie dans le fichier .env');
    process.exit(1);
}

const downloadImage = async (url, filepath) => {
    const response = await nodeFetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
};

const searchPixabay = async (query) => {
    // Encoder la requête correctement
    const encodedQuery = encodeURIComponent(query.trim());
    const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedQuery}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true&lang=fr&min_width=400&min_height=400`;
    
    console.log(`🌐 URL de l'API: ${apiUrl}`);
    
    const response = await nodeFetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 Résultats trouvés: ${data.total || 0}`);
    
    if (data.hits && data.hits.length > 0) {
        return data.hits[0].webformatURL;
    }
    return null;
};

// Optimiser les requêtes de recherche
const searchQueries = {
    // Activités
    'Sport & Fitness': 'fitness gym workout',
    'Art & Culture': 'art museum culture',
    'Nature & Plein air': 'outdoor nature activity',
    'Musique & Concerts': 'music concert live',
    'Bien-être & Détente': 'wellness spa relaxation',
    
    // Cuisine
    'Cuisine Française': 'french cuisine restaurant',
    'Cuisine Italienne': 'italian pasta restaurant',
    'Cuisine Japonaise': 'japanese sushi restaurant',
    'Cuisine Méditerranéenne': 'mediterranean food',
    'Street Food': 'street food market',
    
    // Sports
    'Sports nautiques': 'water sports surfing',
    'Randonnée': 'hiking mountains nature',
    'Vélo': 'cycling bike sport',
    'Escalade': 'rock climbing sport',
    
    // Culture
    'Musées et expositions': 'museum art gallery',
    'Théâtre et spectacles': 'theater stage performance',
    'Concerts et festivals': 'music concert festival',
    'Sites historiques': 'historical monument castle',
    
    // Ambiance
    'Décontractée': 'casual cafe lifestyle',
    'Élégante': 'elegant luxury restaurant',
    'Festive': 'party celebration',
    'Romantique': 'romantic dinner restaurant',
    'Branchée': 'trendy modern cafe',
    
    // Budget
    'Économique': 'budget friendly cafe',
    'Moyen': 'restaurant dining',
    'Premium': 'premium luxury service',
    'Luxe': 'luxury hotel restaurant',
    
    // Nature
    'Plages': 'tropical beach paradise',
    'Parcs et jardins': 'beautiful garden park',
    'Montagnes': 'mountain landscape scenic',
    'Forêts': 'forest nature trail'
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

        console.log('🔑 Utilisation de l\'API Pixabay...');
        
        for (const question of questions) {
            console.log(`\n📝 Traitement de la question: ${question.text}`);
            
            for (const option of question.options) {
                const searchQuery = searchQueries[option.text] || `${option.text} ${question.category.name}`;
                console.log(`\n🔍 Recherche d'images pour: ${searchQuery}`);

                try {
                    const imageUrl = await searchPixabay(searchQuery);
                    
                    if (imageUrl) {
                        const filename = `${option.text.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.jpg`;
                        const filepath = path.join(optionsDir, filename);

                        await downloadImage(imageUrl, filepath);
                        console.log(`✅ Image téléchargée pour ${option.text}`);

                        await prisma.option.update({
                            where: { id: option.id },
                            data: { imagePath: `/assets/img/options/${filename}` }
                        });
                    } else {
                        console.log(`⚠️ Aucune image trouvée pour ${option.text}`);
                    }
                } catch (error) {
                    console.error(`❌ Erreur pour ${option.text}:`, error.message);
                }

                // Attendre entre chaque requête pour respecter les limites de l'API
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log('\n✨ Génération des images terminée !');
    } catch (error) {
        console.error('❌ Erreur lors de la génération des images:', error);
    } finally {
        await prisma.$disconnect();
    }
};

generateOptionImages();
