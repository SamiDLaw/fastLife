require('dotenv').config();
const nodeFetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

// Configuration de Cloudinary si activé
const useCloudinary = process.env.USE_CLOUDINARY === 'true';
const cloudinaryBaseUrl = process.env.CLOUDINARY_BASE_URL;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configuré et activé');
    console.log(`✅ URL de base Cloudinary: ${cloudinaryBaseUrl}`);
}

if (!PIXABAY_API_KEY) {
    console.error('❌ Erreur: La clé API Pixabay n\'est pas définie dans le fichier .env');
    process.exit(1);
}

const downloadImage = async (url, filepath) => {
    try {
        const response = await nodeFetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const buffer = await response.buffer();
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Image téléchargée avec succès vers: ${filepath}`);
        return filepath;
    } catch (error) {
        console.error(`❌ Erreur lors du téléchargement de l'image:`, error);
        return null;
    }
};

// Fonction pour télécharger une image vers Cloudinary
const uploadToCloudinary = async (filepath, publicId) => {
    if (!useCloudinary) return null;
    
    try {
        const result = await cloudinary.uploader.upload(filepath, {
            public_id: `options/${publicId}`,
            folder: 'options',
            overwrite: true
        });
        console.log(`✅ Image téléchargée sur Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Erreur lors du téléchargement sur Cloudinary:`, error);
        return null;
    }
};

// Fonction pour construire un chemin Cloudinary correct (sans double slash)
const buildCloudinaryPath = (baseUrl, filename) => {
    // S'assurer que l'URL Cloudinary n'a pas de double slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/options/${filename}`;
};

// Fonction pour normaliser le texte et obtenir un nom de fichier
const normalizeText = (text) => {
    return text.toLowerCase()
        .replace(/\s+/g, '_')                // Remplacer les espaces par des underscores
        .normalize("NFD")                    // Décomposer les caractères accentués
        .replace(/[\u0300-\u036f]/g, "")    // Supprimer les accents
        .replace(/[^a-z0-9_]/g, "");       // Ne garder que les caractères alphanumériques et underscores
};

const searchPixabay = async (query) => {
    try {
        // Encoder la requête correctement
        const encodedQuery = encodeURIComponent(query.trim());
        const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedQuery}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true&lang=fr&min_width=400&min_height=400`;
        
        console.log(`🔍 Recherche pour: "${query}"`);
        
        const response = await nodeFetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`📊 Résultats trouvés: ${data.total || 0}`);
        
        if (data.hits && data.hits.length > 0) {
            // Prendre la première image de haute qualité
            return data.hits[0].largeImageURL || data.hits[0].webformatURL;
        }
        return null;
    } catch (error) {
        console.error(`❌ Erreur lors de la recherche Pixabay:`, error);
        return null;
    }
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
        console.log(`🖼️ Mode de stockage: ${useCloudinary ? 'Cloudinary' : 'Local'}`);
        
        // Table de correspondance pour les cas spéciaux avec accents
        const specialCases = {
            'Économique': 'economique',
            'Élégante': 'elegante',
            'Bars et cafés': 'bars_et_cafes',
            'Bien-être & Détente': 'bien_etre_detente',
            'Branchée': 'branchee',
            'Cuisine Française': 'cuisine_francaise',
            'Cuisine Méditerranéenne': 'cuisine_mediterraneenne',
            'Décontractée': 'decontractee',
            'Forêts': 'forets',
            'Musées et expositions': 'musees_et_expositions',
            'Randonnée': 'randonnee',
            'Théâtre et spectacles': 'theatre_et_spectacles',
            'Vélo': 'velo'
        };
        
        for (const question of questions) {
            console.log(`\n📝 Traitement de la question: ${question.text}`);
            
            for (const option of question.options) {
                const searchQuery = searchQueries[option.text] || `${option.text} ${question.category.name}`;
                console.log(`\n🔍 Recherche d'images pour: ${option.text} (${searchQuery})`);

                try {
                    const imageUrl = await searchPixabay(searchQuery);
                    
                    if (imageUrl) {
                        // Utiliser le cas spécial s'il existe, sinon normaliser le texte
                        const baseFilename = specialCases[option.text] || normalizeText(option.text);
                        const filename = `${baseFilename}.jpg`;
                        const filepath = path.join(optionsDir, filename);
                        const publicId = baseFilename;

                        const downloadedPath = await downloadImage(imageUrl, filepath);
                        if (!downloadedPath) {
                            console.log(`⚠️ Échec du téléchargement pour ${option.text}, passage à l'option suivante`);
                            continue;
                        }

                        // Chemin local par défaut
                        let finalPath = `/assets/img/options/${filename}`;

                        // Si Cloudinary est activé, télécharger l'image
                        if (useCloudinary) {
                            const cloudinaryUrl = await uploadToCloudinary(filepath, publicId);
                            if (cloudinaryUrl) {
                                finalPath = cloudinaryUrl;
                            } else {
                                // Fallback: construire un chemin Cloudinary correct manuellement
                                finalPath = buildCloudinaryPath(cloudinaryBaseUrl, filename);
                            }
                        }

                        await prisma.option.update({
                            where: { id: option.id },
                            data: { imagePath: finalPath }
                        });
                        
                        console.log(`✅ Option ${option.id} (${option.text}) mise à jour avec le chemin: ${finalPath}`);
                    } else {
                        console.log(`⚠️ Aucune image trouvée pour ${option.text}`);
                    }
                } catch (error) {
                    console.error(`❌ Erreur pour ${option.text}:`, error.message);
                }

                // Attendre entre chaque requête pour respecter les limites de l'API
                await new Promise(resolve => setTimeout(resolve, 500));
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
