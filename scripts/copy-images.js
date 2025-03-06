// scripts/copy-images.js
const fs = require('fs');
const path = require('path');

// Fonction pour créer un répertoire s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Répertoire créé: ${directory}`);
    return true;
  }
  return false;
}

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    // Définir les permissions du fichier (lecture pour tous)
    fs.chmodSync(destination, 0o644);
    console.log(`Fichier copié et permissions définies: ${destination}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la copie du fichier ${source} vers ${destination}:`, error);
    return false;
  }
}

// Fonction pour créer un fichier image de test si nécessaire
function createTestImage(directory, filename) {
  const filePath = path.join(directory, filename);
  try {
    // Créer un fichier image de test simple (1x1 pixel transparent PNG)
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
      'base64'
    );
    fs.writeFileSync(filePath, transparentPixel);
    fs.chmodSync(filePath, 0o644);
    console.log(`Fichier image de test créé: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la création du fichier image de test ${filePath}:`, error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('Début de la copie des images...');
  
  // Répertoires source et destination
  const rootDir = path.join(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  const assetsDir = path.join(publicDir, 'assets');
  const imgDir = path.join(assetsDir, 'img');
  const optionsDir = path.join(imgDir, 'options');
  
  // Créer les répertoires s'ils n'existent pas
  ensureDirectoryExists(publicDir);
  ensureDirectoryExists(assetsDir);
  ensureDirectoryExists(imgDir);
  ensureDirectoryExists(optionsDir);
  
  // Définir les permissions des répertoires
  try {
    fs.chmodSync(publicDir, 0o755);
    fs.chmodSync(assetsDir, 0o755);
    fs.chmodSync(imgDir, 0o755);
    fs.chmodSync(optionsDir, 0o755);
    console.log('Permissions des répertoires définies avec succès');
  } catch (error) {
    console.error('Erreur lors de la définition des permissions des répertoires:', error);
  }
  
  // Créer des fichiers images de test pour les chemins qui posent problème
  const testImages = [
    'french_cuisine.jpg',
    'italian_cuisine.jpg',
    'japanese_cuisine.jpg',
    'mediterranean_cuisine.jpg',
    'street_food.jpg',
    'sports.jpg',
    'art_culture.jpg',
    'nature.jpg',
    'music.jpg',
    'wellness.jpg',
    'casual.jpg',
    'elegant.jpg',
    'festive.jpg',
    'romantic.jpg',
    'trendy.jpg',
    'budget.jpg',
    'moderate.jpg',
    'premium.jpg',
    'luxury.jpg'
  ];
  
  // Créer les images de test
  for (const image of testImages) {
    createTestImage(optionsDir, image);
  }
  
  // Copier les fichiers existants
  const sourceDir = path.join(rootDir, 'public', 'assets', 'img', 'options');
  if (fs.existsSync(sourceDir)) {
    console.log(`Lecture du répertoire source: ${sourceDir}`);
    try {
      const files = fs.readdirSync(sourceDir);
      console.log(`Nombre de fichiers trouvés: ${files.length}`);
      
      // Copier chaque fichier
      let copiedCount = 0;
      for (const file of files) {
        if (file === '.DS_Store') continue; // Ignorer les fichiers système macOS
        
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(optionsDir, file);
        
        // Vérifier si c'est un fichier
        const stats = fs.statSync(sourcePath);
        if (stats.isFile()) {
          if (copyFile(sourcePath, destPath)) {
            copiedCount++;
          }
        }
      }
      
      console.log(`${copiedCount} fichiers copiés avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la lecture du répertoire source:`, error);
    }
  } else {
    console.log(`Le répertoire source ${sourceDir} n'existe pas, utilisation des images de test uniquement`);
  }
  
  // Vérifier les fichiers dans le répertoire de destination
  try {
    const destFiles = fs.readdirSync(optionsDir).filter(file => file !== '.DS_Store');
    console.log(`Nombre de fichiers dans le répertoire de destination: ${destFiles.length}`);
    console.log('Fichiers disponibles:');
    destFiles.forEach(file => console.log(` - ${file}`));
  } catch (error) {
    console.error(`Erreur lors de la vérification du répertoire de destination:`, error);
  }
  
  console.log('Copie des images terminée!');
}

// Exécuter la fonction principale
main().catch(error => {
  console.error('Erreur lors de l\'exécution du script:', error);
  process.exit(1);
});
