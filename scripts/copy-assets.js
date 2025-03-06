// scripts/copy-assets.js
const fs = require('fs');
const path = require('path');

// Fonction pour créer un répertoire s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Répertoire créé: ${directory}`);
  }
}

// Fonction pour copier un fichier
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Fichier copié: ${destination}`);
}

// Fonction pour copier récursivement un répertoire
function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

// Répertoires source et destination
const sourceDir = path.join(__dirname, '../public/assets');
const destDir = path.join(__dirname, '../public/assets');

// S'assurer que le répertoire de destination existe
ensureDirectoryExists(destDir);

// Copier les assets
console.log('Copie des assets...');
copyDirectory(sourceDir, destDir);
console.log('Copie des assets terminée!');

// Vérifier que les images des options existent
const optionsDir = path.join(destDir, 'img/options');
if (fs.existsSync(optionsDir)) {
  console.log('Répertoire des options trouvé!');
  const files = fs.readdirSync(optionsDir);
  console.log(`Nombre d'images trouvées: ${files.length}`);
  console.log('Liste des images:');
  files.forEach(file => console.log(` - ${file}`));
} else {
  console.log('Répertoire des options non trouvé!');
}
