// scripts/update-image-paths.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary si activé
const useCloudinary = process.env.USE_CLOUDINARY === 'true';
if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configuré et activé');
}

// Fonction pour normaliser le texte et obtenir un nom de fichier
const normalizeText = (text) => {
  return text.toLowerCase()
    .replace(/\s+/g, '_')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

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

// Fonction pour obtenir le chemin d'image
const getImagePath = (optionText) => {
  // Vérifier si c'est un cas spécial
  if (specialCases[optionText]) {
    return `/assets/img/options/${specialCases[optionText]}`;
  }
  
  // Sinon, utiliser la normalisation standard
  return `/assets/img/options/${normalizeText(optionText)}.jpg`;
};

// Fonction pour télécharger une image vers Cloudinary
const uploadToCloudinary = async (filePath, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `options/${path.basename(fileName, path.extname(fileName))}`,
      folder: 'options',
      overwrite: true
    });
    console.log(`Image téléchargée sur Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Erreur lors du téléchargement sur Cloudinary:`, error);
    return null;
  }
};

// Fonction pour construire un chemin Cloudinary correct (sans double slash)
const buildCloudinaryPath = (baseUrl, filename) => {
  // S'assurer que l'URL Cloudinary n'a pas de double slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/options/${filename}`;
};

// Fonction principale pour mettre à jour les chemins d'image
const updateImagePaths = async () => {
  try {
    // Récupérer toutes les options
    const options = await prisma.option.findMany();
    
    // Vérifier les fichiers d'images disponibles
    const imagesDir = path.join(__dirname, '../public/assets/img/options');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const availableImages = fs.readdirSync(imagesDir);
    
    console.log(`Nombre total d'options: ${options.length}`);
    console.log(`Nombre d'images disponibles: ${availableImages.length}`);
    console.log(`Cloudinary ${useCloudinary ? 'activé' : 'désactivé'}`);
    
    // Mettre à jour chaque option
    for (const option of options) {
      // Ignorer les options qui ont déjà un chemin d'image
      if (option.imagePath) {
        console.log(`Option ${option.id} (${option.text}) a déjà un chemin d'image: ${option.imagePath}`);
        continue;
      }
      
      const imagePath = getImagePath(option.text);
      const fileName = path.basename(imagePath);
      
      // Vérifier si l'image existe
      const imageExists = availableImages.includes(fileName);
      
      if (imageExists) {
        const fullPath = path.join(imagesDir, fileName);
        let finalImagePath = imagePath;
        
        // Si Cloudinary est activé, télécharger l'image
        if (useCloudinary) {
          const cloudinaryUrl = await uploadToCloudinary(fullPath, fileName);
          if (cloudinaryUrl) {
            finalImagePath = cloudinaryUrl;
          }
        }
        
        // Mettre à jour le chemin d'image
        await prisma.option.update({
          where: { id: option.id },
          data: { imagePath: finalImagePath }
        });
        console.log(`Option ${option.id} (${option.text}) mise à jour avec le chemin: ${finalImagePath}`);
      } else {
        console.log(`⚠️ Attention: Pas d'image trouvée pour l'option ${option.id} (${option.text})`);
        
        // Utiliser une image par défaut pour les options sans image
        const defaultImagePath = '/assets/img/options/default.jpg';
        let finalDefaultPath = defaultImagePath;
        
        // Si Cloudinary est activé et que l'image par défaut existe
        if (useCloudinary && fs.existsSync(path.join(imagesDir, 'default.jpg'))) {
          const cloudinaryUrl = await uploadToCloudinary(path.join(imagesDir, 'default.jpg'), 'default.jpg');
          if (cloudinaryUrl) {
            finalDefaultPath = cloudinaryUrl;
          }
        }
        
        await prisma.option.update({
          where: { id: option.id },
          data: { imagePath: finalDefaultPath }
        });
        console.log(`Option ${option.id} (${option.text}) mise à jour avec une image par défaut: ${finalDefaultPath}`);
      }
    }
    
    console.log('Mise à jour des chemins d\'image terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des chemins d\'image:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Exécuter la fonction principale
updateImagePaths();
