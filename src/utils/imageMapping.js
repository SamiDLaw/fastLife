// src/utils/imageMapping.js
/**
 * Mapping entre les textes des options et les noms de fichiers d'images
 * Clé: Texte de l'option (tel qu'il apparaît dans la base de données)
 * Valeur: URL de l'image (locale ou sur CDN)
 */

// Déterminer si on utilise Cloudinary ou les fichiers locaux
const useCloudinary = process.env.USE_CLOUDINARY === 'true';
const cloudinaryBaseUrl = process.env.CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/your-cloud-name/image/upload/';

// Fonction pour générer l'URL d'une image
const getImageUrl = (localPath) => {
  if (!useCloudinary) return localPath;
  
  // Extraire le nom du fichier du chemin local
  const fileName = localPath.split('/').pop().split('.')[0];
  return `${cloudinaryBaseUrl}v1/fastlife/${fileName}`;
};

const imageMapping = {
    // Activités
    'Sport & Fitness': '/assets/img/options/sports.jpg',
    'Art & Culture': '/assets/img/options/art_culture.jpg',
    'Nature & Plein air': '/assets/img/options/nature.jpg',
    'Musique & Concerts': '/assets/img/options/music.jpg',
    'Bien-être & Détente': '/assets/img/options/wellness.jpg',
    
    // Ambiance
    'Décontractée': '/assets/img/options/casual.jpg',
    'Élégante': '/assets/img/options/elegant.jpg',
    'Festive': '/assets/img/options/festive.jpg',
    'Romantique': '/assets/img/options/romantic.jpg',
    'Branchée': '/assets/img/options/trendy.jpg',
    
    // Budget
    'Économique': '/assets/img/options/budget.jpg',
    'Moyen': '/assets/img/options/moderate.jpg',
    'Premium': '/assets/img/options/premium.jpg',
    'Luxe': '/assets/img/options/luxury.jpg',
    
    // Cuisine
    'Cuisine Française': '/assets/img/options/french_cuisine.jpg',
    'Cuisine Italienne': '/assets/img/options/italian_cuisine.jpg',
    'Cuisine Japonaise': '/assets/img/options/japanese_cuisine.jpg',
    'Cuisine Méditerranéenne': '/assets/img/options/mediterranean_cuisine.jpg',
    'Street Food': '/assets/img/options/street_food.jpg',
    
    // Activités culturelles
    'Musées et expositions': '/assets/img/options/art_culture.jpg',
    'Théâtre et spectacles': '/assets/img/options/art_culture.jpg',
    'Concerts et festivals': '/assets/img/options/music.jpg',
    'Sites historiques': '/assets/img/options/art_culture.jpg',
    
    // Sports
    'Sports nautiques': '/assets/img/options/sports.jpg',
    'Randonnée': '/assets/img/options/nature.jpg',
    'Vélo': '/assets/img/options/sports.jpg',
    'Escalade': '/assets/img/options/sports.jpg',
    
    // Gastronomie
    'Restaurants gastronomiques': '/assets/img/options/restaurants_gastronomiques.jpg',
    'Cuisine locale traditionnelle': '/assets/img/options/cuisine_locale_traditionnelle.jpg',
    'Street food': '/assets/img/options/street_food.jpg',
    'Bars et cafés': '/assets/img/options/bars_et_caf_s.jpg',
    
    // Nature
    'Plages': '/assets/img/options/plages.jpg',
    'Parcs et jardins': '/assets/img/options/parcs_et_jardins.jpg',
    'Montagnes': '/assets/img/options/montagnes.jpg',
    'Forêts': '/assets/img/options/for_ts.jpg'
};

module.exports = imageMapping;
module.exports.getImageUrl = getImageUrl;
