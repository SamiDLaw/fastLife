// src/utils/imageMapping.js
/**
 * Mapping entre les textes des options et les noms de fichiers d'images
 * Clé: Texte de l'option (tel qu'il apparaît dans la base de données)
 * Valeur: Nom du fichier d'image (sans le chemin)
 */
const imageMapping = {
    // Activités
    'Sport & Fitness': 'sport_fitness.jpg',
    'Art & Culture': 'art_culture.jpg',
    'Nature & Plein air': 'nature_plein_air.jpg',
    'Musique & Concerts': 'musique_concerts.jpg',
    'Bien-être & Détente': 'bien_etre_d_tente.jpg',
    
    // Ambiance
    'Décontractée': 'd_contract_e.jpg',
    'Élégante': '_l_gante.jpg',
    'Festive': 'festive.jpg',
    'Romantique': 'romantique.jpg',
    'Branchée': 'branch_e.jpg',
    
    // Budget
    'Économique': '_conomique.jpg',
    'Moyen': 'moyen.jpg',
    'Premium': 'premium.jpg',
    'Luxe': 'luxe.jpg',
    
    // Cuisine
    'Cuisine Française': 'cuisine_fran_aise.jpg',
    'Cuisine Italienne': 'cuisine_italienne.jpg',
    'Cuisine Japonaise': 'cuisine_japonaise.jpg',
    'Cuisine Méditerranéenne': 'cuisine_m_diterran_enne.jpg',
    'Street Food': 'street_food.jpg',
    
    // Activités culturelles
    'Musées et expositions': 'mus_es_et_expositions.jpg',
    'Théâtre et spectacles': 'th_tre_et_spectacles.jpg',
    'Concerts et festivals': 'concerts_et_festivals.jpg',
    'Sites historiques': 'sites_historiques.jpg',
    
    // Sports
    'Sports nautiques': 'sports_nautiques.jpg',
    'Randonnée': 'randonn_e.jpg',
    'Vélo': 'v_lo.jpg',
    'Escalade': 'escalade.jpg',
    
    // Gastronomie
    'Restaurants gastronomiques': 'restaurants_gastronomiques.jpg',
    'Cuisine locale traditionnelle': 'cuisine_locale_traditionnelle.jpg',
    'Street food': 'street_food.jpg',
    'Bars et cafés': 'bars_et_caf_s.jpg',
    
    // Nature
    'Plages': 'plages.jpg',
    'Parcs et jardins': 'parcs_et_jardins.jpg',
    'Montagnes': 'montagnes.jpg',
    'Forêts': 'for_ts.jpg'
};

module.exports = imageMapping;
