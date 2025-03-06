// scripts/check-images.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Vérification des chemins d\'images...');
    
    // Répertoire des images
    const imagesDir = path.join(__dirname, '../public/assets/img/options');
    
    // Vérifier si le répertoire existe
    if (!fs.existsSync(imagesDir)) {
      console.error(`Le répertoire des images ${imagesDir} n'existe pas!`);
      return;
    }
    
    // Lister les fichiers d'images disponibles
    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
      .map(file => file.toLowerCase());
    
    console.log(`Nombre d'images disponibles: ${imageFiles.length}`);
    console.log('Images disponibles:', imageFiles);
    
    // Récupérer toutes les options avec leurs chemins d'images
    const options = await prisma.option.findMany();
    console.log(`Nombre d'options dans la base de données: ${options.length}`);
    
    // Vérifier chaque option
    for (const option of options) {
      console.log(`Option: ${option.text}`);
      
      // Normaliser le texte pour générer un nom de fichier
      let normalizedText = option.text
        .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") // Supprimer les accents
        .toLowerCase().replace(/\\s+/g, '_'); // Mettre en minuscule et remplacer les espaces
      
      // Générer le nom de fichier attendu
      const expectedFileName = `${normalizedText}.jpg`;
      
      // Vérifier si l'image existe
      if (imageFiles.includes(expectedFileName.toLowerCase())) {
        console.log(`✅ Image trouvée pour l'option "${option.text}": ${expectedFileName}`);
      } else {
        console.log(`❌ Image NON trouvée pour l'option "${option.text}": ${expectedFileName}`);
        
        // Essayer de trouver une correspondance partielle
        const possibleMatches = imageFiles.filter(file => 
          file.includes(normalizedText.toLowerCase()) || 
          normalizedText.toLowerCase().includes(file.replace('.jpg', ''))
        );
        
        if (possibleMatches.length > 0) {
          console.log(`   Correspondances possibles: ${possibleMatches.join(', ')}`);
        }
      }
      
      // Vérifier si l'option a un chemin d'image défini
      if (option.imagePath) {
        const imageFileName = option.imagePath.split('/').pop();
        if (imageFiles.includes(imageFileName.toLowerCase())) {
          console.log(`✅ L'image définie dans la base de données existe: ${imageFileName}`);
        } else {
          console.log(`❌ L'image définie dans la base de données N'EXISTE PAS: ${imageFileName}`);
        }
      } else {
        console.log(`⚠️ Aucun chemin d'image défini pour cette option dans la base de données`);
      }
      
      console.log('---');
    }
    
    console.log('Vérification terminée!');
  } catch (error) {
    console.error('Erreur lors de la vérification des chemins d\'images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
