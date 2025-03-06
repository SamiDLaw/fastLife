// scripts/copy-images.js
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
  try {
    fs.copyFileSync(source, destination);
    console.log(`Fichier copié: ${destination}`);
  } catch (error) {
    console.error(`Erreur lors de la copie du fichier ${source} vers ${destination}:`, error);
  }
}

// Répertoires source et destination
const sourceDir = path.join(__dirname, '../public/assets/img/options');
const destDir = path.join(__dirname, '../public/assets/img/options');

// S'assurer que le répertoire de destination existe
ensureDirectoryExists(destDir);

// Vérifier si le répertoire source existe
if (!fs.existsSync(sourceDir)) {
  console.error(`Le répertoire source ${sourceDir} n'existe pas!`);
  process.exit(1);
}

// Lister les fichiers dans le répertoire source
console.log(`Lecture du répertoire source: ${sourceDir}`);
const files = fs.readdirSync(sourceDir);
console.log(`Nombre de fichiers trouvés: ${files.length}`);

// Copier chaque fichier
console.log('Copie des fichiers...');
for (const file of files) {
  if (file === '.DS_Store') continue; // Ignorer les fichiers système macOS
  
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  // Vérifier si c'est un fichier
  const stats = fs.statSync(sourcePath);
  if (stats.isFile()) {
    copyFile(sourcePath, destPath);
  }
}

console.log('Copie des fichiers terminée!');

// Vérifier les fichiers dans le répertoire de destination
console.log(`Vérification du répertoire de destination: ${destDir}`);
const destFiles = fs.readdirSync(destDir).filter(file => file !== '.DS_Store');
console.log(`Nombre de fichiers dans le répertoire de destination: ${destFiles.length}`);
