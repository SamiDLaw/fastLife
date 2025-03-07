// scripts/reset-image-paths.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Fonction pour réinitialiser les chemins d'images
const resetImagePaths = async () => {
  try {
    console.log('🔄 Début de la réinitialisation des chemins d\'images...');
    
    // Réinitialiser tous les chemins d'images à null
    const result = await prisma.option.updateMany({
      data: {
        imagePath: null
      }
    });
    
    console.log(`✅ ${result.count} options ont été réinitialisées avec succès.`);
    
    // Supprimer les fichiers d'images locaux
    const imagesDir = path.join(__dirname, '../public/assets/img/options');
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      
      // Conserver default.jpg si elle existe
      for (const file of files) {
        if (file !== 'default.jpg') {
          fs.unlinkSync(path.join(imagesDir, file));
          console.log(`🗑️ Fichier supprimé: ${file}`);
        }
      }
      
      console.log('✅ Tous les fichiers d\'images ont été supprimés.');
    } else {
      console.log('⚠️ Le répertoire d\'images n\'existe pas, création...');
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    console.log('✅ Réinitialisation terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Exécuter la fonction principale
resetImagePaths();
